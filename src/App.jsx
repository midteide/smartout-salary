import './App.css'

// "mode" : 1 = Kalkulere normal
// "mode" : 2 = Kalkulere uten Supplements
// "mode" : 3 = Kalkulere timer men skriv lønn i null

const d = {
  status: 'Approved',
  shiftID: '523130',
  userId: '1',
  title: 'Servitør',
  salaryCode: '1',
  team: 'Servitør',
  userName: 'Pontus S. Lindroth ',
  accountantId: '12',
  baseSalary: 250,
  start: 1721077200000,
  startDate: '15.07.24 21:00',
  end: 1721115000000,
  endDate: '16.07.24 07:30',
  shiftStatus: 4,
  employeeType: 'Hour salary',
  timezoneOffSet: '2',

  records: [
    {
      title: '1337',
      type: 'workTime',
      start: 1721077200,
      startPrint: '15.07.2024 21:00',
      end: 1721115000,
      endPrint: '16.07.2024 07:30',
      id: 1,
      value: 37800.0,
      amount: '0'
    },
    {
      title: 'Smuss tillegg',
      type: 'supplement',
      start: 1706662800,
      startPrint: '31.01.2024 00:00',
      end: 1706662800,
      endPrint: '31.01.2024 00:00',
      id: 106,
      value: 1.0,
      amount: '500'
    },
    {
      title: 'Måltidsfradrag ',
      type: 'supplement',
      start: 1721098800,
      startPrint: '16.07.2024 03:00',
      end: 1721098800,
      endPrint: '16.07.2024 03:00',
      id: 5001,
      value: 1.0,
      amount: '-60'
    }
  ],

  supplements: [
    {
      id: '14',
      title: 'Natt tilegg... Test',
      salaryCode: '3225',
      type: 'fromHourToHour',
      wageAdjustment: 'addToExistingAmount',
      pcsValue: 45.0,
      start: 1720998000,
      startPrint: '01.01.23 23:00',
      end: 1721192400,
      endPrint: '01.01.25 05:00',
      afterMinutes: '0',
      duration: '0',
      weekDays: '1, 2, 3, 4, 5, 6, 0',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Developer, Employee, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Servitør, Runner, Hovmester, Administrasjon, Settefiskanlegg, Lærling, Junior Frisør, Elektor, Rør, Kunde, Faggruppe 1, Faggruppe 2'
    },
    {
      id: '11',
      title: 'Mandag',
      salaryCode: '123444',
      type: 'fromHourToHour',
      wageAdjustment: 'addToExistingAmount',
      pcsValue: 10.0,
      start: 1720956600,
      startPrint: '14.07.24 11:30',
      end: 1721250000,
      endPrint: '14.07.24 21:00',
      afterMinutes: '0',
      duration: '0',
      weekDays: '1, 2, 3, 4, 5, 6, 0',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Developer, Employee, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Servitør, Runner, Hovmester, Administrasjon, Settefiskanlegg, Lærling, Junior Frisør, Elektor, Rør, Kunde, Faggruppe 1, Faggruppe 2'
    },
    {
      id: '4',
      title: 'Overtid 40%',
      salaryCode: '17',
      type: 'afterXHours',
      wageAdjustment: '%',
      pcsValue: 40.0,
      start: 1720915200,
      startPrint: '31.01.24 00:00',
      end: 1721174400,
      endPrint: '31.01.24 00:00',
      afterMinutes: '540',
      duration: '59940',
      weekDays: '1, 2, 3, 4, 5, 6, 0',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Employee, Waiter, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Båt vakter, Developer, Servitør, Runner, Hovmester, Administrasjon, Settefiskanlegg, Lærling, Junior Frisør, Elektor, Rør, Kunde, Faggruppe 1, Faggruppe 2'
    },
    {
      id: '1',
      title: 'Kvelds tillegg',
      salaryCode: '19',
      type: 'fromHourToHour',
      wageAdjustment: 'addToExistingAmount',
      pcsValue: 13.55,
      start: 1720990800,
      startPrint: '31.01.24 21:00',
      end: 1721174400,
      endPrint: '31.01.24 00:00',
      afterMinutes: '0',
      duration: '0',
      weekDays: '1, 2, 3, 4, 5',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Employee, Waiter, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Båt vakter, Developer, Servitør, Runner'
    },
    {
      id: '5',
      title: 'Smuss tillegg',
      salaryCode: '106',
      type: 'fixed',
      wageAdjustment: 'addToExistingAmount',
      pcsValue: 500.0,
      start: 1720915200,
      startPrint: '31.01.24 00:00',
      end: 1721174400,
      endPrint: '31.01.24 00:00',
      afterMinutes: '',
      duration: '',
      weekDays: '1, 2, 3, 4, 5, 6, 0',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Employee, Waiter, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Båt vakter, Developer, Servitør, Runner'
    }
  ]
}

const data = JSON.stringify(d)

function App() {
  var indata = JSON.parse(data)

  function calculateMinutesWithinRange(shiftStart, shiftEnd, supStart, supEnd) {
    function parseTime(date) {
      return {
        hours: date.getHours(),
        minutes: date.getMinutes()
      }
    }

    let shiftStartTime = parseTime(new Date(shiftStart))
    let shiftEndTime = parseTime(new Date(shiftEnd))
    let supStartTime = parseTime(new Date(supStart))
    let supEndTime = parseTime(new Date(supEnd))

    function timeToMinutes(time) {
      return time.hours * 60 + time.minutes
    }

    let shiftStartMinutes = timeToMinutes(shiftStartTime)
    let shiftEndMinutes = timeToMinutes(shiftEndTime)
    let supStartMinutes = timeToMinutes(supStartTime)
    let supEndMinutes = timeToMinutes(supEndTime)

    let minutesWithinRange = 0
    let overlapStart = -1
    let overlapEnd = -1

    for (let minute = shiftStartMinutes; minute < shiftEndMinutes; minute++) {
      if (minute >= supStartMinutes && minute < supEndMinutes) {
        if (overlapStart === -1) {
          overlapStart = minute
        }
        overlapEnd = minute
        minutesWithinRange++
      }
    }

    if (overlapStart !== -1) {
      overlapStart -= shiftStartMinutes
      overlapEnd = overlapEnd - shiftStartMinutes + 1
    }

    return {
      minutesWithinRange,
      supStart: new Date(shiftStart).addHours(overlapStart / 60),
      supEnd: new Date(shiftStart).addHours(overlapEnd / 60)
    }
  }

  function convertUTCDateToLocalDate(epochTime) {
    const localDate = new Date(epochTime * 1000)

    let utcDate = new Date(
      Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate(),
        localDate.getUTCHours(),
        localDate.getUTCMinutes(),
        localDate.getUTCSeconds(),
        localDate.getUTCMilliseconds()
      )
    )

    return utcDate
  }

  const roundNearQtr = (number) => (Math.round(number * 4) / 4).toFixed(2)
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000)
    return this
  }
  const forceTwoDigits = (n) => n.toString().padStart(2, 0)
  const formatDate = (date) => {
    const d = new Date(date)
    return `${forceTwoDigits(d.getDate())}.${forceTwoDigits(d.getMonth() + 1)}.${d.getFullYear()}`
  }
  const getString = (
    userID, // 1 Ansatt nummer
    shiftID, // 2 Indikerer hvilket shift
    suppID, // 3 Supplement ID
    date, // 4 Dato
    recordTitle, // 5 Record title
    salaryCode, // 6 Regnskapssystem id
    recordStartTime, // 7 Start tidspunkt for aktuelt tillegg
    recordStopTime, // 8 Stopp tidspunkt for aktuelt tillegg
    recordAmount, // 9 Total / value = amount. Dette er antall timer
    recordValue, // 10 Antall kroner / prosent tillegget er på
    totAmount, // 11 Total kronebeløp
    userName // 12 Navn på ansatt
  ) =>
    `${userID},${shiftID},${suppID},${date},${recordTitle},${salaryCode},${recordStartTime},${recordStopTime},${recordAmount},${recordValue},${totAmount},${userName}`

  const calculateSalary = (dataJSON, getStrings = false) => {
    try {
      const debug = getStrings

      const baseRate = dataJSON.baseSalary || []
      const records = dataJSON.records || []
      const userId = dataJSON.userId || ''
      const userName = dataJSON.userName || ''
      const shiftID = dataJSON.shiftID || ''
      const title = dataJSON.title || ''
      const isShiftWithoutSupplements = dataJSON.mode === 2
      const isHoursOnlyNoPay = dataJSON.mode === 3
      const salaryCode = dataJSON.salaryCode || ''
      const supplements = dataJSON.supplements || ''
      const fixedSupplements = records.filter((item) => item.type === 'supplement')
      const fromHourToHourSupplements = supplements.filter((item) => item.type === 'fromHourToHour')
      const afterXHoursSupplements = supplements.filter((item) => item.type === 'afterXHours')
      const retStrings = []
      let totalSalary = 0
      let end = convertUTCDateToLocalDate(dataJSON.end / 1000)
      let shiftStart = convertUTCDateToLocalDate(dataJSON.start / 1000)
      debug && console.log('Shift start: ', shiftStart.toISOString())
      debug && console.log('Shift end: ', end.toISOString())

      // *************************************************************************
      // ********************** NORMAL HOURS *************************************
      // *************************************************************************
      let start = shiftStart
      const totalWorkingTime = roundNearQtr((end - start) / 1000 / 60 / 60)
      try {
        let startNormalHours = convertUTCDateToLocalDate(dataJSON.start / 1000)
        debug && console.log('startNormalHours: ', startNormalHours)
        debug && console.log('Shift length in total: ', totalWorkingTime)
        let numberOfRegularWorkingHours = 0
        let regularHoursMoneyAmount = 0

        for (let i = 0; i < totalWorkingTime; i += 0.25) {
          numberOfRegularWorkingHours += 0.25
          regularHoursMoneyAmount += baseRate * 0.25
          totalSalary += baseRate * 0.25
          startNormalHours.addHours(0.25)
        }
        getStrings &&
          retStrings.push(
            getString(
              userId,
              shiftID,
              '-',
              formatDate(shiftStart),
              title,
              salaryCode,
              `${forceTwoDigits(shiftStart.getUTCHours())}:${forceTwoDigits(shiftStart.getUTCMinutes())}`,
              `${forceTwoDigits(end.getUTCHours())}:${forceTwoDigits(end.getUTCMinutes())}`,
              numberOfRegularWorkingHours.toFixed(2),
              baseRate,
              isHoursOnlyNoPay ? 0 : regularHoursMoneyAmount.toFixed(2),
              userName
            )
          )
      } catch (error) {
        debug && console.log('Error in NORMAL HOURS: ', error)
      }

      // *************************************************************************
      // ********************** FIXED ADDONS *************************************
      // *************************************************************************
      debug && fixedSupplements?.length && console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––')
      debug && fixedSupplements?.length && console.log('********************** FIXED ADDONS *****************************')
      let fixedSupplementsTotal = 0
      !isShiftWithoutSupplements &&
        fixedSupplements?.forEach((fixedRecord, i) => {
          debug && console.log('iteration: ', i, fixedRecord)
          const fixedRecordId = !fixedRecord.hasOwnProperty('id') ? '0' : fixedRecord.id
          const currentSupplement = supplements?.find((supplement) => parseInt(supplement.salaryCode) === parseInt(fixedRecordId))

          if (currentSupplement) {
            debug && console.log('ADDING FIXED SUPPLEMENT: ', currentSupplement.title, currentSupplement)
            fixedSupplementsTotal += currentSupplement.pcsValue
            totalSalary += currentSupplement.pcsValue
            getStrings &&
              retStrings.push(
                getString(
                  userId,
                  shiftID,
                  currentSupplement.id,
                  formatDate(shiftStart),
                  currentSupplement.title,
                  currentSupplement.salaryCode,
                  '00:00',
                  '00:00',
                  1,
                  fixedRecord.amount,
                  isHoursOnlyNoPay ? '0' : fixedRecord.amount,
                  userName
                )
              )
          }
        })
      debug && fixedSupplements?.length && console.log('XXXXXXXXXXXXXX FINISHED FIXED ADDONS XXXXXXXXXXXXX')
      debug && fixedSupplements?.length && console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––')

      // *************************************************************************
      // ********************** After X hours addons *****************************
      // *************************************************************************
      try {
        let afterXHoursSupplementsTotal = 0
        debug && afterXHoursSupplements?.length && console.log('********************** AFTER X HOURS ADDONS *****************************')
        !isShiftWithoutSupplements &&
          afterXHoursSupplements?.forEach((afterXHoursSupplement, i) => {
            debug && console.log('iteration: ', i, afterXHoursSupplement)
            // let start = new Date(0)
            // start.setUTCSeconds(startTime)
            if (!afterXHoursSupplement?.weekDays?.includes(shiftStart.getDay().toString())) return
            const amount = afterXHoursSupplement.wageAdjustment === 'addToExistingAmount' && afterXHoursSupplement.pcsValue
            const fixed = afterXHoursSupplement.wageAdjustment === 'fixed' && afterXHoursSupplement.pcsValue
            const percentage = afterXHoursSupplement.wageAdjustment === '%' && (dataJSON.baseSalary * afterXHoursSupplement.pcsValue) / 100
            const workTimeTotal = parseFloat(totalWorkingTime)
            let overtimeMinutes = workTimeTotal * 60 - parseInt(afterXHoursSupplement.afterMinutes)
            let overtimeHours = overtimeMinutes / 60
            overtimeMinutes = Math.min(
              workTimeTotal * 60 - parseInt(afterXHoursSupplement.afterMinutes),
              parseInt(afterXHoursSupplement.duration)
            )
            debug && console.log('overtimeMinutes: ', overtimeMinutes)
            debug && console.log('overtimeHours: ', overtimeHours)
            debug && console.log('workTimeTotal: ', workTimeTotal)
            const supStart = shiftStart
            const normalHours = workTimeTotal - overtimeHours
            debug && console.log('normalHours: ', normalHours)
            supStart.addHours(normalHours)

            let afterXHoursSupplementsMoneyAmount = 0
            if (overtimeMinutes > 0) {
              if (amount) afterXHoursSupplementsMoneyAmount += (amount * overtimeMinutes) / 60
              if (percentage) afterXHoursSupplementsMoneyAmount += (percentage * overtimeMinutes) / 60
              if (fixed) afterXHoursSupplementsMoneyAmount = fixed
            }
            if (getStrings && afterXHoursSupplementsMoneyAmount > 0) {
              retStrings.push(
                getString(
                  userId,
                  shiftID,
                  afterXHoursSupplement.id,
                  formatDate(shiftStart),
                  afterXHoursSupplement.title,
                  afterXHoursSupplement.salaryCode,
                  `${forceTwoDigits(supStart.getUTCHours())}:${forceTwoDigits(supStart.getUTCMinutes())}`,
                  `${forceTwoDigits(end.getUTCHours())}:${forceTwoDigits(end.getUTCMinutes())}`,
                  (overtimeMinutes / 60).toFixed(2),
                  amount || percentage,
                  isHoursOnlyNoPay ? '0' : afterXHoursSupplementsMoneyAmount.toFixed(2),
                  userName
                )
              )
            }
            afterXHoursSupplementsTotal += afterXHoursSupplementsMoneyAmount
            totalSalary += afterXHoursSupplementsMoneyAmount
            debug && console.log('------- iteration: ', i, ' DONE -------')
          })
        debug && afterXHoursSupplements?.length && console.log('XXXXXXXXXXXXXX FINISHED AFTER X HOURS ADDONS XXXXXXXXXXXXX')
        debug && afterXHoursSupplements?.length && console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––')
      } catch (error) {
        debug && console.log('Error afterXHoursSupplements: ', error)
      }

      // *************************************************************************
      // ********************** From hour to hour addons *************************
      // *************************************************************************
      debug && fromHourToHourSupplements?.length && console.log('********************** FROM HOUR TO HOUR *****************************')
      try {
        !isShiftWithoutSupplements &&
          fromHourToHourSupplements?.forEach((fromHourToHourSupplement, i) => {
            debug &&
              fromHourToHourSupplements?.length &&
              console.log('iteration: ', i, ' From hour to hour addons &&&&& ', fromHourToHourSupplement)
            try {
              if (!fromHourToHourSupplement?.weekDays?.includes(shiftStart.getDay().toString())) {
                debug &&
                  console.log(
                    'NOT ADDED and returning, suppID: ',
                    fromHourToHourSupplement.id,
                    start.getDay().toString(),
                    fromHourToHourSupplement?.weekDays
                  )
                return
              }
            } catch (error) {
              debug && console.log('Error: ', error)
            }

            const amount = fromHourToHourSupplement.wageAdjustment === 'addToExistingAmount' && fromHourToHourSupplement.pcsValue
            const percentage =
              fromHourToHourSupplement.wageAdjustment === '%' && (data.baseSalary * fromHourToHourSupplement.pcsValue) / 100

            const fromHourToHourSupplementCalculations = calculateMinutesWithinRange(
              dataJSON.start,
              dataJSON.end,
              fromHourToHourSupplement.start * 1000,
              fromHourToHourSupplement.end * 1000
            )

            let hoursWithinRange = fromHourToHourSupplementCalculations.minutesWithinRange / 60
            let fromHourToHourSupplementMoneyAmount = 0
            if (amount) {
              fromHourToHourSupplementMoneyAmount = amount * hoursWithinRange
            } else if (percentage) fromHourToHourSupplementMoneyAmount = percentage * hoursWithinRange
            totalSalary += fromHourToHourSupplementMoneyAmount
            if (getStrings && fromHourToHourSupplementMoneyAmount > 0) {
              retStrings.push(
                getString(
                  userId,
                  shiftID,
                  fromHourToHourSupplement.id,
                  formatDate(shiftStart),
                  fromHourToHourSupplement.title,
                  fromHourToHourSupplement.salaryCode,
                  `${forceTwoDigits(fromHourToHourSupplementCalculations.supStart.getUTCHours())}:${forceTwoDigits(
                    fromHourToHourSupplementCalculations.supStart.getUTCMinutes()
                  )}`,
                  `${forceTwoDigits(fromHourToHourSupplementCalculations.supEnd.getUTCHours())}:${forceTwoDigits(
                    fromHourToHourSupplementCalculations.supEnd.getUTCMinutes()
                  )}`,
                  hoursWithinRange.toFixed(2),
                  amount || percentage,
                  isHoursOnlyNoPay ? '0' : fromHourToHourSupplementMoneyAmount.toFixed(2),
                  userName
                )
              )
            }
          })
      } catch (error) {
        console.log('Error fromHourToHourSupplement: ', error)
      }

      if (getStrings) return retStrings
      return isHoursOnlyNoPay ? 0 : totalSalary.toFixed(2)
    } catch (error) {
      if (getString) return ['Error: ' + error]
      return 'Error: ' + error
    }
  }
  const listOfStrings = (dataString) => calculateSalary(dataString, true)

  //  ******************************************************
  //  ***** BELOW THIS LINE IS NOT PART OF BUBBLE CODE *****
  //  ******************************************************
  const calculcatedSalary = calculateSalary(indata)
  const listofstrings = listOfStrings(indata) || []
  // console.log('=================== START 2 ===================')
  // const calculcatedSalary2 = rawData2 && calculateSalary(rawData2)
  // const listofstrings2 = (rawData2 && listOfStrings(rawData2)) || []
  // console.log('=================== END 2 ===================')

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

      {/* {calculcatedSalary2 && (
        <>
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
        </>
      )} */}
    </div>
  )
}

export default App
