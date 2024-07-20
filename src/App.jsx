import './App.css'
import { indata, indataArray } from './json'

function App() {
  var inputData = JSON.parse(indata)

  function convertWeekDaysToArray(weekDays) {
    return weekDays.split(',').map((day) => parseInt(day.trim(), 10))
  }
  function calculateMinutesWithinRange(shiftStart, shiftEnd, supStart, supEnd, nextDay = false, debug = false) {
    function parseTime(date) {
      return {
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes()
      }
    }

    let shiftStartTime = parseTime(new Date(shiftStart))
    let shiftEndTime = parseTime(new Date(shiftEnd))
    let supStartTime = parseTime(new Date(supStart))
    let supEndTime = parseTime(new Date(supEnd))

    if (shiftStartTime.hours > shiftEndTime.hours) {
      debug && console.log('1shiftEndTime.hours += 24')
      shiftEndTime.hours += 24
    }
    if (supStartTime.hours > supEndTime.hours) {
      debug && console.log('2supEndTime.hours += 24')
      supEndTime.hours += 24
    }

    if (nextDay && supStartTime.hours < shiftStartTime.hours) {
      debug &&
        console.log(
          '3supStartTime.hours = shiftStartTime.hours, supStartTime.hours was: ',
          supStartTime.hours,
          ' now: ',
          shiftStartTime.hours
        )
      supStartTime.hours += 24
      // supStartTime.hours += 24
    }
    if (supEndTime.hours < supStartTime.hours) {
      debug && console.log('!!!!!!!!!!!!!4supEndTime.hours += 24')
      // if (supEndTime.hours < shiftStartTime.hours) {
      supEndTime.hours += 24
    } else {
      debug && console.log('!!!!!!!!!!!!!4supEndTime.hours += 24', supEndTime.hours, supStartTime.hours)
    }
    if (supStartTime.hours > shiftEndTime.hours) {
      supStartTime.hours -= 24
      supEndTime.hours -= 24
    }
    debug && console.log('shiftStartTime: ', shiftStartTime)
    debug && console.log('shiftEndTime: ', shiftEndTime)
    debug && console.log('supStartTime: ', supStartTime)
    debug && console.log('supEndTime: ', supEndTime)

    function timeToMinutes(time) {
      return time.hours * 60 + time.minutes
    }

    let shiftStartMinutes = timeToMinutes(shiftStartTime)
    let shiftEndMinutes = timeToMinutes(shiftEndTime)
    let supStartMinutes = timeToMinutes(supStartTime)
    let supEndMinutes = timeToMinutes(supEndTime)
    debug && console.log('shiftStartMinutes: ', shiftStartMinutes)
    debug && console.log('shiftEndMinutes: ', shiftEndMinutes)
    debug && console.log('supStartMinutes: ', supStartMinutes)
    debug && console.log('supEndMinutes: ', supEndMinutes)
    while (supStartMinutes > supEndMinutes) {
      debug && console.log('Adding: ')
      supEndMinutes += 24 * 60
      debug && console.log('supStartMinutes: ', supStartMinutes)
      debug && console.log('supEndMinutes: ', supEndMinutes)
    }
    // Ensure sup times are within the shift range
    if (supStartMinutes < shiftStartMinutes) {
      supStartMinutes = shiftStartMinutes
    }
    if (supEndMinutes > shiftEndMinutes) {
      supEndMinutes = shiftEndMinutes
    }

    debug && console.log('------ AFTER -----')
    debug && console.log('shiftStartMinutes: ', shiftStartMinutes)
    debug && console.log('shiftEndMinutes: ', shiftEndMinutes)
    debug && console.log('supStartMinutes: ', supStartMinutes)
    debug && console.log('supEndMinutes: ', supEndMinutes)

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
      supStart: new Date(new Date(shiftStart).getTime() + overlapStart * 60000),
      supEnd: new Date(new Date(shiftStart).getTime() + overlapEnd * 60000)
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
    return `${forceTwoDigits(d.getUTCDate())}.${forceTwoDigits(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`
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

  const calculateSalary = (dataJSON, getStrings = false, debug) => {
    try {
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
      if (dataJSON.end < dataJSON.start) {
        dataJSON.end += 24 * 60 * 60 * 1000
      }
      let end = convertUTCDateToLocalDate(dataJSON.end / 1000)
      const shiftStart = convertUTCDateToLocalDate(dataJSON.start / 1000)
      const shiftEnd = convertUTCDateToLocalDate(dataJSON.end / 1000)

      debug && console.log('Shift start: ', shiftStart.toISOString())
      debug && console.log('Shift end: ', end.toISOString())
      const shiftIsOnSameDay = shiftStart.getUTCHours() <= shiftEnd.getUTCHours()

      // *************************************************************************
      // ********************** NORMAL HOURS *************************************
      // *************************************************************************
      let start = convertUTCDateToLocalDate(dataJSON.start / 1000)
      const totalWorkingTime = roundNearQtr((end - start) / 1000 / 60 / 60)
      try {
        let startNormalHours = convertUTCDateToLocalDate(dataJSON.start / 1000)
        debug && console.log('startNormalHours: ', startNormalHours)
        debug &&
          console.log('Shift length in total: ', totalWorkingTime, ' rate: ', baseRate, ' totalSalary: ', totalWorkingTime * baseRate)
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
      try {
        !isShiftWithoutSupplements &&
          fixedSupplements?.forEach((fixedRecord, i) => {
            debug && console.log('iteration: ', i, fixedRecord)
            // const currentSupplement = supplements?.find((supplement) => parseInt(supplement.salaryCode) === parseInt(fixedRecord.id))

            // if (currentSupplement) {
            debug && console.log('ADDING FIXED SUPPLEMENT: ', fixedRecord.title, fixedRecord)
            const supStart = new Date(fixedRecord.start * 1000)
            const supEnd = new Date(fixedRecord.end * 1000)
            fixedSupplementsTotal += fixedRecord.amount
            totalSalary += fixedRecord.amount
            getStrings &&
              retStrings.push(
                getString(
                  userId,
                  shiftID,
                  fixedRecord.id,
                  formatDate(supStart),
                  fixedRecord.title,
                  fixedRecord.salaryCode,
                  `${forceTwoDigits(supStart.getUTCHours())}:${forceTwoDigits(supStart.getUTCMinutes())}`,
                  `${forceTwoDigits(supEnd.getUTCHours())}:${forceTwoDigits(supEnd.getUTCMinutes())}`,
                  1,
                  fixedRecord.amount,
                  isHoursOnlyNoPay ? '0' : fixedRecord.amount,
                  userName
                )
              )
            // }
          })
      } catch (error) {
        debug && console.log('Error in FIXED ADDONS: ', error)
      }
      debug && fixedSupplements?.length && console.log('XXXXXXXXXXXXXX FINISHED FIXED ADDONS XXXXXXXXXXXXX')
      debug && fixedSupplements?.length && console.log('––––––––––––––––––––––��––––––––––––––––––––––––––––––––––––')

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
            const supStart = convertUTCDateToLocalDate(dataJSON.start / 1000)
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
              console.log('_______________iteration: ', i, ' From hour to hour addon ', fromHourToHourSupplement)
            const supplementStart = convertUTCDateToLocalDate(fromHourToHourSupplement.start)
            const supplementEnd = convertUTCDateToLocalDate(fromHourToHourSupplement.end)
            debug && console.log('Title: ', fromHourToHourSupplement.title)
            debug && console.log('shift Day: ', shiftStart.getUTCDay().toString())
            const weekDaysArray = convertWeekDaysToArray(fromHourToHourSupplement.weekDays)
            debug && console.log('weekDaysArray: ', weekDaysArray)
            const fixed = fromHourToHourSupplement.wageAdjustment === 'fixed' && fromHourToHourSupplement.pcsValue
            const amount = fromHourToHourSupplement.wageAdjustment === 'addToExistingAmount' && fromHourToHourSupplement.pcsValue
            const percentage =
              fromHourToHourSupplement.wageAdjustment === '%' && (data.baseSalary * fromHourToHourSupplement.pcsValue) / 100
            debug && console.log('amount: ', amount)
            debug && console.log('percentage: ', percentage)
            debug && console.log('shiftStartTime: ', new Date(dataJSON.start).toISOString())
            debug && console.log('shiftEndTime: ', new Date(dataJSON.end).toISOString())
            debug && console.log('supStartTime: ', new Date(fromHourToHourSupplement.start * 1000).toISOString())
            debug && console.log('supEndTime: ', new Date(fromHourToHourSupplement.end * 1000).toISOString())

            let fromHourToHourSupplementCalculations
            const supplementIsOnSameDay = supplementStart.getUTCHours() <= supplementEnd.getUTCHours()
            debug && console.log('shiftIsOnSameDay: ', shiftIsOnSameDay ? 'Yes' : 'No')
            debug && console.log('supplementIsOnSameDay: ', supplementIsOnSameDay ? 'Yes' : 'No')
            debug && console.log('!!!!!!!!!!!!!!!!!!!!!! shiftStart.addHours(24): ', new Date(shiftStart).addHours(24).getUTCDay())
            debug && console.log('shiftEnd: ', shiftEnd.toISOString())

            if (
              !weekDaysArray.includes(new Date(shiftStart).getUTCDay()) &&
              !weekDaysArray.includes(new Date(shiftStart).addHours(24).getUTCDay())
            ) {
              debug &&
                console.log(
                  ' 66666 shiftStart is not in weekDaysArray: ',
                  weekDaysArray,
                  new Date(shiftStart).getUTCDay(),
                  new Date(shiftStart).addHours(24).getUTCDay()
                )
              return
            }
            let newStartTime = new Date(dataJSON.start)
            debug && console.log('55 newStartTime before: ', newStartTime)
            while (newStartTime.getUTCDay() !== weekDaysArray[0]) {
              newStartTime.addHours(1 / 60)
            }
            debug && console.log('55 newStartTime after: ', newStartTime)
            if (shiftIsOnSameDay && weekDaysArray.includes(new Date(shiftStart).getUTCDay())) {
              debug && console.log('################## 11 ##################')
              fromHourToHourSupplementCalculations = calculateMinutesWithinRange(
                dataJSON.start,
                dataJSON.end,
                supplementStart,
                supplementEnd,
                false,
                false
              )
            } else if (
              !shiftIsOnSameDay &&
              supplementIsOnSameDay &&
              weekDaysArray.includes(new Date(shiftStart).addHours(24).getUTCDay())
            ) {
              debug && console.log('################## 22 ##################')
              fromHourToHourSupplementCalculations = calculateMinutesWithinRange(
                dataJSON.start,
                dataJSON.end,
                supplementStart,
                supplementEnd,
                supplementIsOnSameDay,
                false
              )
            } else if (!shiftIsOnSameDay && !supplementIsOnSameDay && weekDaysArray.includes(new Date(shiftStart).getUTCDay())) {
              debug && console.log('################## 33 ##################')
              fromHourToHourSupplementCalculations = calculateMinutesWithinRange(
                dataJSON.start,
                dataJSON.end,
                supplementStart,
                supplementEnd,
                true,
                false
              )
            } else if (
              !shiftIsOnSameDay &&
              !supplementIsOnSameDay
              // &&
              // weekDaysArray.includes(new Date(shiftStart).addHours(24).getUTCDay())
            ) {
              debug && console.log('################## 55 ##################')

              fromHourToHourSupplementCalculations = calculateMinutesWithinRange(
                newStartTime,
                dataJSON.end,
                supplementStart,
                supplementEnd,
                false,
                false
              )
            } else {
              debug && console.log('################## 44 ##################')
              debug && console.log('NOT ADDED and returning, suppID: ', fromHourToHourSupplement.id)

              return
            }

            debug && console.log('fromHourToHourSupplementCalculations: ', fromHourToHourSupplementCalculations)

            let hoursWithinRange = fromHourToHourSupplementCalculations.minutesWithinRange / 60
            let fromHourToHourSupplementMoneyAmount = 0
            if (amount) {
              fromHourToHourSupplementMoneyAmount = amount * hoursWithinRange
            } else if (percentage) fromHourToHourSupplementMoneyAmount = percentage * hoursWithinRange
            else if (fixed) fromHourToHourSupplementMoneyAmount = fixed
            totalSalary += fromHourToHourSupplementMoneyAmount
            if (getStrings && fromHourToHourSupplementMoneyAmount > 0) {
              retStrings.push(
                getString(
                  userId,
                  shiftID,
                  fromHourToHourSupplement.id,
                  formatDate(fromHourToHourSupplementCalculations.supStart),
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
  const listOfStrings = (dataString, debug) => calculateSalary(dataString, true, debug)

  //  ******************************************************
  //  ***** BELOW THIS LINE IS NOT PART OF BUBBLE CODE *****
  //  ******************************************************
  console.log('***************** START *****************')
  const calculcatedSalary = calculateSalary(inputData)
  const listofstrings = listOfStrings(inputData, true) || []
  console.log('calculcatedSalary: ', calculcatedSalary)
  console.log('listofstrings: ', listofstrings)
  console.log('***************** END *****************')
  // console.log('=================== START 2 ===================')
  const tempDataRef = null // indataArray[0]
  const tempData = tempDataRef && JSON.parse(tempDataRef)
  const calculcatedSalary2 = tempData && calculateSalary(tempData)
  const listofstrings2 = (tempData && listOfStrings(tempData, true)) || []

  return (
    <div className="App" style={{ textAlign: 'left' }}>
      <div>
        {calculcatedSalary && (
          <>
            <div>
              <h1>
                #1 Shift ID {inputData?.shiftID}
                {inputData?.fasit && ` Fasit : ${inputData?.fasit}`}
              </h1>
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
          </>
        )}
      </div>
      <div>
        {calculcatedSalary2 && (
          <>
            <div>
              <h1>
                #2 Shift ID {tempData?.shiftID}
                {tempData?.fasit && ` Fasit : ${tempData?.fasit}`}
              </h1>
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
        )}
      </div>
      <h1>Tests:</h1>
      {indataArray.map((json, index) => {
        const jsonParsed = JSON.parse(json)
        const calculatedSalary = calculateSalary(jsonParsed)
        return (
          <h3 key={jsonParsed?.shiftID} style={{ color: calculatedSalary === jsonParsed?.fasit ? 'green' : 'red' }}>
            #{index}: Shift ID {jsonParsed?.shiftID}: Calculated: {calculateSalary(jsonParsed)}{' '}
            {jsonParsed?.fasit && ` Correct: ${jsonParsed?.fasit}`}
          </h3>
        )
      })}
    </div>
  )
}

export default App
