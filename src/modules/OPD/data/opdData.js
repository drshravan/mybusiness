export const dashboardStats = [
  { label: "Today's OP", value: '128', meta: '+14 from yesterday' },
  { label: 'Avg per day', value: '96', meta: 'Based on recent OP entries' },
  { label: 'This month OP', value: '2,184', meta: 'Active OP count this month' },
  { label: 'Total Patients', value: '4,862', meta: 'Overall registered patients' },
]

export const opdTrend = [
  { label: 'Jan', value: 52 },
  { label: 'Feb', value: 66 },
  { label: 'Mar', value: 74 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 78 },
  { label: 'Jun', value: 93 },
]

export const symptomBreakdown = [
  { label: 'Fever', value: 34, color: '#5be7ff' },
  { label: 'Cold & Cough', value: 26, color: '#7dffb7' },
  { label: 'Diabetes Review', value: 22, color: '#ff92c2' },
  { label: 'General Checkup', value: 18, color: '#ffc46b' },
]

export const patientFlow = [
  { label: 'Walk-in', value: 42 },
  { label: 'Follow Up', value: 31 },
  { label: 'Lab Review', value: 18 },
  { label: 'Emergency', value: 9 },
]

export const visits = [
  {
    opNo: 'OP-2401',
    patientId: 'PT-1024',
    patientName: 'Sowmya Reddy',
    ageSex: '29 / F',
    village: 'Nellore',
    mobile: '9876543210',
    doctor: 'Dr. Shravan',
    visitDate: '10 Apr 2026',
    time: '09:20 AM',
    complaint: 'Fever, headache',
    diagnosis: 'Viral fever',
    followUp: '13 Apr 2026',
    status: 'Today',
  },
  {
    opNo: 'OP-2402',
    patientId: 'PT-1025',
    patientName: 'Mohan Krishna',
    ageSex: '47 / M',
    village: 'Ongole',
    mobile: '9845123678',
    doctor: 'Dr. Shravan',
    visitDate: '10 Apr 2026',
    time: '10:05 AM',
    complaint: 'Diabetes review',
    diagnosis: 'Blood sugar monitoring',
    followUp: '17 Apr 2026',
    status: 'Today',
  },
  {
    opNo: 'OP-2387',
    patientId: 'PT-0988',
    patientName: 'Farzana Begum',
    ageSex: '33 / F',
    village: 'Kadapa',
    mobile: '9900112244',
    doctor: 'Dr. Shravan',
    visitDate: '08 Apr 2026',
    time: '04:10 PM',
    complaint: 'Cold and cough',
    diagnosis: 'Upper respiratory infection',
    followUp: '12 Apr 2026',
    status: 'Recent',
  },
  {
    opNo: 'OP-2364',
    patientId: 'PT-0912',
    patientName: 'Ravi Teja',
    ageSex: '56 / M',
    village: 'Guntur',
    mobile: '9700044455',
    doctor: 'Dr. Shravan',
    visitDate: '05 Apr 2026',
    time: '11:45 AM',
    complaint: 'Joint pain',
    diagnosis: 'Arthritic pain',
    followUp: '20 Apr 2026',
    status: 'Recent',
  },
]

export const existingPatients = [
  'Sowmya Reddy',
  'Mohan Krishna',
  'Farzana Begum',
  'Ravi Teja',
]

export const dosageOptions = ['OD', 'BD', 'TDS', 'QID', 'SOS', 'STAT']

export const initialRegistration = {
  patientMode: 'new',
  existingPatient: 'Sowmya Reddy',
  patientName: '',
  age: '',
  sex: 'Female',
  village: '',
  mobile: '',
  temperature: '98.4',
  bp: '120/80',
  pulse: '76',
  weight: '64',
  height: '165',
  spo2: '99',
  chiefComplaint: '',
  clinicalExam: '',
  diagnosis: '',
  advice: 'Drink fluids, take rest, monitor symptoms.',
  followUpDate: '2026-04-13',
}

export const initialMedicines = [
  { id: 1, name: 'Paracetamol 650mg', dosage: 'TDS', days: '3', note: 'After food' },
  { id: 2, name: 'Vitamin C', dosage: 'OD', days: '5', note: 'Morning' },
]

export const initialPrintSettings = {
  clinicName: 'Shravan Multispeciality Clinic',
  clinicTagline: 'Outpatient care and review management',
  address: 'Main Road, Nellore',
  doctorName: 'Dr. Shravan',
  qualification: 'MBBS, MD General Medicine',
  registrationNo: 'APMC-20476',
  showAgeSex: true,
  showVillage: true,
  showVitals: true,
  showAdvice: true,
  medicineFormat: 'Detailed',
  textStyle: 'Modern',
  fontSize: 'Medium',
  pageLayout: 'A5 Portrait',
  signatureStyle: 'Digital Signature',
}

export const initialSectionOrder = [
  'Doctor Details',
  'Patient Details',
  'Vitals',
  'Examination',
  'Treatment',
  'Advice',
]
