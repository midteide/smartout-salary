import './App.css'

function App() {
  const roundNearQtr = (number) => (Math.round(number * 4) / 4).toFixed(2)
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000)
    return this
  }
  const forceTwoDigits = (n) => n.toString().padStart(2, 0)

  const calculateSalary = (dataString) => {
    if (!dataString) return null

    const data = JSON.parse(dataString.substring(0, dataString.length - 1).substring(1))
    console.log('Data: ', data)
    console.log('___________')
    console.log('Shift Status:   ', data.shiftStatus)
    const startTime = data.shiftStatus < 3 ? data.start : data.records[0]?.start
    const endTime = data.shiftStatus < 3 ? data.start : data.records[0]?.end
    const { baseSalary: baseRate, supplements } = data

    const fixedSupplements = supplements.filter((item) => item.type === 'fixed')
    const fromHourToHourSupplements = supplements.filter((item) => item.type === 'fromHourToHour')
    const afterXHoursSupplements = supplements.filter((item) => item.type === 'afterXHours')
    let totalSalary = 0

    // Calculate base salary
    let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
    start.setUTCSeconds(startTime)
    console.log('Day:   ', start.getDay())
    let end = new Date(0) // The 0 there is the key, which sets the date to the epoch
    end.setUTCSeconds(endTime)

    console.log('Start: ', start, start.getDay())
    console.log('End:   ', end, end.getDay())
    if (end.getHours() < start.getHours()) end.setDate(end.getDate() + 1)
    const totalWorkingTime = roundNearQtr((end - start) / 1000 / 60 / 60)
    let regularHours = 0
    // Normal hours
    let normalSupplementTotal = 0
    for (let i = 0; i < totalWorkingTime; i += 0.25) {
      regularHours += 0.25
      normalSupplementTotal += baseRate * 0.25
      totalSalary += baseRate * 0.25
      start.addHours(0.25)
    }

    // Fixed addons
    let fixedSupplementsTotal = 0
    fixedSupplements?.forEach((item) => {
      if (data?.records?.find((item) => item.type === 'supplement')) {
        fixedSupplementsTotal += item.amount
        totalSalary += item.amount
      }
    })

    // After X hours addons
    let afterXHoursSupplementsTotal = 0
    afterXHoursSupplements?.forEach((item) => {
      let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
      start.setUTCSeconds(startTime)
      // console.log('item.weekDays', item.weekDays)
      if (!item?.weekDays?.includes(start.getDay().toString())) return
      const amount = item.wageAdjustment === 'addToExistingAmount' && item.amount
      const percentage = item.wageAdjustment === '%' && (data.baseSalary * item.amount) / 100
      const overtimeMinutes = totalWorkingTime * 60 - parseInt(item.afterMinutes)
      // console.log('amount: ', amount)
      // console.log('data.baseSalary: ', data.baseSalary)
      // console.log('item.amount: ', item.amount)
      // console.log('percentage: ', percentage)
      // console.log('totalHours: ', totalWorkingTime)
      // console.log('totalMinutes: ', totalWorkingTime * 60)
      // console.log('overtimeMinutes: ', overtimeMinutes)
      let loopAmount = 0
      if (overtimeMinutes > 0) {
        if (amount) loopAmount += (amount * overtimeMinutes) / 60
        if (percentage) loopAmount += (percentage * overtimeMinutes) / 60
      }

      console.log('Current afterXHoursSupplementsTotal', loopAmount)
      afterXHoursSupplementsTotal += loopAmount
      totalSalary += loopAmount
    })

    // Ubekvem arbeidstid tillegg
    let fromHourToHourSupplementsTotal = 0
    fromHourToHourSupplements?.forEach((item) => {
      let supStart = new Date(0) // The 0 there is the key, which sets the date to the epoch
      let supEnd = new Date(0) // The 0 there is the key, which sets the date to the epoch
      supStart.setUTCSeconds(item.start)
      supEnd.setUTCSeconds(item.end)
      supStart = new Date('1970-01-01T' + forceTwoDigits(supStart.getHours()) + ':' + forceTwoDigits(supStart.getMinutes()))
      supEnd = new Date('1970-01-01T' + forceTwoDigits(supEnd.getHours()) + ':' + forceTwoDigits(supEnd.getMinutes()))
      if (supEnd.getHours() < supStart.getHours()) supEnd.setDate(supEnd.getDate() + 1)
      let start = new Date(0) // The 0 there is the key, which sets the date to the epoch
      start.setUTCSeconds(startTime)
      start = new Date('1970-01-01T' + forceTwoDigits(start.getHours()) + ':' + forceTwoDigits(start.getMinutes()))

      let end = new Date(0) // The 0 there is the key, which sets the date to the epoch
      end.setUTCSeconds(endTime)

      const amount = item.wageAdjustment === 'addToExistingAmount' && item.amount
      const percentage = item.wageAdjustment === '%' && (data.baseSalary * item.amount) / 100
      // start.setUTCSeconds(startTime)
      // end.setUTCSeconds(endTime)
      let loopAmount = 0
      for (let i = 0; i < totalWorkingTime; i += 0.25) {
        if (start >= supStart && start <= supEnd) {
          if (amount) loopAmount += item.amount * 0.25
          if (percentage) loopAmount += percentage * 0.25
        }
        // console.log('............', amount)
        // console.log('start:', start)
        // console.log('supStart:', supStart)
        // console.log('supEnd:', supEnd)
        // console.log('............')

        start.addHours(0.25)
      }
      console.log('Current fromHourToHourSupplements', loopAmount)
      fromHourToHourSupplementsTotal += loopAmount
      totalSalary += loopAmount
    })
    console.log('---- SUMMARY ----')
    console.log('Normal hours: ' + normalSupplementTotal)
    console.log('Fixed supplement: ' + fixedSupplementsTotal)
    console.log('afterXHoursSupplements supplement: ' + afterXHoursSupplementsTotal)
    console.log('fromHourToHourSupplements supplement: ' + fromHourToHourSupplementsTotal)
    console.log('Total salary: ' + totalSalary)

    // console.log('Lønnsbereging fra ', startTime, ' til ', endTime, ':')
    // console.log('Antall timer jobbet totalt: ', totalWorkingTime)
    // console.log('Vanlige lønn: ', sumNormalComp, ', antall timer: ', regularHours)
    // console.log('Overtid: ', sumOvertimeComp, ', antall timer: ', overtimeHours)
    // // console.log('Kvelds-tillegg: ', sumEveningComp, ', antall timer: ', sumEveningComp / eveningCompensation)
    // // console.log('Natt-tillegg: ', sumNightComp, ', antall timer: ', sumNightComp / nightCompensation)
    // console.log('Totalt: ', totalSalary)

    return totalSalary
  }

  const rawData = `"{"status":"Not Started","baseSalary":195,"start":1678705200,"end":1678728000,"shiftStatus":1,"records":[],"supplements":[{"id":"2","type":"fromHourToHour","wageAdjustment":"addToExistingAmount","amount":44,"start":1677538800,"end":1677560400,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5, 6, 7"},{"id":"4","type":"fixed","wageAdjustment":"addToExistingAmount","amount":500,"start":1677538800,"end":1677538800,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5, 6, 7"},{"id":"5","type":"fromHourToHour","wageAdjustment":"addToExistingAmount","amount":9,"start":1678305600,"end":1678230000,"afterMinutes":"","duration":"","weekDays":"1, 2, 3, 4, 5"},{"id":"6","type":"afterXHours","wageAdjustment":"%","amount":40,"start":1678230000,"end":1678230000,"afterMinutes":"540","duration":"999","weekDays":"1, 2, 3, 4, 5, 6, 7"}]}"`

  const rawDataJSON = {
    status: 'Done',
    baseSalary: 175,
    start: 1678273200,
    end: 1678302000,
    shiftStatus: 3,
    records: [{ type: 'workTime', start: 1678273200, end: 1678310100 }],
    supplements: [
      {
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        amount: 44,
        start: 1677538800,
        end: 1677560400,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        type: 'fixed',
        wageAdjustment: 'addToExistingAmount',
        amount: 500,
        start: 1677538800,
        end: 1677538800,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        type: 'fromHourToHour',
        wageAdjustment: 'addToExistingAmount',
        amount: 9,
        start: 1678305600,
        end: 1678230000,
        afterMinutes: '',
        duration: '',
        weekDays: '1, 2, 3, 4, 5'
      },
      {
        type: 'afterXHours',
        wageAdjustment: '%',
        amount: 40,
        start: 1678230000,
        end: 1678230000,
        afterMinutes: '450',
        duration: '999',
        weekDays: '1, 2, 3, 4, 5, 6, 7'
      },
      {
        type: 'afterXHours',
        wageAdjustment: '%',
        amount: 100,
        start: 1678230000,
        end: 1678230000,
        afterMinutes: '450',
        duration: '999',
        weekDays: '6, 7'
      }
    ]
  }

  // document.querySelector("#app").innerHTML = `
  //   <div>
  //     Salary: ${calculateSalaryLoop(rawData)}
  //   </div>
  // `;

  return <div className="App">{calculateSalary(rawData)}</div>
}

export default App
