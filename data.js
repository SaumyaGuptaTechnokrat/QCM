// ==============================
// SD BIOSENSOR QC Dashboard — data.js
// ==============================

const USERS = [
  { username: 'admin',   password: 'admin123', role: 'QC Manager',  name: 'Dr. Priya Sharma',    email: 'priya@sdbiosensor.com',  status: 'Active', lastLogin: '2026-05-28 09:15' },
  { username: 'analyst', password: 'qc2024',   role: 'QC Analyst',  name: 'Rahul Mehta',         email: 'rahul@sdbiosensor.com',  status: 'Active', lastLogin: '2026-05-28 08:40' },
  { username: 'viewer',  password: 'view123',  role: 'QC Viewer',   name: 'Sneha Kapoor',        email: 'sneha@sdbiosensor.com',  status: 'Active', lastLogin: '2026-05-27 17:00' },
];

const RELEASES = [
  { lot:'LOT-2026-0412', product:'Rapid Antigen Test',   batch:5000,  date:'2026-05-28', status:'Approved',  tat:2.1, analyst:'Rahul Mehta' },
  { lot:'LOT-2026-0411', product:'HbA1c Kit',            batch:3200,  date:'2026-05-27', status:'Approved',  tat:3.5, analyst:'Sneha Kapoor' },
  { lot:'LOT-2026-0410', product:'Dengue NS1 Ag',        batch:2500,  date:'2026-05-26', status:'Pending',   tat:1.2, analyst:'Rahul Mehta' },
];

const OOS_DATA = [
  { no:'OOS-2026-022', product:'Rapid Antigen Test',  param:'Sensitivity',     date:'2026-05-28', rootCause:'Method',     status:'Open',       aging:0,  analyst:'Rahul Mehta' },
  { no:'OOS-2026-021', product:'HbA1c Kit',           param:'Precision',       date:'2026-05-20', rootCause:'Material',   status:'In Progress',aging:8,  analyst:'Sneha Kapoor' },
  { no:'OOS-2026-020', product:'COVID-19 Ag Test',    param:'Specificity',     date:'2026-05-10', rootCause:'Machine',    status:'Closed',      aging:18, analyst:'Rahul Mehta' },
];

const CC_DATA = [
  { no:'CC-2026-026', title:'Buffer Formulation Change',   cat:'Material',  initiated:'2026-05-01', status:'Under Review', risk:'High',   owner:'Dr. Priya Sharma' },
  { no:'CC-2026-025', title:'Label Update – Expiry Format', cat:'Labeling', initiated:'2026-04-25', status:'Approved',     risk:'Low',    owner:'Rahul Mehta' },
  { no:'CC-2026-024', title:'Equipment Qualification IQ',   cat:'Equipment',initiated:'2026-04-20', status:'Implemented',  risk:'Medium', owner:'Sneha Kapoor' },
];

const CAPA_DATA = [
  { no:'CAPA-2026-018', title:'Reagent Sensitivity OOS',      source:'OOS',        opened:'2026-04-10', due:'2026-06-10', status:'Open',               eff:'Pending', owner:'Rahul Mehta' },
  { no:'CAPA-2026-017', title:'Label Discrepancy - Lot 407',  source:'Audit',      opened:'2026-04-01', due:'2026-05-30', status:'In Progress',         eff:'N/A',     owner:'Sneha Kapoor' },
  { no:'CAPA-2026-016', title:'Incubator Temperature Drift',  source:'Calibration',opened:'2026-03-15', due:'2026-05-15', status:'Awaiting Verification',eff:'Pending',owner:'Dr. Priya Sharma' },
 
];

const STABILITY_DATA = [
  { id:'STB-2026-032', product:'COVID-19 Ag Test',    protocol:'ACC/25°C/60%RH',    start:'2025-12-01', nextPull:'2026-06-01', condition:'25°C/60%RH', status:'Active' },
  { id:'STB-2026-031', product:'HbA1c Kit',           protocol:'Accelerated/40°C',  start:'2026-01-15', nextPull:'2026-05-31', condition:'40°C/75%RH', status:'Pull Due' },
  { id:'STB-2026-030', product:'Rapid Antigen Test',  protocol:'Real-time/4–8°C',   start:'2025-06-01', nextPull:'2026-06-05', condition:'4–8°C',     status:'Active' },

];

const COMPLAINT_DATA = [
  { no:'CMP-2026-009', customer:'Apollo Diagnostics',  product:'COVID-19 Ag Test', date:'2026-05-20', cat:'Performance',   status:'Open',       capa:'CAPA-2026-018' },
  { no:'CMP-2026-008', customer:'Max Healthcare',       product:'HbA1c Kit',        date:'2026-05-10', cat:'Packaging',     status:'In Progress',capa:'CAPA-2026-014' },
  { no:'CMP-2026-007', customer:'Lal Path Labs',        product:'Dengue NS1 Ag',    date:'2026-04-28', cat:'Labeling',      status:'Closed',     capa:'CAPA-2026-017' },

];

const CALIBRATION_DATA = [
  { id:'EQ-001', name:'pH Meter',         location:'QC Lab-1',   lastCalib:'2025-11-30', nextDue:'2026-05-30', status:'Due Soon', vendor:'Mettler Toledo' },
  { id:'EQ-002', name:'Incubator',        location:'QC Lab-2',   lastCalib:'2025-12-15', nextDue:'2026-06-02', status:'Due Soon', vendor:'BINDER GmbH' },
  { id:'EQ-003', name:'Analytical Balance',location:'QC Lab-1',  lastCalib:'2026-03-01', nextDue:'2026-09-01', status:'OK',       vendor:'Sartorius' },
];

const TRAINING_DATA = [
  { emp:'Rahul Mehta',       role:'QC Analyst',  module:'GMP Fundamentals',     due:'2026-06-30', completed:'2026-05-10', score:92, status:'Completed' },
  { emp:'Sneha Kapoor',      role:'QC Analyst',  module:'GMP Fundamentals',     due:'2026-06-30', completed:'2026-05-12', score:88, status:'Completed' },
  { emp:'Rahul Mehta',       role:'QC Analyst',  module:'OOS Investigation',    due:'2026-05-31', completed:'',           score:'', status:'Overdue' },

];

const DOCUMENT_DATA = [
  { no:'SOP-001', title:'Sampling Procedure',          cat:'SOP',    version:'v3.2', status:'Approved',    review:'2026-12-01', owner:'Rahul Mehta' },
  { no:'SOP-002', title:'OOS Investigation Procedure', cat:'SOP',    version:'v2.1', status:'Under Review', review:'2026-06-15', owner:'Dr. Priya Sharma' },
  { no:'STP-001', title:'HbA1c Kit Test Method',       cat:'Method', version:'v4.0', status:'Approved',    review:'2027-01-01', owner:'Sneha Kapoor' },
];

const AUDIT_DATA = [
  { no:'AUD-OBS-001', type:'Internal QC Audit',   obs:'Temperature log gap identified in QC Lab-2',  severity:'Major',   due:'2026-06-03', status:'Open',      capa:'CAPA-2026-016' },
  { no:'AUD-OBS-002', type:'Regulatory Audit',    obs:'SOP not followed during sampling – Lot 407',  severity:'Critical',due:'2026-05-30', status:'In Progress',capa:'CAPA-2026-017' },

];

const NOTIFICATIONS = [
  { text:'pH Meter Calibration due on May 30, 2026', type:'warning', time:'2 hours ago' },
  { text:'Stability Pull for HbA1c Kit – 40°C due May 31', type:'warning', time:'2 hours ago' },
];
