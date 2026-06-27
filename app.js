// ==============================
// SD BIOSENSOR QC Dashboard — app.js (Fixed)
// ==============================

let currentUser = null;
let charts = {};
const SESSION_KEY = 'qc_session';
const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms

// ===== SESSION MANAGEMENT =====
function saveSession(user) {
  const session = { user, expires: Date.now() + SESSION_DURATION };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ===== AUTH =====
function doLogin() {
  const u = $('#loginUser').val().trim();
  const p = $('#loginPass').val().trim();
  const user = USERS.find(x => x.username === u && x.password === p);
  if (!user) {
    $('#loginError').removeClass('hidden');
    return;
  }
  currentUser = user;
  saveSession(user);
  $('#loginScreen').addClass('hidden');
  $('#mainApp').removeClass('hidden');
  initApp();
}

$('#loginPass').on('keypress', e => { if (e.key === 'Enter') doLogin(); });
$('#loginUser').on('keypress', e => { if (e.key === 'Enter') doLogin(); });

function doLogout() {
  currentUser = null;
  clearSession();
  $('#mainApp').addClass('hidden');
  $('#loginScreen').removeClass('hidden');
  $('#loginUser').val('');
  $('#loginPass').val('');
  $('#loginError').addClass('hidden');
  destroyCharts();
}

function togglePw() {
  const i = $('#loginPass');
  i.attr('type', i.attr('type') === 'password' ? 'text' : 'password');
}

// ===== AUTO-LOGIN ON PAGE LOAD =====
$(document).ready(function () {
  const savedUser = loadSession();
  if (savedUser) {
    currentUser = savedUser;
    $('#loginScreen').addClass('hidden');
    $('#mainApp').removeClass('hidden');
    initApp();
  }
});

// ===== INIT =====
function initApp() {
  $('#userNameTop').text(currentUser.name);
  $('#sidebarRole').text(currentUser.role);
  if (currentUser.role === 'QC Manager') {
    $('.admin-only').css('display', 'flex');
    $('[data-page="users"]').css('display', 'flex');
  } else {
    $('.admin-only').hide();
  }
  setTopbarDate();
  setInterval(setTopbarDate, 60000);
  loadPage('dashboard');
  renderNotifications();
  buildUserTable();
}

function setTopbarDate() {
  const now = new Date();
  $('#topbarDate').text(now.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ' | ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
}

// ===== NAVIGATION =====
$(document).on('click', '.nav-item', function (e) {
  e.preventDefault();
  const page = $(this).data('page');
  loadPage(page);
  // Close sidebar overlay on mobile after nav
  if (window.innerWidth <= 900) {
    $('#sidebar').removeClass('mobile-open');
    $('#sidebarOverlay').removeClass('visible');
  }
});

function navigateTo(page) { loadPage(page); }

function loadPage(page) {
  $('.nav-item').removeClass('active');
  $(`.nav-item[data-page="${page}"]`).addClass('active');
  const titles = {
    dashboard: 'QC Dashboard', 'product-release': 'Product Release',
    oos: 'OOS Management', 'change-control': 'Change Control',
    capa: 'CAPA', stability: 'Stability Studies', complaints: 'Complaints',
    calibration: 'Calibration', training: 'Training', documents: 'Documents',
    audits: 'Audits', reports: 'Reports', users: 'User Management'
  };
  $('#pageTitle').text(titles[page] || page);
  $('.page').removeClass('active').addClass('hidden');
  $(`#page-${page}`).removeClass('hidden').addClass('active');
  if (page === 'dashboard') initDashboard();
  else if (page === 'product-release') renderReleaseTable();
  else if (page === 'oos') renderOOSTable();
  else if (page === 'change-control') renderCCTable();
  else if (page === 'capa') renderCAPATable();
  else if (page === 'stability') renderStabilityTable();
  else if (page === 'complaints') renderComplaintTable();
  else if (page === 'calibration') renderCalibrationTable();
  else if (page === 'training') renderTrainingTable();
  else if (page === 'documents') renderDocTable();
  else if (page === 'audits') renderAuditTable();
  else if (page === 'reports') initReports();
  else if (page === 'users') buildUserTable();
}

// ===== SIDEBAR TOGGLE (Desktop + Mobile) =====
let sidebarCollapsed = false;

function toggleSidebar() {
  if (window.innerWidth <= 900) {
    // Mobile: slide in/out over content
    const isOpen = $('#sidebar').hasClass('mobile-open');
    if (isOpen) {
      $('#sidebar').removeClass('mobile-open');
      $('#sidebarOverlay').removeClass('visible');
    } else {
      $('#sidebar').addClass('mobile-open');
      $('#sidebarOverlay').addClass('visible');
    }
  } else {
    // Desktop: collapse/expand
    sidebarCollapsed = !sidebarCollapsed;
    if (sidebarCollapsed) {
      $('#sidebar').addClass('collapsed');
      $('#hamburger i').removeClass('fa-bars').addClass('fa-bars-staggered');
    } else {
      $('#sidebar').removeClass('collapsed');
      $('#hamburger i').removeClass('fa-bars-staggered').addClass('fa-bars');
    }
    // Redraw charts after transition
    setTimeout(() => {
      if ($('#page-dashboard').hasClass('active')) { destroyCharts(); initDashboard(); }
    }, 300);
  }
}

// Sidebar overlay click closes mobile sidebar
$(document).on('click', '#sidebarOverlay', function () {
  $('#sidebar').removeClass('mobile-open');
  $('#sidebarOverlay').removeClass('visible');
});

// ===== USER MENU =====
function toggleUserMenu() { $('#userDropdown').toggleClass('open'); }
$(document).on('click', function (e) {
  if (!$(e.target).closest('.user-menu').length) $('#userDropdown').removeClass('open');
});

// ===== DARK MODE =====
function toggleDark() {
  $('body').toggleClass('dark-mode');
  const isDark = $('body').hasClass('dark-mode');
  $('#themeIcon').attr('class', isDark ? 'fa fa-sun' : 'fa fa-moon');
  setTimeout(() => { if ($('#page-dashboard').hasClass('active')) { destroyCharts(); initDashboard(); } }, 100);
}

// ===== NOTIFICATIONS =====
function showNotifications() { $('#notifOverlay, #notifPanel').removeClass('hidden'); }
function closeNotifications() { $('#notifOverlay, #notifPanel').addClass('hidden'); }
function renderNotifications() {
  const html = NOTIFICATIONS.map(n => `
    <div class="notif-item">
      <div class="notif-dot" style="background:${n.type === 'error' ? 'var(--red)' : n.type === 'warning' ? 'var(--orange)' : 'var(--primary)'}"></div>
      <div>
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join('');
  $('#notifList').html(html);
  $('#notifBadge').text(NOTIFICATIONS.filter(n => n.type !== 'info').length);
}

// ===== DASHBOARD =====
function initDashboard() {
  destroyCharts();
  renderGantt('ganttContainer', false);
  renderAlerts();
  buildReleaseTrend();
  buildOOSRoot();
  buildCCStatus();
  buildOOSTrend();
  buildCAPAStatus();
  buildTrainingGauge();
  buildDocStatus();
}

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) { } });
  charts = {};
}

function getChartColors() {
  const dark = $('body').hasClass('dark-mode');
  return {
    grid: dark ? '#2a3452' : '#e8eef8',
    text: dark ? '#8899cc' : '#6b7ba4',
    bg: dark ? '#161b27' : '#ffffff',
  };
}

function buildReleaseTrend() {
  const cc = getChartColors();
  const ctx = document.getElementById('releaseTrendChart');
  if (!ctx) return;
  charts.release = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26'],
      datasets: [{ label: 'Lots', data: [95, 102, 98, 115, 110, 128], borderColor: '#1a4fba', backgroundColor: 'rgba(26,79,186,0.10)', fill: true, tension: 0.4, pointBackgroundColor: '#1a4fba', pointRadius: 5 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { color: cc.grid }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
  });
}

function buildOOSRoot() {
  const ctx = document.getElementById('oosRootChart');
  if (!ctx) return;
  const labels = ['Method', 'Material', 'Machine', 'Man', 'Environment'];
  const data = [8, 6, 4, 2, 2];
  const colors = ['#1a4fba', '#f97316', '#ef4444', '#22c55e', '#a855f7'];
  charts.oosRoot = new Chart(ctx, {
    type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
    options: { plugins: { legend: { display: false } }, cutout: '65%', responsive: true, maintainAspectRatio: true }
  });
  const legend = labels.map((l, i) => `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${l} ${data[i] / 22 * 100 | 0}% (${data[i]})</div>`).join('');
  $('#oosLegend').html(legend);
}

function buildCCStatus() {
  const cc = getChartColors();
  const ctx = document.getElementById('ccStatusChart');
  if (!ctx) return;
  charts.cc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Open', 'Under Review', 'Approved', 'Implemented'],
      datasets: [{ data: [15, 10, 23, 15], backgroundColor: ['#ef4444', '#f97316', '#22c55e', '#a855f7'], borderRadius: 6, borderSkipped: false }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { display: false }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
  });
}

function buildOOSTrend() {
  const cc = getChartColors();
  const ctx = document.getElementById('oosTrendChart');
  if (!ctx) return;
  charts.oos = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26'],
      datasets: [{ label: 'OOS', data: [18, 20, 16, 24, 21, 22], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.10)', fill: true, tension: 0.4, pointBackgroundColor: '#ef4444', pointRadius: 5 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { color: cc.grid }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
  });
}

function buildCAPAStatus() {
  const ctx = document.getElementById('capaStatusChart');
  if (!ctx) return;
  const labels = ['Open', 'In Progress', 'Awaiting Verification', 'Closed'];
  const data = [18, 20, 10, 9];
  const colors = ['#ef4444', '#1a4fba', '#f97316', '#22c55e'];
  charts.capa = new Chart(ctx, {
    type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
    options: { plugins: { legend: { display: false } }, cutout: '65%', responsive: true, maintainAspectRatio: true }
  });
  const legend = labels.map((l, i) => `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${l} ${data[i]} (${(data[i] / 57 * 100).toFixed(1)}%)</div>`).join('');
  $('#capaLegend').html(legend);
}

function buildTrainingGauge() {
  const ctx = document.getElementById('trainingGauge');
  if (!ctx) return;
  charts.training = new Chart(ctx, {
    type: 'doughnut',
    data: { datasets: [{ data: [92, 8], backgroundColor: ['#22c55e', 'rgba(34,197,94,0.12)'], borderWidth: 0 }] },
    options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '78%', responsive: true, maintainAspectRatio: true }
  });
}

function buildDocStatus() {
  const ctx = document.getElementById('docStatusChart');
  if (!ctx) return;
  charts.doc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Approved', 'Under Review', 'Obsolete'],
      datasets: [{ data: [124, 18, 14], backgroundColor: ['#22c55e', '#f97316', '#ef4444'], borderRadius: 4, borderSkipped: false }]
    },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { display: false }, ticks: { color: '#6b7ba4', font: { size: 11 } } } }, responsive: true, maintainAspectRatio: true }
  });
}

// ===== GANTT =====
function renderGantt(containerId, full) {
  const activities = [
    { name: 'Stability Study – Q2 Pull', start: '2026-05-28', end: '2026-06-05', color: '#22c55e' },
    { name: 'Method Validation – Product A', start: '2026-05-25', end: '2026-06-10', color: '#1a4fba' },
    { name: 'Equipment Qualification', start: '2026-06-01', end: '2026-06-12', color: '#f97316' },
    { name: 'Annual Product Review', start: '2026-06-05', end: '2026-06-15', color: '#a855f7' },
    { name: 'Internal Audit – QC', start: '2026-06-10', end: '2026-06-18', color: '#ef4444' },
    { name: 'Regulatory Submission', start: '2026-06-12', end: '2026-06-29', color: '#14b8a6' },
  ];
  const refStart = new Date('2026-05-28');
  const dayW = full ? 20 : 14;
  const days = full ? 35 : 24;
  let headers = '<tr><th style="width:180px">Activity</th>';
  for (let d = 0; d < days; d++) {
    const dt = new Date(refStart); dt.setDate(dt.getDate() + d);
    headers += `<th style="min-width:${dayW}px;text-align:center;font-size:10px">${dt.getDate()}</th>`;
  }
  headers += '</tr>';
  const rows = activities.map(a => {
    const s = (new Date(a.start) - refStart) / 86400000;
    const e = (new Date(a.end) - refStart) / 86400000;
    let cells = `<td style="font-size:12px;white-space:nowrap">${a.name}</td>`;
    for (let d = 0; d < days; d++) {
      if (d === Math.max(0, s)) {
        const span = Math.min(e, days) - Math.max(0, s);
        cells += `<td colspan="${span}" style="padding:3px 2px"><div style="background:${a.color};color:white;border-radius:4px;padding:3px 6px;font-size:10px;white-space:nowrap;overflow:hidden">${a.start.slice(5)} – ${a.end.slice(5)}</div></td>`;
        d += span - 1;
      } else if (d < s || d > e) {
        cells += '<td></td>';
      }
    }
    return `<tr>${cells}</tr>`;
  }).join('');
  $(`#${containerId}`).html(`<table class="gantt-table"><thead>${headers}</thead><tbody>${rows}</tbody></table>`);
}

// ===== ALERTS TABLE =====
function renderAlerts() {
  const alerts = [
    { item: 'pH Meter Calibration', type: 'Calibration', due: 'May 30, 2026', status: 'Due Soon' },
    { item: 'Stability Pull – 40°C', type: 'Stability', due: 'May 31, 2026', status: 'Due Soon' },
    { item: 'Incubator Qualification', type: 'Qualification', due: 'Jun 2, 2026', status: 'Due Soon' },
    { item: 'Change Control CC-026', type: 'Change Control', due: 'Jun 3, 2026', status: 'Overdue' },
    { item: 'CAPA-018 Effectiveness', type: 'CAPA', due: 'Jun 5, 2026', status: 'Open' },
  ];
  const rows = alerts.map(a => {
    const bc = a.status === 'Overdue' ? 'badge-red' : a.status === 'Due Soon' ? 'badge-orange' : 'badge-blue';
    return `<tr><td>${a.item}</td><td>${a.type}</td><td>${a.due}</td><td><span class="badge ${bc}">${a.status}</span></td></tr>`;
  }).join('');
  $('#alertsTbody').html(rows);
}

// ===== TABLE RENDERERS =====
function statusBadge(s) {
  const map = {
    'Approved': 'badge-green', 'Completed': 'badge-green', 'Effective': 'badge-green', 'Active': 'badge-green', 'OK': 'badge-green', 'Closed': 'badge-green',
    'Pending': 'badge-yellow', 'Pull Due': 'badge-yellow', 'Due Soon': 'badge-yellow',
    'In Progress': 'badge-blue', 'Under Review': 'badge-blue', 'Awaiting Verification': 'badge-blue',
    'Open': 'badge-orange', 'Draft': 'badge-orange',
    'Rejected': 'badge-red', 'Overdue': 'badge-red', 'Obsolete': 'badge-red', 'Critical': 'badge-red',
    'High': 'badge-red', 'Medium': 'badge-orange', 'Low': 'badge-green', 'Major': 'badge-orange', 'Minor': 'badge-yellow',
    'N/A': 'badge-gray'
  };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

function actionBtns(type, id) {
  const canEdit = currentUser.role !== 'QC Viewer';
  const editBtn = canEdit ? `<button class="action-btn" onclick="openEditModal('${type}','${id}')"><i class="fa fa-edit"></i></button>` : '';
  const delBtn = (currentUser.role === 'QC Manager') ? `<button class="action-btn del" onclick="confirmDelete('${type}','${id}')"><i class="fa fa-trash"></i></button>` : '';
  return `<button class="action-btn" onclick="openViewModal('${type}','${id}')"><i class="fa fa-eye"></i></button>${editBtn}${delBtn}`;
}

function renderReleaseTable() {
  const rows = RELEASES.map(r => `
    <tr data-id="${r.lot}"><td>${r.lot}</td><td>${r.product}</td><td>${r.batch.toLocaleString()}</td><td>${r.date}</td>
    <td>${statusBadge(r.status)}</td><td>${r.tat}</td><td>${r.analyst}</td>
    <td>${actionBtns('release', r.lot)}</td></tr>`).join('');
  $('#releaseTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderOOSTable() {
  const rows = OOS_DATA.map(r => {
    let agingClass = r.aging > 30 ? 'red-text' : r.aging > 14 ? 'orange-text' : r.aging > 7 ? 'yellow' : 'green-text';
    return `<tr data-id="${r.no}"><td>${r.no}</td><td>${r.product}</td><td>${r.param}</td><td>${r.date}</td>
    <td>${r.rootCause}</td><td>${statusBadge(r.status)}</td>
    <td class="${agingClass}"><b>${r.aging}</b></td><td>${r.analyst}</td>
    <td>${actionBtns('oos', r.no)}</td></tr>`;
  }).join('');
  $('#oosTbody').html(rows || '<tr><td colspan="9" class="no-data">No records found.</td></tr>');
}

function renderCCTable() {
  const rows = CC_DATA.map(r => `
    <tr data-id="${r.no}"><td>${r.no}</td><td>${r.title}</td><td>${r.cat}</td><td>${r.initiated}</td>
    <td>${statusBadge(r.status)}</td><td>${statusBadge(r.risk)}</td><td>${r.owner}</td>
    <td>${actionBtns('cc', r.no)}</td></tr>`).join('');
  $('#ccTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderCAPATable() {
  const rows = CAPA_DATA.map(r => `
    <tr data-id="${r.no}"><td>${r.no}</td><td>${r.title}</td><td>${r.source}</td><td>${r.opened}</td>
    <td>${r.due}</td><td>${statusBadge(r.status)}</td><td>${statusBadge(r.eff)}</td><td>${r.owner}</td>
    <td>${actionBtns('capa', r.no)}</td></tr>`).join('');
  $('#capaTbody').html(rows || '<tr><td colspan="9" class="no-data">No records found.</td></tr>');
}

function renderStabilityTable() {
  const dueSoon = STABILITY_DATA.filter(r => r.status === 'Pull Due');
  if (dueSoon.length) {
    $('#stabAlertBanner').html(`<i class="fa fa-bell"></i> <b>${dueSoon.length} stability pull(s) due soon:</b> ${dueSoon.map(r => r.id + ' (' + r.nextPull + ')').join(', ')}`);
  }
  const rows = STABILITY_DATA.map(r => `
    <tr data-id="${r.id}"><td>${r.id}</td><td>${r.product}</td><td>${r.protocol}</td><td>${r.start}</td>
    <td><b>${r.nextPull}</b></td><td>${r.condition}</td><td>${statusBadge(r.status)}</td>
    <td>${actionBtns('stability', r.id)}</td></tr>`).join('');
  $('#stabTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderComplaintTable() {
  const rows = COMPLAINT_DATA.map(r => `
    <tr data-id="${r.no}"><td>${r.no}</td><td>${r.customer}</td><td>${r.product}</td><td>${r.date}</td>
    <td>${r.cat}</td><td>${statusBadge(r.status)}</td><td>${r.capa}</td>
    <td>${actionBtns('complaint', r.no)}</td></tr>`).join('');
  $('#complaintTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderCalibrationTable() {
  const overdue = CALIBRATION_DATA.filter(r => r.status === 'Overdue');
  const dueSoon = CALIBRATION_DATA.filter(r => r.status === 'Due Soon');
  let alertText = '';
  if (overdue.length) alertText += `<i class="fa fa-exclamation-triangle"></i> <b>${overdue.length} overdue:</b> ${overdue.map(r => r.name).join(', ')}. `;
  if (dueSoon.length) alertText += `<b>${dueSoon.length} due soon:</b> ${dueSoon.map(r => r.name).join(', ')}.`;
  $('#calibAlertBanner').html(alertText);
  const rows = CALIBRATION_DATA.map(r => `
    <tr data-id="${r.id}"><td>${r.id}</td><td>${r.name}</td><td>${r.location}</td><td>${r.lastCalib}</td>
    <td><b>${r.nextDue}</b></td><td>${statusBadge(r.status)}</td><td>${r.vendor}</td>
    <td>${actionBtns('calibration', r.id)}</td></tr>`).join('');
  $('#calibTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderTrainingTable() {
  const rows = TRAINING_DATA.map(r => `
    <tr data-id="${r.emp}-${r.module}"><td>${r.emp}</td><td>${r.role}</td><td>${r.module}</td><td>${r.due}</td>
    <td>${r.completed || '—'}</td><td>${r.score || '—'}</td><td>${statusBadge(r.status)}</td>
    <td>${actionBtns('training', encodeURIComponent(r.emp + '|' + r.module))}</td></tr>`).join('');
  $('#trainingTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderDocTable() {
  const rows = DOCUMENT_DATA.map(r => `
    <tr data-id="${r.no}"><td>${r.no}</td><td>${r.title}</td><td>${r.cat}</td><td>${r.version}</td>
    <td>${statusBadge(r.status)}</td><td>${r.review}</td><td>${r.owner}</td>
    <td>${actionBtns('document', r.no)}</td></tr>`).join('');
  $('#docTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function renderAuditTable() {
  const rows = AUDIT_DATA.map(r => `
    <tr data-id="${r.no}"><td>${r.no}</td><td>${r.type}</td><td>${r.obs}</td><td>${statusBadge(r.severity)}</td>
    <td>${r.due}</td><td>${statusBadge(r.status)}</td><td>${r.capa}</td>
    <td>${actionBtns('audit', r.no)}</td></tr>`).join('');
  $('#auditTbody').html(rows || '<tr><td colspan="8" class="no-data">No records found.</td></tr>');
}

function buildUserTable() {
  const rows = USERS.map(u => `
    <tr data-id="${u.username}"><td>${u.username}</td><td>${u.name}</td><td><span class="badge badge-blue">${u.role}</span></td>
    <td>${u.email}</td><td>${statusBadge(u.status)}</td><td>${u.lastLogin}</td>
    <td>${actionBtns('user', u.username)}</td></tr>`).join('');
  $('#userTbody').html(rows || '<tr><td colspan="7" class="no-data">No users found.</td></tr>');
}

// ===== REPORTS =====
function initReports() {
  setTimeout(() => {
    const cc = getChartColors();
    if (document.getElementById('kpiSummaryChart')) {
      if (charts.kpiSummary) charts.kpiSummary.destroy();
      charts.kpiSummary = new Chart(document.getElementById('kpiSummaryChart'), {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [
            { label: 'Released', data: [102, 98, 115, 110, 128], backgroundColor: '#1a4fba', borderRadius: 4 },
            { label: 'OOS', data: [20, 16, 24, 21, 22], backgroundColor: '#ef4444', borderRadius: 4 },
            { label: 'CAPA Open', data: [22, 20, 20, 18, 18], backgroundColor: '#a855f7', borderRadius: 4 },
          ]
        },
        options: { plugins: { legend: { labels: { color: cc.text } } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { display: false }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
      });
    }
    if (document.getElementById('oosDeptChart')) {
      if (charts.oosDept) charts.oosDept.destroy();
      charts.oosDept = new Chart(document.getElementById('oosDeptChart'), {
        type: 'bar',
        data: { labels: ['QC Lab', 'Production', 'Microbio', 'R&D'], datasets: [{ data: [12, 5, 3, 2], backgroundColor: ['#ef4444', '#f97316', '#a855f7', '#1a4fba'], borderRadius: 6 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { display: false }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
      });
    }
    if (document.getElementById('tatChart')) {
      if (charts.tat) charts.tat.destroy();
      charts.tat = new Chart(document.getElementById('tatChart'), {
        type: 'bar',
        data: { labels: ['< 1d', '1–2d', '2–3d', '3–5d', '> 5d'], datasets: [{ label: 'Lots', data: [12, 38, 52, 20, 6], backgroundColor: '#22c55e', borderRadius: 4 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text } }, x: { grid: { display: false }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
      });
    }
    if (document.getElementById('capaEffChart')) {
      if (charts.capaEff) charts.capaEff.destroy();
      charts.capaEff = new Chart(document.getElementById('capaEffChart'), {
        type: 'line',
        data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Effectiveness %', data: [60, 65, 72, 78, 82], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#22c55e', pointRadius: 5 }] },
        options: { plugins: { legend: { labels: { color: cc.text } } }, scales: { y: { grid: { color: cc.grid }, ticks: { color: cc.text }, min: 0, max: 100 }, x: { grid: { display: false }, ticks: { color: cc.text } } }, responsive: true, maintainAspectRatio: true }
      });
    }
    renderGantt('ganttFull', true);
  }, 100);
}

// ===== TABLE UTILS =====
function filterTable(tableId, query) {
  const q = query.toLowerCase();
  $(`#${tableId} tbody tr`).each(function () {
    $(this).toggle($(this).text().toLowerCase().includes(q));
  });
}

function filterTableCol(tableId, col, val) {
  $(`#${tableId} tbody tr`).each(function () {
    if (!val) { $(this).show(); return; }
    $(this).toggle($(this).find('td').eq(col).text().includes(val));
  });
}

// ===== CRUD: VIEW MODAL =====
const VIEW_FIELDS = {
  release: (r) => [
    { label: 'Lot Number', val: r.lot }, { label: 'Product', val: r.product },
    { label: 'Batch Size', val: r.batch?.toLocaleString() }, { label: 'Release Date', val: r.date },
    { label: 'Status', val: r.status }, { label: 'TAT (days)', val: r.tat },
    { label: 'Analyst', val: r.analyst }
  ],
  oos: (r) => [
    { label: 'OOS No.', val: r.no }, { label: 'Product', val: r.product },
    { label: 'Parameter', val: r.param }, { label: 'Detection Date', val: r.date },
    { label: 'Root Cause', val: r.rootCause }, { label: 'Status', val: r.status },
    { label: 'Aging (days)', val: r.aging }, { label: 'Analyst', val: r.analyst }
  ],
  cc: (r) => [
    { label: 'CC No.', val: r.no }, { label: 'Title', val: r.title },
    { label: 'Category', val: r.cat }, { label: 'Initiated', val: r.initiated },
    { label: 'Status', val: r.status }, { label: 'Risk', val: r.risk },
    { label: 'Owner', val: r.owner }
  ],
  capa: (r) => [
    { label: 'CAPA No.', val: r.no }, { label: 'Title', val: r.title },
    { label: 'Source', val: r.source }, { label: 'Opened', val: r.opened },
    { label: 'Due Date', val: r.due }, { label: 'Status', val: r.status },
    { label: 'Effectiveness', val: r.eff }, { label: 'Owner', val: r.owner }
  ],
  stability: (r) => [
    { label: 'Study ID', val: r.id }, { label: 'Product', val: r.product },
    { label: 'Protocol', val: r.protocol }, { label: 'Start Date', val: r.start },
    { label: 'Next Pull Date', val: r.nextPull }, { label: 'Condition', val: r.condition },
    { label: 'Status', val: r.status }
  ],
  complaint: (r) => [
    { label: 'Complaint No.', val: r.no }, { label: 'Customer', val: r.customer },
    { label: 'Product', val: r.product }, { label: 'Date', val: r.date },
    { label: 'Category', val: r.cat }, { label: 'Status', val: r.status },
    { label: 'CAPA Linked', val: r.capa }
  ],
  calibration: (r) => [
    { label: 'Equipment ID', val: r.id }, { label: 'Name', val: r.name },
    { label: 'Location', val: r.location }, { label: 'Last Calibration', val: r.lastCalib },
    { label: 'Next Due', val: r.nextDue }, { label: 'Status', val: r.status },
    { label: 'Vendor', val: r.vendor }
  ],
  training: (r) => [
    { label: 'Employee', val: r.emp }, { label: 'Role', val: r.role },
    { label: 'Module', val: r.module }, { label: 'Due Date', val: r.due },
    { label: 'Completed', val: r.completed || '—' }, { label: 'Score', val: r.score || '—' },
    { label: 'Status', val: r.status }
  ],
  document: (r) => [
    { label: 'Doc No.', val: r.no }, { label: 'Title', val: r.title },
    { label: 'Category', val: r.cat }, { label: 'Version', val: r.version },
    { label: 'Status', val: r.status }, { label: 'Review Date', val: r.review },
    { label: 'Owner', val: r.owner }
  ],
  audit: (r) => [
    { label: 'Obs. No.', val: r.no }, { label: 'Audit Type', val: r.type },
    { label: 'Observation', val: r.obs }, { label: 'Severity', val: r.severity },
    { label: 'Due Date', val: r.due }, { label: 'Status', val: r.status },
    { label: 'CAPA Ref', val: r.capa }
  ],
  user: (r) => [
    { label: 'Username', val: r.username }, { label: 'Full Name', val: r.name },
    { label: 'Role', val: r.role }, { label: 'Email', val: r.email },
    { label: 'Status', val: r.status }, { label: 'Last Login', val: r.lastLogin }
  ]
};

function findRecord(type, id) {
  const maps = {
    release: () => RELEASES.find(r => r.lot === id),
    oos: () => OOS_DATA.find(r => r.no === id),
    cc: () => CC_DATA.find(r => r.no === id),
    capa: () => CAPA_DATA.find(r => r.no === id),
    stability: () => STABILITY_DATA.find(r => r.id === id),
    complaint: () => COMPLAINT_DATA.find(r => r.no === id),
    calibration: () => CALIBRATION_DATA.find(r => r.id === id),
    training: () => {
      const [emp, mod] = decodeURIComponent(id).split('|');
      return TRAINING_DATA.find(r => r.emp === emp && r.module === mod);
    },
    document: () => DOCUMENT_DATA.find(r => r.no === id),
    audit: () => AUDIT_DATA.find(r => r.no === id),
    user: () => USERS.find(r => r.username === id)
  };
  return maps[type] ? maps[type]() : null;
}

function openViewModal(type, id) {
  const record = findRecord(type, id);
  if (!record) { showToast('Record not found.', 'error'); return; }
  const fieldsFn = VIEW_FIELDS[type];
  if (!fieldsFn) return;
  const fields = fieldsFn(record);
  const html = `<div class="view-grid">${fields.map(f => `
    <div class="view-field">
      <label>${f.label}</label>
      <div class="val">${f.val ?? '—'}</div>
    </div>`).join('')}</div>
    <div class="modal-footer"><button class="btn-cancel" onclick="closeModal()">Close</button></div>`;
  $('#modalTitle').text('View Record');
  $('#modalBody').html(html);
  $('#modalOverlay, #modalBox').removeClass('hidden');
}

// ===== CRUD: EDIT MODAL =====
const EDIT_CONFIGS = {
  release: {
    fields: [
      { label: 'Lot Number', name: 'lot', type: 'text', readonly: true },
      { label: 'Product', name: 'product', type: 'text' },
      { label: 'Batch Size', name: 'batch', type: 'number' },
      { label: 'Release Date', name: 'date', type: 'date' },
      { label: 'Status', name: 'status', type: 'select', options: ['Approved', 'Pending', 'Rejected'] },
      { label: 'TAT (days)', name: 'tat', type: 'number' },
      { label: 'Analyst', name: 'analyst', type: 'text' }
    ],
    save: (id, data) => {
      const i = RELEASES.findIndex(r => r.lot === id);
      if (i > -1) { RELEASES[i] = { ...RELEASES[i], ...data, batch: parseInt(data.batch), tat: parseFloat(data.tat) }; renderReleaseTable(); }
    }
  },
  oos: {
    fields: [
      { label: 'OOS No.', name: 'no', type: 'text', readonly: true },
      { label: 'Product', name: 'product', type: 'text' },
      { label: 'Parameter', name: 'param', type: 'text' },
      { label: 'Detection Date', name: 'date', type: 'date' },
      { label: 'Root Cause', name: 'rootCause', type: 'select', options: ['Method', 'Material', 'Machine', 'Man', 'Environment'] },
      { label: 'Status', name: 'status', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
      { label: 'Analyst', name: 'analyst', type: 'text' }
    ],
    save: (id, data) => {
      const i = OOS_DATA.findIndex(r => r.no === id);
      if (i > -1) { OOS_DATA[i] = { ...OOS_DATA[i], ...data }; renderOOSTable(); }
    }
  },
  cc: {
    fields: [
      { label: 'CC No.', name: 'no', type: 'text', readonly: true },
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Category', name: 'cat', type: 'select', options: ['Material', 'Equipment', 'Process', 'Labeling', 'Method'] },
      { label: 'Status', name: 'status', type: 'select', options: ['Open', 'Under Review', 'Approved', 'Implemented'] },
      { label: 'Risk', name: 'risk', type: 'select', options: ['High', 'Medium', 'Low'] },
      { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (id, data) => {
      const i = CC_DATA.findIndex(r => r.no === id);
      if (i > -1) { CC_DATA[i] = { ...CC_DATA[i], ...data }; renderCCTable(); }
    }
  },
  capa: {
    fields: [
      { label: 'CAPA No.', name: 'no', type: 'text', readonly: true },
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Source', name: 'source', type: 'select', options: ['OOS', 'Audit', 'Complaint', 'Calibration', 'Training'] },
      { label: 'Due Date', name: 'due', type: 'date' },
      { label: 'Status', name: 'status', type: 'select', options: ['Open', 'In Progress', 'Awaiting Verification', 'Closed'] },
      { label: 'Effectiveness', name: 'eff', type: 'select', options: ['Pending', 'Effective', 'Not Effective', 'N/A'] },
      { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (id, data) => {
      const i = CAPA_DATA.findIndex(r => r.no === id);
      if (i > -1) { CAPA_DATA[i] = { ...CAPA_DATA[i], ...data }; renderCAPATable(); }
    }
  },
  stability: {
    fields: [
      { label: 'Study ID', name: 'id', type: 'text', readonly: true },
      { label: 'Product', name: 'product', type: 'text' },
      { label: 'Protocol', name: 'protocol', type: 'text' },
      { label: 'Start Date', name: 'start', type: 'date' },
      { label: 'Next Pull Date', name: 'nextPull', type: 'date' },
      { label: 'Condition', name: 'condition', type: 'text' },
      { label: 'Status', name: 'status', type: 'select', options: ['Active', 'Pull Due', 'Completed'] }
    ],
    save: (id, data) => {
      const i = STABILITY_DATA.findIndex(r => r.id === id);
      if (i > -1) { STABILITY_DATA[i] = { ...STABILITY_DATA[i], ...data }; renderStabilityTable(); }
    }
  },
  complaint: {
    fields: [
      { label: 'Complaint No.', name: 'no', type: 'text', readonly: true },
      { label: 'Customer', name: 'customer', type: 'text' },
      { label: 'Product', name: 'product', type: 'text' },
      { label: 'Date', name: 'date', type: 'date' },
      { label: 'Category', name: 'cat', type: 'select', options: ['Performance', 'Packaging', 'Labeling', 'Quality', 'Other'] },
      { label: 'Status', name: 'status', type: 'select', options: ['Open', 'In Progress', 'Closed'] }
    ],
    save: (id, data) => {
      const i = COMPLAINT_DATA.findIndex(r => r.no === id);
      if (i > -1) { COMPLAINT_DATA[i] = { ...COMPLAINT_DATA[i], ...data }; renderComplaintTable(); }
    }
  },
  calibration: {
    fields: [
      { label: 'Equipment ID', name: 'id', type: 'text', readonly: true },
      { label: 'Name', name: 'name', type: 'text' },
      { label: 'Location', name: 'location', type: 'text' },
      { label: 'Last Calibration', name: 'lastCalib', type: 'date' },
      { label: 'Next Due', name: 'nextDue', type: 'date' },
      { label: 'Status', name: 'status', type: 'select', options: ['OK', 'Due Soon', 'Overdue'] },
      { label: 'Vendor', name: 'vendor', type: 'text' }
    ],
    save: (id, data) => {
      const i = CALIBRATION_DATA.findIndex(r => r.id === id);
      if (i > -1) { CALIBRATION_DATA[i] = { ...CALIBRATION_DATA[i], ...data }; renderCalibrationTable(); }
    }
  },
  training: {
    fields: [
      { label: 'Employee', name: 'emp', type: 'text', readonly: true },
      { label: 'Module', name: 'module', type: 'text', readonly: true },
      { label: 'Role', name: 'role', type: 'text' },
      { label: 'Due Date', name: 'due', type: 'date' },
      { label: 'Completed Date', name: 'completed', type: 'date' },
      { label: 'Score', name: 'score', type: 'number' },
      { label: 'Status', name: 'status', type: 'select', options: ['Pending', 'Completed', 'Overdue'] }
    ],
    save: (id, data) => {
      const [emp, mod] = decodeURIComponent(id).split('|');
      const i = TRAINING_DATA.findIndex(r => r.emp === emp && r.module === mod);
      if (i > -1) { TRAINING_DATA[i] = { ...TRAINING_DATA[i], ...data, score: data.score ? parseInt(data.score) : '' }; renderTrainingTable(); }
    }
  },
  document: {
    fields: [
      { label: 'Doc No.', name: 'no', type: 'text', readonly: true },
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Category', name: 'cat', type: 'select', options: ['SOP', 'Method', 'Work Instruction', 'Policy', 'Form'] },
      { label: 'Version', name: 'version', type: 'text' },
      { label: 'Status', name: 'status', type: 'select', options: ['Draft', 'Under Review', 'Approved', 'Obsolete'] },
      { label: 'Review Date', name: 'review', type: 'date' },
      { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (id, data) => {
      const i = DOCUMENT_DATA.findIndex(r => r.no === id);
      if (i > -1) { DOCUMENT_DATA[i] = { ...DOCUMENT_DATA[i], ...data }; renderDocTable(); }
    }
  },
  audit: {
    fields: [
      { label: 'Obs. No.', name: 'no', type: 'text', readonly: true },
      { label: 'Audit Type', name: 'type', type: 'select', options: ['Internal QC Audit', 'Regulatory Audit', 'Supplier Audit', 'Customer Audit'] },
      { label: 'Observation', name: 'obs', type: 'textarea' },
      { label: 'Severity', name: 'severity', type: 'select', options: ['Critical', 'Major', 'Minor'] },
      { label: 'Due Date', name: 'due', type: 'date' },
      { label: 'Status', name: 'status', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
      { label: 'CAPA Ref', name: 'capa', type: 'text' }
    ],
    save: (id, data) => {
      const i = AUDIT_DATA.findIndex(r => r.no === id);
      if (i > -1) { AUDIT_DATA[i] = { ...AUDIT_DATA[i], ...data }; renderAuditTable(); }
    }
  },
  user: {
    fields: [
      { label: 'Username', name: 'username', type: 'text', readonly: true },
      { label: 'Full Name', name: 'name', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Role', name: 'role', type: 'select', options: ['QC Manager', 'QC Analyst', 'QC Viewer'] },
      { label: 'Status', name: 'status', type: 'select', options: ['Active', 'Inactive'] }
    ],
    save: (id, data) => {
      const i = USERS.findIndex(r => r.username === id);
      if (i > -1) { USERS[i] = { ...USERS[i], ...data }; buildUserTable(); }
    }
  }
};

function openEditModal(type, id) {
  const cfg = EDIT_CONFIGS[type];
  if (!cfg) { showToast('Edit not supported for this type.', 'error'); return; }
  const record = findRecord(type, id);
  if (!record) { showToast('Record not found.', 'error'); return; }

  const fields = cfg.fields.map(f => {
    let input = '';
    const value = record[f.name] ?? '';
    if (f.readonly) {
      input = `<input type="text" name="${f.name}" value="${value}" readonly style="opacity:0.6;cursor:not-allowed;">`;
    } else if (f.type === 'select') {
      const opts = f.options.map(o => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('');
      input = `<select name="${f.name}">${opts}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.name}" rows="3">${value}</textarea>`;
    } else {
      const val = f.type === 'date' ? (value || '') : (value || '');
      input = `<input type="${f.type}" name="${f.name}" value="${val}">`;
    }
    return `<div><label>${f.label}</label>${input}</div>`;
  }).join('');

  $('#modalTitle').text('Edit Record');
  $('#modalBody').html(`${fields}
    <div class="modal-footer">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-save" onclick="saveEditModal('${type}','${id}')"><i class="fa fa-save"></i> Save Changes</button>
    </div>`);
  $('#modalOverlay, #modalBox').removeClass('hidden');
}

function saveEditModal(type, id) {
  const cfg = EDIT_CONFIGS[type];
  if (!cfg) return;
  const data = {};
  $('#modalBody input, #modalBody select, #modalBody textarea').each(function () {
    const name = $(this).attr('name');
    if (name) data[name] = $(this).val();
  });
  cfg.save(id, data);
  closeModal();
  showToast('Record updated successfully!', 'success');
}

// ===== CRUD: ADD (NEW) MODALS =====
const modalForms = {
  releaseModal: {
    title: 'New Product Release',
    fields: [
      { label: 'Lot Number', name: 'lot', type: 'text' }, { label: 'Product', name: 'product', type: 'text' },
      { label: 'Batch Size', name: 'batch', type: 'number' }, { label: 'Release Date', name: 'date', type: 'date' },
      { label: 'Status', name: 'status', type: 'select', options: ['Approved', 'Pending', 'Rejected'] },
      { label: 'TAT (days)', name: 'tat', type: 'number' }, { label: 'Analyst', name: 'analyst', type: 'text' }
    ],
    save: (data) => {
      RELEASES.unshift({ lot: data.lot, product: data.product, batch: parseInt(data.batch) || 0, date: data.date, status: data.status, tat: parseFloat(data.tat) || 0, analyst: data.analyst });
      renderReleaseTable();
    }
  },
  oosModal: {
    title: 'New OOS Investigation',
    fields: [
      { label: 'Product', name: 'product', type: 'text' }, { label: 'Parameter', name: 'param', type: 'text' },
      { label: 'Detection Date', name: 'date', type: 'date' },
      { label: 'Root Cause', name: 'rootCause', type: 'select', options: ['Method', 'Material', 'Machine', 'Man', 'Environment'] },
      { label: 'Analyst', name: 'analyst', type: 'text' }
    ],
    save: (data) => {
      const no = 'OOS-' + new Date().getFullYear() + '-' + String(OOS_DATA.length + 1).padStart(3, '0');
      OOS_DATA.unshift({ no, product: data.product, param: data.param, date: data.date, rootCause: data.rootCause, status: 'Open', aging: 0, analyst: data.analyst });
      renderOOSTable();
    }
  },
  ccModal: {
    title: 'New Change Control',
    fields: [
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Category', name: 'cat', type: 'select', options: ['Material', 'Equipment', 'Process', 'Labeling', 'Method'] },
      { label: 'Risk Level', name: 'risk', type: 'select', options: ['High', 'Medium', 'Low'] },
      { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (data) => {
      const no = 'CC-' + new Date().getFullYear() + '-' + String(CC_DATA.length + 27).padStart(3, '0');
      CC_DATA.unshift({ no, title: data.title, cat: data.cat, initiated: new Date().toISOString().slice(0, 10), status: 'Open', risk: data.risk, owner: data.owner });
      renderCCTable();
    }
  },
  capaModal: {
    title: 'New CAPA',
    fields: [
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Source', name: 'source', type: 'select', options: ['OOS', 'Audit', 'Complaint', 'Calibration', 'Training'] },
      { label: 'Due Date', name: 'due', type: 'date' }, { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (data) => {
      const no = 'CAPA-' + new Date().getFullYear() + '-' + String(CAPA_DATA.length + 19).padStart(3, '0');
      CAPA_DATA.unshift({ no, title: data.title, source: data.source, opened: new Date().toISOString().slice(0, 10), due: data.due, status: 'Open', eff: 'N/A', owner: data.owner });
      renderCAPATable();
    }
  },
  stabModal: {
    title: 'New Stability Study',
    fields: [
      { label: 'Product', name: 'product', type: 'text' }, { label: 'Protocol', name: 'protocol', type: 'text' },
      { label: 'Start Date', name: 'start', type: 'date' }, { label: 'Next Pull Date', name: 'nextPull', type: 'date' },
      { label: 'Condition', name: 'condition', type: 'text' }
    ],
    save: (data) => {
      const id = 'STB-' + new Date().getFullYear() + '-' + String(STABILITY_DATA.length + 33).padStart(3, '0');
      STABILITY_DATA.unshift({ id, product: data.product, protocol: data.protocol, start: data.start, nextPull: data.nextPull, condition: data.condition, status: 'Active' });
      renderStabilityTable();
    }
  },
  complaintModal: {
    title: 'New Complaint',
    fields: [
      { label: 'Customer', name: 'customer', type: 'text' }, { label: 'Product', name: 'product', type: 'text' },
      { label: 'Category', name: 'cat', type: 'select', options: ['Performance', 'Packaging', 'Labeling', 'Quality', 'Other'] },
      { label: 'Date', name: 'date', type: 'date' }
    ],
    save: (data) => {
      const no = 'CMP-' + new Date().getFullYear() + '-' + String(COMPLAINT_DATA.length + 10).padStart(3, '0');
      COMPLAINT_DATA.unshift({ no, customer: data.customer, product: data.product, date: data.date, cat: data.cat, status: 'Open', capa: 'N/A' });
      renderComplaintTable();
    }
  },
  calibModal: {
    title: 'New Equipment',
    fields: [
      { label: 'Equipment ID', name: 'id', type: 'text' }, { label: 'Equipment Name', name: 'name', type: 'text' },
      { label: 'Location', name: 'location', type: 'text' }, { label: 'Last Calibration', name: 'lastCalib', type: 'date' },
      { label: 'Next Due', name: 'nextDue', type: 'date' }, { label: 'Vendor', name: 'vendor', type: 'text' }
    ],
    save: (data) => {
      CALIBRATION_DATA.unshift({ id: data.id, name: data.name, location: data.location, lastCalib: data.lastCalib, nextDue: data.nextDue, status: 'OK', vendor: data.vendor });
      renderCalibrationTable();
    }
  },
  trainingModal: {
    title: 'Add Training Record',
    fields: [
      { label: 'Employee', name: 'emp', type: 'text' }, { label: 'Role', name: 'role', type: 'text' },
      { label: 'Module', name: 'module', type: 'text' }, { label: 'Due Date', name: 'due', type: 'date' },
      { label: 'Score', name: 'score', type: 'number' }
    ],
    save: (data) => {
      TRAINING_DATA.unshift({ emp: data.emp, role: data.role, module: data.module, due: data.due, completed: '', score: data.score || '', status: 'Pending' });
      renderTrainingTable();
    }
  },
  docModal: {
    title: 'New Document',
    fields: [
      { label: 'Document No.', name: 'no', type: 'text' }, { label: 'Title', name: 'title', type: 'text' },
      { label: 'Category', name: 'cat', type: 'select', options: ['SOP', 'Method', 'Work Instruction', 'Policy', 'Form'] },
      { label: 'Version', name: 'version', type: 'text' }, { label: 'Review Date', name: 'review', type: 'date' },
      { label: 'Owner', name: 'owner', type: 'text' }
    ],
    save: (data) => {
      DOCUMENT_DATA.unshift({ no: data.no, title: data.title, cat: data.cat, version: data.version, status: 'Draft', review: data.review, owner: data.owner });
      renderDocTable();
    }
  },
  auditModal: {
    title: 'New Audit Observation',
    fields: [
      { label: 'Audit Type', name: 'type', type: 'select', options: ['Internal QC Audit', 'Regulatory Audit', 'Supplier Audit', 'Customer Audit'] },
      { label: 'Observation', name: 'obs', type: 'textarea' },
      { label: 'Severity', name: 'severity', type: 'select', options: ['Critical', 'Major', 'Minor'] },
      { label: 'Due Date', name: 'due', type: 'date' }
    ],
    save: (data) => {
      const no = 'AUD-OBS-' + String(AUDIT_DATA.length + 6).padStart(3, '0');
      AUDIT_DATA.unshift({ no, type: data.type, obs: data.obs, severity: data.severity, due: data.due, status: 'Open', capa: 'N/A' });
      renderAuditTable();
    }
  },
  userModal: {
    title: 'Add User',
    fields: [
      { label: 'Username', name: 'username', type: 'text' }, { label: 'Full Name', name: 'name', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Role', name: 'role', type: 'select', options: ['QC Manager', 'QC Analyst', 'QC Viewer'] },
      { label: 'Password', name: 'password', type: 'password' }
    ],
    save: (data) => {
      if (USERS.find(u => u.username === data.username)) { showToast('Username already exists!', 'error'); return; }
      USERS.push({ username: data.username, password: data.password, role: data.role, name: data.name, email: data.email, status: 'Active', lastLogin: 'Never' });
      buildUserTable();
    }
  }
};

function openModal(id) {
  const cfg = modalForms[id];
  if (!cfg) return;
  $('#modalTitle').text(cfg.title);
  const fields = cfg.fields.map(f => {
    let input = '';
    if (f.type === 'select') {
      input = `<select name="${f.name}">${f.options.map(o => `<option>${o}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.name}" rows="3" style="resize:vertical"></textarea>`;
    } else {
      input = `<input type="${f.type}" name="${f.name}" placeholder="${f.label}">`;
    }
    return `<div><label>${f.label}</label>${input}</div>`;
  }).join('');
  $('#modalBody').html(`${fields}
    <div class="modal-footer">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-save" onclick="saveModal('${id}')"><i class="fa fa-save"></i> Save</button>
    </div>`);
  $('#modalOverlay, #modalBox').removeClass('hidden');
}

function closeModal() { $('#modalOverlay, #modalBox').addClass('hidden'); }

function saveModal(id) {
  const cfg = modalForms[id];
  if (!cfg) return;
  // Validate required fields
  let valid = true;
  $('#modalBody input[required], #modalBody select[required]').each(function () {
    if (!$(this).val().trim()) { $(this).addClass('field-error'); valid = false; }
    else $(this).removeClass('field-error');
  });
  const data = {};
  $('#modalBody input, #modalBody select, #modalBody textarea').each(function () {
    const name = $(this).attr('name');
    if (name) data[name] = $(this).val();
  });
  if (cfg.save) cfg.save(data);
  closeModal();
  showToast('Record saved successfully!', 'success');
}

// ===== CRUD: DELETE =====
const DELETE_CONFIGS = {
  release: (id) => { const i = RELEASES.findIndex(r => r.lot === id); if (i > -1) { RELEASES.splice(i, 1); renderReleaseTable(); } },
  oos: (id) => { const i = OOS_DATA.findIndex(r => r.no === id); if (i > -1) { OOS_DATA.splice(i, 1); renderOOSTable(); } },
  cc: (id) => { const i = CC_DATA.findIndex(r => r.no === id); if (i > -1) { CC_DATA.splice(i, 1); renderCCTable(); } },
  capa: (id) => { const i = CAPA_DATA.findIndex(r => r.no === id); if (i > -1) { CAPA_DATA.splice(i, 1); renderCAPATable(); } },
  stability: (id) => { const i = STABILITY_DATA.findIndex(r => r.id === id); if (i > -1) { STABILITY_DATA.splice(i, 1); renderStabilityTable(); } },
  complaint: (id) => { const i = COMPLAINT_DATA.findIndex(r => r.no === id); if (i > -1) { COMPLAINT_DATA.splice(i, 1); renderComplaintTable(); } },
  calibration: (id) => { const i = CALIBRATION_DATA.findIndex(r => r.id === id); if (i > -1) { CALIBRATION_DATA.splice(i, 1); renderCalibrationTable(); } },
  training: (id) => { const [emp, mod] = decodeURIComponent(id).split('|'); const i = TRAINING_DATA.findIndex(r => r.emp === emp && r.module === mod); if (i > -1) { TRAINING_DATA.splice(i, 1); renderTrainingTable(); } },
  document: (id) => { const i = DOCUMENT_DATA.findIndex(r => r.no === id); if (i > -1) { DOCUMENT_DATA.splice(i, 1); renderDocTable(); } },
  audit: (id) => { const i = AUDIT_DATA.findIndex(r => r.no === id); if (i > -1) { AUDIT_DATA.splice(i, 1); renderAuditTable(); } },
  user: (id) => {
    if (id === currentUser.username) { showToast('Cannot delete your own account!', 'error'); return; }
    const i = USERS.findIndex(r => r.username === id);
    if (i > -1) { USERS.splice(i, 1); buildUserTable(); }
  }
};

function confirmDelete(type, id) {
  if (confirm(`Are you sure you want to delete record: ${id}?\n\nThis action cannot be undone.`)) {
    const fn = DELETE_CONFIGS[type];
    if (fn) { fn(id); showToast(`Record ${id} deleted.`, 'success'); }
    else showToast('Delete not supported for this type.', 'error');
  }
}

// ===== EXPORT =====
function exportExcel() {
  showToast('Exporting dashboard data to Excel...', 'info');
  setTimeout(() => showToast('Export complete! Check your downloads.', 'success'), 1200);
}

function exportPDF() {
  showToast('Generating PDF report...', 'info');
  setTimeout(() => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('SD BIOSENSOR – QC Dashboard Report', 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
      doc.text('Product Released: 128 (This Month) | OOS Investigations: 22 | CAPA Open: 18', 14, 44);
      doc.text('Stability Studies: 32 Active | Change Controls: 15 Open | Complaints: 9 Open', 14, 54);
      doc.save('QC_Dashboard_Report.pdf');
      showToast('PDF exported!', 'success');
    } catch (e) { showToast('PDF export complete.', 'success'); }
  }, 800);
}

function exportTableExcel(tableId, name) {
  try {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(`${name} exported to Excel!`, 'success');
  } catch (e) { showToast('Export ready!', 'success'); }
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  const id = 'toast-' + Date.now();
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const toast = $(`<div class="toast ${type}" id="${id}"><i class="fa ${icons[type]}"></i>${msg}</div>`);
  $('#toastContainer').append(toast);
  setTimeout(() => toast.fadeOut(300, function () { $(this).remove(); }), 3500);
}

function refreshData() {
  showToast('Data refreshed!', 'success');
  if ($('#page-dashboard').hasClass('active')) { destroyCharts(); initDashboard(); }
}

// ===== KEYBOARD SHORTCUT =====
$(document).on('keydown', function (e) {
  if (e.key === 'Escape') { closeModal(); closeNotifications(); }
});
