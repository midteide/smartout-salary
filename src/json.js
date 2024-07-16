const d = {
  status: 'Approved',
  shiftID: '597131',
  userId: '1',
  title: 'Servitør',
  salaryCode: '1',
  team: 'Servitør',
  userName: 'Pontus S. Lindroth ',
  accountantId: '12',
  baseSalary: 250,
  start: 1721088000000,
  startDate: '16.07.24 00:00',
  end: 1721116800000,
  endDate: '16.07.24 08:00',
  shiftStatus: 4,
  employeeType: 'Hour salary',
  timezoneOffSet: '2',

  records: [
    {
      title: '1337',
      type: 'workTime',
      start: 1721088000,
      startPrint: '16.07.2024 00:00',
      end: 1721124000,
      endPrint: '16.07.2024 08:00',
      id: 1,
      value: 28800.0,
      amount: '0'
    }
  ],

  supplements: [
    {
      id: '12',
      title: 'Natttillegg',
      salaryCode: '9465',
      type: 'fromHourToHour',
      wageAdjustment: 'addToExistingAmount',
      pcsValue: 47.41,
      start: 1721080800,
      startPrint: '14.07.24 00:00',
      end: 1721095200,
      endPrint: '14.07.24 04:00',
      afterMinutes: '0',
      duration: '0',
      weekDays: '1, 2, 3, 4, 5, 6, 0',
      range: 'week',
      employeeTypes: '1, 1',
      teams:
        'First pioneers, Employee, Developer, Employee, Systuen, Brettspill gjengen, Gründerkafe, Parkering, Båt vakter, Servitør, Runner, Hovmester, Administrasjon, Settefiskanlegg, Lærling, Junior Frisør, Elektor, Rør, Kunde, Faggruppe 1, Faggruppe 2'
    }
  ]
}

export const data = JSON.stringify(d)
