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
  { lot:'LOT-2026-0409', product:'Malaria RDT',          batch:4000,  date:'2026-05-25', status:'Approved',  tat:4.0, analyst:'Sneha Kapoor' },
  { lot:'LOT-2026-0408', product:'COVID-19 Ag Test',     batch:10000, date:'2026-05-24', status:'Approved',  tat:2.8, analyst:'Rahul Mehta' },
  { lot:'LOT-2026-0407', product:'Influenza A/B',        batch:6000,  date:'2026-05-23', status:'Rejected',  tat:5.2, analyst:'Dr. Priya Sharma' },
  { lot:'LOT-2026-0406', product:'Strep A Rapid Test',   batch:3500,  date:'2026-05-22', status:'Approved',  tat:1.9, analyst:'Rahul Mehta' },
  { lot:'LOT-2026-0405', product:'Troponin I Test',      batch:2000,  date:'2026-05-21', status:'Pending',   tat:3.3, analyst:'Sneha Kapoor' },
];

const OOS_DATA = [
  { no:'OOS-2026-022', product:'Rapid Antigen Test',  param:'Sensitivity',     date:'2026-05-28', rootCause:'Method',     status:'Open',       aging:0,  analyst:'Rahul Mehta' },
  { no:'OOS-2026-021', product:'HbA1c Kit',           param:'Precision',       date:'2026-05-20', rootCause:'Material',   status:'In Progress',aging:8,  analyst:'Sneha Kapoor' },
  { no:'OOS-2026-020', product:'COVID-19 Ag Test',    param:'Specificity',     date:'2026-05-10', rootCause:'Machine',    status:'Closed',      aging:18, analyst:'Rahul Mehta' },
  { no:'OOS-2026-019', product:'Dengue NS1 Ag',       param:'Linearity',       date:'2026-04-28', rootCause:'Method',     status:'Open',       aging:30, analyst:'Dr. Priya Sharma' },
  { no:'OOS-2026-018', product:'Malaria RDT',         param:'Reproducibility', date:'2026-05-15', rootCause:'Man',        status:'In Progress',aging:13, analyst:'Sneha Kapoor' },
  { no:'OOS-2026-017', product:'Troponin I Test',     param:'Accuracy',        date:'2026-05-01', rootCause:'Environment',status:'Closed',      aging:27, analyst:'Rahul Mehta' },
];

const CC_DATA = [
  { no:'CC-2026-026', title:'Buffer Formulation Change',   cat:'Material',  initiated:'2026-05-01', status:'Under Review', risk:'High',   owner:'Dr. Priya Sharma' },
  { no:'CC-2026-025', title:'Label Update – Expiry Format', cat:'Labeling', initiated:'2026-04-25', status:'Approved',     risk:'Low',    owner:'Rahul Mehta' },
  { no:'CC-2026-024', title:'Equipment Qualification IQ',   cat:'Equipment',initiated:'2026-04-20', status:'Implemented',  risk:'Medium', owner:'Sneha Kapoor' },
  { no:'CC-2026-023', title:'SOP Revision – Sampling',      cat:'Process',  initiated:'2026-04-15', status:'Open',         risk:'Medium', owner:'Rahul Mehta' },
  { no:'CC-2026-022', title:'New Supplier Approval',        cat:'Material', initiated:'2026-04-10', status:'Under Review', risk:'High',   owner:'Dr. Priya Sharma' },
  { no:'CC-2026-021', title:'Temperature Monitoring Update', cat:'Equipment',initiated:'2026-04-05', status:'Approved',    risk:'Low',    owner:'Sneha Kapoor' },
];

const CAPA_DATA = [
  { no:'CAPA-2026-018', title:'Reagent Sensitivity OOS',      source:'OOS',        opened:'2026-04-10', due:'2026-06-10', status:'Open',               eff:'Pending', owner:'Rahul Mehta' },
  { no:'CAPA-2026-017', title:'Label Discrepancy - Lot 407',  source:'Audit',      opened:'2026-04-01', due:'2026-05-30', status:'In Progress',         eff:'N/A',     owner:'Sneha Kapoor' },
  { no:'CAPA-2026-016', title:'Incubator Temperature Drift',  source:'Calibration',opened:'2026-03-15', due:'2026-05-15', status:'Awaiting Verification',eff:'Pending',owner:'Dr. Priya Sharma' },
  { no:'CAPA-2026-015', title:'Training Gap – Pipetting',     source:'Training',   opened:'2026-03-01', due:'2026-04-30', status:'Closed',              eff:'Effective',owner:'Rahul Mehta' },
  { no:'CAPA-2026-014', title:'Customer Complaint – Packaging',source:'Complaint', opened:'2026-02-20', due:'2026-04-20', status:'Closed',              eff:'Effective',owner:'Sneha Kapoor' },
  { no:'CAPA-2026-013', title:'Method Validation Gap',        source:'OOS',        opened:'2026-02-10', due:'2026-04-10', status:'Closed',              eff:'Effective',owner:'Dr. Priya Sharma' },
];

const STABILITY_DATA = [
  { id:'STB-2026-032', product:'COVID-19 Ag Test',    protocol:'ACC/25°C/60%RH',    start:'2025-12-01', nextPull:'2026-06-01', condition:'25°C/60%RH', status:'Active' },
  { id:'STB-2026-031', product:'HbA1c Kit',           protocol:'Accelerated/40°C',  start:'2026-01-15', nextPull:'2026-05-31', condition:'40°C/75%RH', status:'Pull Due' },
  { id:'STB-2026-030', product:'Rapid Antigen Test',  protocol:'Real-time/4–8°C',   start:'2025-06-01', nextPull:'2026-06-05', condition:'4–8°C',     status:'Active' },
  { id:'STB-2026-029', product:'Dengue NS1 Ag',       protocol:'ACC/40°C/75%RH',    start:'2026-02-01', nextPull:'2026-08-01', condition:'40°C/75%RH', status:'Active' },
  { id:'STB-2026-028', product:'Malaria RDT',         protocol:'Real-time/25°C',    start:'2025-03-01', nextPull:'2026-09-01', condition:'25°C/60%RH', status:'Active' },
  { id:'STB-2026-027', product:'Troponin I Test',     protocol:'ACC/40°C',          start:'2026-03-01', nextPull:'2026-07-01', condition:'40°C/75%RH', status:'Completed' },
];

const COMPLAINT_DATA = [
  { no:'CMP-2026-009', customer:'Apollo Diagnostics',  product:'COVID-19 Ag Test', date:'2026-05-20', cat:'Performance',   status:'Open',       capa:'CAPA-2026-018' },
  { no:'CMP-2026-008', customer:'Max Healthcare',       product:'HbA1c Kit',        date:'2026-05-10', cat:'Packaging',     status:'In Progress',capa:'CAPA-2026-014' },
  { no:'CMP-2026-007', customer:'Lal Path Labs',        product:'Dengue NS1 Ag',    date:'2026-04-28', cat:'Labeling',      status:'Closed',     capa:'CAPA-2026-017' },
  { no:'CMP-2026-006', customer:'Thyrocare',            product:'Malaria RDT',      date:'2026-04-15', cat:'Performance',   status:'Closed',     capa:'N/A' },
  { no:'CMP-2026-005', customer:'Metropolis',           product:'Rapid Antigen Test',date:'2026-04-02',cat:'Quality',       status:'Closed',     capa:'CAPA-2026-015' },
];

const CALIBRATION_DATA = [
  { id:'EQ-001', name:'pH Meter',         location:'QC Lab-1',   lastCalib:'2025-11-30', nextDue:'2026-05-30', status:'Due Soon', vendor:'Mettler Toledo' },
  { id:'EQ-002', name:'Incubator',        location:'QC Lab-2',   lastCalib:'2025-12-15', nextDue:'2026-06-02', status:'Due Soon', vendor:'BINDER GmbH' },
  { id:'EQ-003', name:'Analytical Balance',location:'QC Lab-1',  lastCalib:'2026-03-01', nextDue:'2026-09-01', status:'OK',       vendor:'Sartorius' },
  { id:'EQ-004', name:'HPLC System',      location:'Chem Lab',   lastCalib:'2026-01-10', nextDue:'2026-07-10', status:'OK',       vendor:'Waters Corp' },
  { id:'EQ-005', name:'Spectrophotometer',location:'QC Lab-2',   lastCalib:'2025-10-01', nextDue:'2026-04-01', status:'Overdue',  vendor:'Shimadzu' },
  { id:'EQ-006', name:'Autoclave',        location:'Microbio Lab',lastCalib:'2025-11-01', nextDue:'2026-05-01', status:'Overdue',  vendor:'Tuttnauer' },
  { id:'EQ-007', name:'Refrigerator (+4°C)',location:'QC Lab-1', lastCalib:'2026-02-01', nextDue:'2026-08-01', status:'OK',       vendor:'Haier BioMedical' },
  { id:'EQ-008', name:'Micropipette Set', location:'QC Lab-1',   lastCalib:'2026-04-01', nextDue:'2026-10-01', status:'OK',       vendor:'Eppendorf' },
];

const TRAINING_DATA = [
  { emp:'Rahul Mehta',       role:'QC Analyst',  module:'GMP Fundamentals',     due:'2026-06-30', completed:'2026-05-10', score:92, status:'Completed' },
  { emp:'Sneha Kapoor',      role:'QC Analyst',  module:'GMP Fundamentals',     due:'2026-06-30', completed:'2026-05-12', score:88, status:'Completed' },
  { emp:'Rahul Mehta',       role:'QC Analyst',  module:'OOS Investigation',    due:'2026-05-31', completed:'',           score:'', status:'Overdue' },
  { emp:'Sneha Kapoor',      role:'QC Analyst',  module:'OOS Investigation',    due:'2026-06-15', completed:'',           score:'', status:'Pending' },
  { emp:'Dr. Priya Sharma',  role:'QC Manager',  module:'Regulatory Affairs',   due:'2026-07-01', completed:'2026-04-20', score:95, status:'Completed' },
  { emp:'Arjun Singh',       role:'Lab Tech',    module:'Equipment Operation',  due:'2026-06-01', completed:'',           score:'', status:'Pending' },
  { emp:'Kavita Rao',        role:'Lab Tech',    module:'Equipment Operation',  due:'2026-06-01', completed:'2026-05-20', score:80, status:'Completed' },
  { emp:'Rahul Mehta',       role:'QC Analyst',  module:'Stability Studies',    due:'2026-06-20', completed:'',           score:'', status:'Pending' },
];

const DOCUMENT_DATA = [
  { no:'SOP-001', title:'Sampling Procedure',          cat:'SOP',    version:'v3.2', status:'Approved',    review:'2026-12-01', owner:'Rahul Mehta' },
  { no:'SOP-002', title:'OOS Investigation Procedure', cat:'SOP',    version:'v2.1', status:'Under Review', review:'2026-06-15', owner:'Dr. Priya Sharma' },
  { no:'STP-001', title:'HbA1c Kit Test Method',       cat:'Method', version:'v4.0', status:'Approved',    review:'2027-01-01', owner:'Sneha Kapoor' },
  { no:'STP-002', title:'COVID-19 Antigen Method',     cat:'Method', version:'v2.3', status:'Approved',    review:'2026-09-01', owner:'Rahul Mehta' },
  { no:'WI-001',  title:'pH Meter Operation',          cat:'Work Instruction',version:'v1.5',status:'Approved',review:'2026-11-01',owner:'Sneha Kapoor' },
  { no:'WI-002',  title:'Incubator Calibration WI',    cat:'Work Instruction',version:'v2.0',status:'Under Review',review:'2026-06-20',owner:'Rahul Mehta' },
  { no:'POL-001', title:'QC Policy Document',          cat:'Policy', version:'v5.0', status:'Approved',    review:'2026-12-31', owner:'Dr. Priya Sharma' },
  { no:'FRM-001', title:'Release Checklist Form',      cat:'Form',   version:'v3.0', status:'Approved',    review:'2026-10-01', owner:'Rahul Mehta' },
  { no:'SOP-003', title:'CAPA Procedure',              cat:'SOP',    version:'v1.2', status:'Draft',       review:'2026-07-01', owner:'Dr. Priya Sharma' },
  { no:'SOP-004', title:'Complaint Handling SOP',      cat:'SOP',    version:'v2.5', status:'Obsolete',    review:'2024-12-01', owner:'Sneha Kapoor' },
];

const AUDIT_DATA = [
  { no:'AUD-OBS-001', type:'Internal QC Audit',   obs:'Temperature log gap identified in QC Lab-2',  severity:'Major',   due:'2026-06-03', status:'Open',      capa:'CAPA-2026-016' },
  { no:'AUD-OBS-002', type:'Regulatory Audit',    obs:'SOP not followed during sampling – Lot 407',  severity:'Critical',due:'2026-05-30', status:'In Progress',capa:'CAPA-2026-017' },
  { no:'AUD-OBS-003', type:'Supplier Audit',      obs:'Certificate of Analysis not reviewed promptly',severity:'Minor',  due:'2026-07-01', status:'Open',      capa:'N/A' },
  { no:'AUD-OBS-004', type:'Internal QC Audit',   obs:'Training records incomplete for 2 personnel', severity:'Major',   due:'2026-05-15', status:'Closed',    capa:'CAPA-2026-015' },
  { no:'AUD-OBS-005', type:'Customer Audit',      obs:'Packaging material specification not updated', severity:'Minor',  due:'2026-06-30', status:'Open',      capa:'N/A' },
];

const NOTIFICATIONS = [
  { text:'pH Meter Calibration due on May 30, 2026', type:'warning', time:'2 hours ago' },
  { text:'Stability Pull for HbA1c Kit – 40°C due May 31', type:'warning', time:'2 hours ago' },
  { text:'Incubator Qualification due June 2, 2026', type:'info', time:'3 hours ago' },
  { text:'CAPA-018 Effectiveness check pending review', type:'error', time:'5 hours ago' },
  { text:'New OOS Investigation OOS-2026-022 created', type:'info', time:'8 hours ago' },
  { text:'Training due: Rahul Mehta – OOS Investigation', type:'warning', time:'1 day ago' },
  { text:'Document SOP-002 under review – awaiting approval', type:'info', time:'1 day ago' },
  { text:'LOT-2026-0407 rejected – CAPA initiated', type:'error', time:'2 days ago' },
];
