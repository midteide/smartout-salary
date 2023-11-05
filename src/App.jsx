import './App.css'

function App() {
  const roundNearQtr = (number) => (Math.round(number * 4) / 4).toFixed(2)
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000)
    return this
  }
  const forceTwoDigits = (n) => n.toString().padStart(2, 0)
  const formatDateOnly = (date) => {
    const d = new Date(date)
    return `${d.getFullYear()}.${forceTwoDigits(d.getMonth() + 1)}.${forceTwoDigits(d.getDate())}`
  }
  const getString = (
    userID,
    shiftID,
    suppID,
    date,
    title,
    salaryCode,
    startTime,
    stopTime,
    nHours,
    pricePerHr,
    totAmount,
    userName,
    accountantId
  ) =>
    `${userID},${shiftID},${suppID},${date},${title},${salaryCode},${startTime},${stopTime},${nHours},${pricePerHr},${totAmount},${userName},${
      accountantId || '-'
    }`

  const calculateSalary = (dataString, getStrings = false) => {
    const retStrings = []
    if (!dataString || dataString === '""' || dataString?.length < 20) return null
    try {
      const data = JSON.parse(dataString.substring(0, dataString.length - 1).substring(1))
      const debug = getStrings
      debug && console.log('___________')
      getStrings && debug && console.log('PRINTING STRINGS')

      const isNotStartedOrTemplate = data.shiftStatus !== 1 && data.shiftStatus !== 7
      const startTime = data.start //data.records[0].start
      const endTime = data.end //data.records[0].end
      const {
        baseSalary: baseRate,
        supplements,
        records,
        userId,
        userName,
        accountantId,
        shiftID,
        status: statusMsg,
        title,
        salaryCode
      } = data
      const fixedSupplements = records.filter((item) => item.type === 'supplement')
      const fromHourToHourSupplements = supplements.filter((item) => item.type === 'fromHourToHour')
      const afterXHoursSupplements = supplements.filter((item) => item.type === 'afterXHours')
      let totalSalary = 0
      // Calculate base salary
      let start = new Date(0)
      start.setUTCSeconds(startTime)
      let shiftStart = new Date(0)
      shiftStart.setUTCSeconds(startTime)
      debug && console.log('Shift start: ', start.toString())
      let end = new Date(0)
      end.setUTCSeconds(endTime)
      debug && console.log('Shift end: ', end.toString())
      const totalWorkingTime = roundNearQtr((end - start) / 1000 / 60 / 60)
      debug && console.log('Shift length in total: ', totalWorkingTime)
      let regularHours = 0
      // Normal hours
      let normalSupplementTotal = 0
      for (let i = 0; i < totalWorkingTime; i += 0.25) {
        regularHours += 0.25
        normalSupplementTotal += baseRate * 0.25
        totalSalary += baseRate * 0.25
        start.addHours(0.25)
      }
      getStrings &&
        retStrings.push(
          getString(
            userId,
            shiftID,
            '-',
            formatDateOnly(shiftStart),
            title,
            salaryCode,
            `${forceTwoDigits(shiftStart.getHours())}:${forceTwoDigits(shiftStart.getMinutes())}`,
            `${forceTwoDigits(end.getHours())}:${forceTwoDigits(end.getMinutes())}`,
            regularHours,
            baseRate,
            normalSupplementTotal.toFixed(2),
            userName,
            accountantId
          )
        )

      // *************************************************************************
      // ********************** FIXED ADDONS *************************************
      // *************************************************************************
      let fixedSupplementsTotal = 0
      fixedSupplements?.forEach((fixedRecord) => {
        // Skip this element and continue to the next one
        if (!fixedRecord.hasOwnProperty('id')) return

        const currentSupplement = data?.supplements?.find((supplement) => parseInt(supplement.id) === parseInt(fixedRecord.id))
        debug && console.log('currentSupplement: ', currentSupplement)
        if (currentSupplement) {
          const { id: suppID, title, salaryCode, end, pcsValue, wageAdjustment, afterMinutes } = currentSupplement
          fixedSupplementsTotal += currentSupplement.pcsValue
          totalSalary += currentSupplement.pcsValue
          getStrings &&
            retStrings.push(
              getString(
                userId,
                shiftID,
                suppID,
                formatDateOnly(shiftStart),
                title,
                salaryCode,
                '00:00',
                '00:00',
                1,
                pcsValue,
                pcsValue,
                userName,
                accountantId
              )
            )
        }
      })

      // *************************************************************************
      // ********************** After X hours addons *****************************
      // *************************************************************************
      let afterXHoursSupplementsTotal = 0
      debug && console.log('____ Calculating After X hours addons:')
      afterXHoursSupplements?.forEach((item) => {
        // Skip this element and continue to the next one
        if (!item.hasOwnProperty('id')) return

        const { id: suppID, title, salaryCode, end, pcsValue, wageAdjustment, afterMinutes } = item
        let start = new Date(0)
        start.setUTCSeconds(startTime)
        let supStart = new Date(0)
        let supEnd = new Date(0)
        supStart.setUTCSeconds(item.start)
        supEnd.setUTCSeconds(item.end)
        if (!item?.weekDays?.includes(start.getDay().toString())) return
        const amount = wageAdjustment === 'addToExistingAmount' && pcsValue
        const percentage = wageAdjustment === '%' && (data.baseSalary * pcsValue) / 100
        const overtimeMinutes = totalWorkingTime * 60 - parseInt(afterMinutes)
        let loopAmount = 0
        if (overtimeMinutes > 0) {
          if (amount) loopAmount += (amount * overtimeMinutes) / 60
          if (percentage) loopAmount += (percentage * overtimeMinutes) / 60
        }
        const nHours = (overtimeMinutes / 60).toFixed(2)
        debug && console.log('Current afterXHoursSupplementsTotal', loopAmount)
        getStrings &&
          loopAmount > 0 &&
          retStrings.push(
            getString(
              userId,
              shiftID,
              suppID,
              formatDateOnly(shiftStart),
              title,
              salaryCode,
              `${forceTwoDigits(supStart.getHours())}:${forceTwoDigits(supStart.getMinutes())}`,
              `${forceTwoDigits(supEnd.getHours())}:${forceTwoDigits(supEnd.getMinutes())}`,
              nHours,
              amount || percentage,
              loopAmount.toFixed(2),
              userName,
              accountantId
            )
          )
        afterXHoursSupplementsTotal += loopAmount
        totalSalary += loopAmount
      })

      // *************************************************************************
      // ********************** From hour to hour addons *************************
      // *************************************************************************
      let fromHourToHourSupplementsTotal = 0
      fromHourToHourSupplements?.forEach((item) => {
        // Skip this element and continue to the next one
        if (!item.hasOwnProperty('id')) return

        const { id, title, salaryCode, pcsValue, wageAdjustment, afterMinutes } = item
        let start = new Date(0)
        start.setUTCSeconds(startTime)
        let supStart = new Date(0)
        let supEnd = new Date(0)
        supStart.setUTCSeconds(item.start)
        supEnd.setUTCSeconds(item.end)
        supStart = new Date(
          start.getFullYear() +
            '-' +
            forceTwoDigits(start.getMonth() + 1) +
            '-' +
            forceTwoDigits(start.getDate()) +
            'T' +
            forceTwoDigits(supStart.getHours()) +
            ':' +
            forceTwoDigits(supStart.getMinutes())
        )
        supEnd = new Date(
          start.getFullYear() +
            '-' +
            forceTwoDigits(start.getMonth() + 1) +
            '-' +
            forceTwoDigits(start.getDate()) +
            'T' +
            forceTwoDigits(supEnd.getHours()) +
            ':' +
            forceTwoDigits(supEnd.getMinutes())
        )
        if (supEnd.getHours() < supStart.getHours()) supEnd.setDate(supEnd.getDate() + 1)
        let supStartNext = new Date(supStart)
        let supEndNext = new Date(supEnd)
        supStartNext.setDate(supStart.getDate() + 1)
        supEndNext.setDate(supEnd.getDate() + 1)
        let end = new Date(0)
        end.setUTCSeconds(endTime)
        if (!item?.weekDays?.includes(start.getDay().toString())) return
        const amount = item.wageAdjustment === 'addToExistingAmount' && pcsValue
        const percentage = item.wageAdjustment === '%' && (data.baseSalary * pcsValue) / 100
        let loopAmount = 0
        debug && console.log('____ Looping through fromHourToHour:')
        let loopTimeTotal = 0
        for (let i = 0; i < totalWorkingTime; i += 0.25) {
          if ((start >= supStart && start < supEnd) || (start >= supStartNext && start < supEndNext)) {
            if (amount) loopAmount += pcsValue * 0.25
            if (percentage) loopAmount += percentage * 0.25
            loopTimeTotal += 0.25
          } else {
            if (loopTimeTotal > 0) break
          }
          start.addHours(0.25)
        }
        debug && console.log('Current fromHourToHourSupplements', loopAmount)
        fromHourToHourSupplementsTotal += loopAmount
        totalSalary += loopAmount
        const nHours = loopTimeTotal.toFixed(2)
        if (getStrings && loopAmount > 0) {
          retStrings.push(
            getString(
              userId,
              shiftID,
              id,
              formatDateOnly(shiftStart),
              title,
              salaryCode,
              `${forceTwoDigits(supStart.getHours())}:${forceTwoDigits(supStart.getMinutes())}`,
              `${forceTwoDigits(start.getHours())}:${forceTwoDigits(start.getMinutes())}`,
              nHours,
              amount || percentage,
              loopAmount.toFixed(2),
              userName,
              accountantId
            )
          )
        }
      })
      debug && console.log('---- SUMMARY ----')
      debug && console.log('Normal hours: ' + normalSupplementTotal)
      debug && console.log('Fixed supplement: ' + fixedSupplementsTotal)
      debug && console.log('afterXHoursSupplements supplement: ' + afterXHoursSupplementsTotal)
      debug && console.log('fromHourToHourSupplements supplement: ' + fromHourToHourSupplementsTotal)
      debug && console.log('Total salary: ' + totalSalary)
      getStrings && debug && console.log('Strings: ', retStrings)
      if (getStrings) return retStrings
      return totalSalary.toFixed(2)
    } catch (error) {
      console.log('Error: ', error)
    }
  }
  const listOfStrings = (dataString) => calculateSalary(dataString, true)

  //Søndag

  const json = {
    status: 'In progress',
    shiftID: '38677523',
    userId: '5',
    title: 'Waiter',
    salaryCode: '1',
    userName: 'Odin ',
    accountantId: '133',
    baseSalary: 195,
    start: 1699084380,
    end: 1699113180,
    shiftStatus: 2,
    records: [{ type: 'workTime', start: 1699084380, end: 0 }],
    supplements: [
      {
        id: '1',
        title: 'Kvelds tillegg',
        salaryCode: '19',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 9,
        start: 1677700800,
        end: 1679455800,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5'
      },
      {
        id: '2',
        title: 'Smuss tillegg',
        salaryCode: '106',
        type: 'fixed',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 500,
        start: 1679439600,
        end: 1679439600,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '3',
        title: 'Lørdag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1679662800,
        end: 1679446800,
        afterMinutes: '',
        duration: '',
        weekDays: '6'
      },
      {
        id: '4',
        title: 'Helligdag 100%',
        salaryCode: '18',
        type: 'fromHourToHour',
        wageAdjustment: '%',
        pcsValue: 100,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '5',
        title: 'Overtid 40%',
        salaryCode: '17',
        type: 'afterXHours',
        wageAdjustment: '%',
        pcsValue: 40,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '540',
        duration: '10000',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '6',
        title: 'Søndag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1680559200,
        end: 1680645540,
        afterMinutes: '',
        duration: '',
        weekDays: '0'
      }
    ]
  }

  const jsonOld = {
    status: 'Done',
    shiftID: '74942875',
    userId: '9',
    title: 'Head Ched',
    salaryCode: '1',
    userName: 'Eduard Veizaj',
    accountantId: '5',
    baseSalary: 290,
    start: 1694296800,
    end: 0,
    shiftStatus: 3,
    records: [{ type: 'workTime', start: 1694332800, end: 1694374200 }],
    supplements: [
      {
        id: '1',
        title: 'Kvelds tillegg',
        salaryCode: '19',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 9,
        start: 1677700800,
        end: 1679455800,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5'
      },
      {
        id: '2',
        title: 'Smuss tillegg',
        salaryCode: '106',
        type: 'fixed',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 500,
        start: 1679439600,
        end: 1679439600,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '3',
        title: 'Lørdag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1679662800,
        end: 1679446800,
        afterMinutes: '',
        duration: '',
        weekDays: '6'
      },
      {
        id: '4',
        title: 'Helligdag 100%',
        salaryCode: '18',
        type: 'fromHourToHour',
        wageAdjustment: '%',
        pcsValue: 100,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '5',
        title: 'Overtid 40%',
        salaryCode: '17',
        type: 'afterXHours',
        wageAdjustment: '%',
        pcsValue: 40,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '540',
        duration: '10000',
        weekDays: '1, 2, 3, 4, 5, 6, 0'
      },
      {
        id: '6',
        title: 'Søndag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '',
        duration: '',
        weekDays: '0'
      }
    ]
  }

  // Lørdag
  const json2 = {
    status: 'Approved',
    shiftID: '43033979',
    userId: '34',
    title: 'Chef s',
    salaryCode: '1',
    userName: 'Alban  Veizaj',
    accountantId: '12',
    baseSalary: 205.88,
    start: 1693663200,
    end: 1693692000,
    shiftStatus: 4,
    records: [
      { type: 'workTime', start: 1693724400, end: 1693767600 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 },
      { type: 'supplement', start: 0, end: 0 }
    ],
    supplements: [
      {
        id: '1',
        title: 'Kvelds tillegg',
        salaryCode: '19',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 9,
        start: 1677700800,
        end: 1679455800,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5'
      },
      {
        id: '2',
        title: 'Smuss tillegg',
        salaryCode: '106',
        type: 'fixed',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 500,
        start: 1679439600,
        end: 1679439600,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        id: '3',
        title: 'Lørdag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1679662800,
        end: 1679446800,
        afterMinutes: '',
        duration: '',
        weekDays: '6'
      },
      {
        id: '4',
        title: 'Helligdag 100%',
        salaryCode: '18',
        type: 'fromHourToHour',
        wageAdjustment: '%',
        pcsValue: 100,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        id: '5',
        title: 'Overtid 40%',
        salaryCode: '17',
        type: 'afterXHours',
        wageAdjustment: '%',
        pcsValue: 40,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '540',
        duration: '10000',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        id: '6',
        title: 'Søndag',
        salaryCode: '20',
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        pcsValue: 19,
        start: 1680559200,
        end: 1680559200,
        afterMinutes: '',
        duration: '',
        weekDays: '7'
      }
    ]
  }

  const rawData = '"' + JSON.stringify(json) + '"'
  const rawData2 = '"' + JSON.stringify(json2) + '"'

  console.log('=================== START 1 ===================')
  const calculcatedSalary = calculateSalary(rawData)
  const listofstrings = listOfStrings(rawData) || []
  console.log('=================== END 1 ===================')
  console.log('=================== START 2 ===================')
  const calculcatedSalary2 = calculateSalary(rawData2)
  const listofstrings2 = listOfStrings(rawData2) || []
  console.log('=================== END 2 ===================')

  return (
    <div className="App" style={{ textAlign: 'left' }}>
      <div>
        <h1>JSON #1</h1>
        <h2>calculateSalary returns: </h2>
        <p style={{ fontStyle: 'bold' }}>{calculcatedSalary}</p>
      </div>
      <div>
        <h2>listOfStrings returns: ({listofstrings?.length} lines)</h2>
        {!listofstrings?.length && 'Empty array'}
        <ol style={{ paddingLeft: 32 }}>
          {listofstrings.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>
      <div>
        <h1>JSON #2</h1>
        <h2>calculateSalary returns: </h2>
        <p style={{ fontStyle: 'bold' }}>{calculcatedSalary2}</p>
      </div>
      <div>
        <h2>listOfStrings returns: ({listofstrings2?.length} lines)</h2>
        {!listofstrings2?.length && 'Empty array'}
        <ol style={{ paddingLeft: 32 }}>
          {listofstrings2.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default App
