import './App.css'

function App() {
  const roundNearQtr = (number) => (Math.round(number * 4) / 4).toFixed(2)
  const debug = true
  const retStrings = []
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000)
    return this
  }
  const forceTwoDigits = (n) => n.toString().padStart(2, 0)
  const formatDateOnly = (date) => {
    const d = new Date(date)
    return `${d.getFullYear()}.${forceTwoDigits(d.getMonth() + 1)}.${forceTwoDigits(d.getDate())}`
  }
  const getString = (userID, shiftID, suppID, date, title, salaryCode, startTime, stopTime, nHours, pricePerHr, totAmount) =>
    `${userID},${shiftID},${suppID},${date},${title},${salaryCode},${startTime},${stopTime},${nHours},${pricePerHr},${totAmount}`

  const calculateSalary = (dataString, getStrings = false) => {
    console.log('dataString: ', getStrings ? 'getStrings' : 'Normal', dataString)
    if (!dataString || dataString === '""') return null
    try {
      const data = JSON.parse(dataString.substring(0, dataString.length - 1).substring(1))
      debug && console.log('Data: ', data)
      debug && console.log('___________')
      getStrings && debug && console.log('PRINTING STRINGS')
      // debug && console.log('Shift Status:   ', data.shiftStatus)
      const startTime = data.shiftStatus > 2 ? data.records.find((item) => item.type === 'workTime')?.start : data.start //data.records[0].start
      const endTime = data.shiftStatus > 2 ? data.records.find((item) => item.type === 'workTime')?.end : data.end //data.records[0].end
      const { baseSalary: baseRate, supplements, records, userId, shiftID, status: statusMsg, title, salaryCode } = data
      const fixedSupplements = records.filter((item) => item.type === 'supplement')
      const fromHourToHourSupplements = supplements.filter((item) => item.type === 'fromHourToHour')
      const afterXHoursSupplements = supplements.filter((item) => item.type === 'afterXHours')
      let totalSalary = 0
      // Calculate base salary
      let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
      start.setUTCSeconds(startTime)
      let shiftStart = new Date(0)
      shiftStart.setUTCSeconds(startTime)
      debug && console.log('Shift start: ', start.toString())
      let end = new Date(0) // The 0 there is the key, which sets the date to the epoch
      end.setUTCSeconds(endTime)
      debug && console.log('Shift end: ', end.toString())
      const totalWorkingTime = roundNearQtr((end - start) / 1000 / 60 / 60)
      debug && console.log('!!!! start: ', start)
      debug && console.log('!!!! end: ', end)
      debug && console.log('!!!! totalWorkingTime: ', totalWorkingTime)
      let regularHours = 0
      // Normal hours
      let normalSupplementTotal = 0
      for (let i = 0; i < totalWorkingTime; i += 0.25) {
        regularHours += 0.25
        normalSupplementTotal += baseRate * 0.25
        totalSalary += baseRate * 0.25
        start.addHours(0.25)
      }
      // const getString = (userID, shiftID, date , suppID, title, salaryCode, startTime, stopTime, nHours, pricePerHr, totAmount) =>
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
            normalSupplementTotal
          )
        )

      // *************************************************************************
      // ********************** FIXED ADDONS *************************************
      // *************************************************************************
      let fixedSupplementsTotal = 0
      fixedSupplements?.forEach((fixedRecord) => {
        if (!fixedRecord?.id) throw { error: 'No id provided' }
        const currentSupplement = data?.supplements?.find((supplement) => parseInt(supplement.id) === parseInt(fixedRecord.id))
        debug && console.log('currentSupplement: ', currentSupplement)
        if (currentSupplement) {
          const { id: suppID, title, salaryCode, end, pcsValue, wageAdjustment, afterMinutes } = currentSupplement
          fixedSupplementsTotal += currentSupplement.pcsValue
          totalSalary += currentSupplement.pcsValue
          getStrings &&
            retStrings.push(
              getString(userId, shiftID, suppID, formatDateOnly(shiftStart), title, salaryCode, '00:00', '00:00', 1, pcsValue, pcsValue)
            )
        }
      })

      // *************************************************************************
      // ********************** After X hours addons *****************************
      // *************************************************************************
      let afterXHoursSupplementsTotal = 0
      afterXHoursSupplements?.forEach((item) => {
        if (!item?.id) throw { error: 'No id provided' }
        const { id: suppID, title, salaryCode, end, pcsValue, wageAdjustment, afterMinutes } = item
        let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
        start.setUTCSeconds(startTime)
        let supStart = new Date(0) // The 0 there is the key, which sets the date to the epoch
        let supEnd = new Date(0) // The 0 there is the key, which sets the date to the epoch
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
              loopAmount
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
        if (!item?.id) throw { error: 'No id provided' }
        const { id, title, salaryCode, pcsValue, wageAdjustment, afterMinutes } = item
        let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
        start.setUTCSeconds(startTime)
        let supStart = new Date(0) // The 0 there is the key, which sets the date to the epoch
        let supEnd = new Date(0) // The 0 there is the key, which sets the date to the epoch
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
        // supEnd = new Date('1970-01-01T' + forceTwoDigits(supEnd.getHours()) + ':' + forceTwoDigits(supEnd.getMinutes()))
        if (supEnd.getHours() < supStart.getHours()) supEnd.setDate(supEnd.getDate() + 1)
        // start = new Date('1970-01-01T' + forceTwoDigits(start.getHours()) + ':' + forceTwoDigits(start.getMinutes()))
        let supStartNext = new Date(supStart) // The 0 there is the key, which sets the date to the epoch
        let supEndNext = new Date(supEnd) // The 0 there is the key, which sets the date to the epoch
        supStartNext.setDate(supStart.getDate() + 1)
        supEndNext.setDate(supEnd.getDate() + 1)
        // debug && console.log('supStartNext', supStartNext)
        // debug && console.log('supEndNext', supEndNext)
        let end = new Date(0) // The 0 there is the key, which sets the date to the epoch
        end.setUTCSeconds(endTime)
        if (!item?.weekDays?.includes(start.getDay().toString())) return
        const amount = item.wageAdjustment === 'addToExistingAmount' && pcsValue
        const percentage = item.wageAdjustment === '%' && (data.baseSalary * pcsValue) / 100
        // start.setUTCSeconds(startTime)
        // end.setUTCSeconds(endTime)
        let loopAmount = 0
        debug && console.log('____ Looping through fromHourToHour:')
        let loopTimeTotal = 0
        for (let i = 0; i < totalWorkingTime; i += 0.25) {
          // if (start >= supStart && start < supEnd) {
          if ((start >= supStart && start < supEnd) || (start >= supStartNext && start < supEndNext)) {
            // if (start.getHours() >= supStart.getHours() && start.getHours() < supEnd.getHours()) {
            if (amount) loopAmount += pcsValue * 0.25
            if (percentage) loopAmount += percentage * 0.25
            loopTimeTotal += 0.25
            // debug && console.log('!!!!!Active! start:', start)
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
              loopAmount
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
      return totalSalary
    } catch (error) {
      console.log('Error: ', error)
    }
  }
  const listOfStrings = (dataString) => calculateSalary(dataString, true)

  // const rawData = `"{"status":"Done","baseSalary":195,"start":1678273200,"end":1678302000,"shiftStatus":3,"records":[{"type":"workTime","start":1678273200,"end":1678310100}],"supplements":[{"type":"fromHourToHour","wageAdjustment":"addToExistingAmount","amount":44,"start":1677538800,"end":1677560400,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5, 6, 7"},{"type":"fixed","wageAdjustment":"addToExistingAmount","amount":500,"start":1677538800,"end":1677538800,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5, 6, 7"},{"type":"fromHourToHour","wageAdjustment":"addToExistingAmount","amount":9,"start":1678305600,"end":1678230000,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5"},{"type":"afterXHours","wageAdjustment":"%","amount":40,"start":1678230000,"end":1678230000,"afterMinutes":"540","duration":"999","weekDays":"1, 2, 3, 4, 5, 6, 7"}]}"`

  const json = {
    status: 'Done',
    shiftID: '150',
    userId: '1',
    title: 'Bartender s',
    salaryCode: '20',
    baseSalary: 185,
    start: 1688644800,
    end: 1688652000,
    shiftStatus: 3,
    records: [{ type: 'workTime', start: 1688637600, end: 1688670000, id: 11 }],
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
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      }
    ]
  }

  const rawData = '"' + JSON.stringify(json) + '"'

  const calculcatedSalary = calculateSalary(rawData)
  const listofstrings = listOfStrings(rawData) || []
  console.log('listofstrings: ', listofstrings)

  return (
    <div className="App" style={{ textAlign: 'left' }}>
      <div>
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
    </div>
  )
}

export default App
