import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import adminService from '../../services/adminService'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ── Fallback mock data (used when API is not yet ready) ── */
const MOCK_STATS = {
  totalPatients: 1248, totalDoctors: 34,
  totalAppointments: 5672, totalRevenue: 284500,
  todayAppointments: 18, pendingAppointments: 42,
  completedAppointments: 5210, cancelledAppointments: 420,
  newPatientsThisMonth: 87, revenueThisMonth: 38200,
}

const MOCK_MONTHLY_PATIENTS  = [65,78,90,85,110,125,98,140,132,155,148,162]
const MOCK_MONTHLY_REVENUE   = [28000,32000,29000,35000,38000,42000,36000,45000,41000,48000,44000,52000]
const MOCK_RECENT_ACTIVITIES = [
  { id:1, icon:'📅', color:'rgba(99,102,241,0.15)',  text:'New appointment booked by Rahul Verma',    time:'2 min ago' },
  { id:2, icon:'👨‍⚕️', color:'rgba(74,222,128,0.15)', text:'Dr. Priya Sharma completed consultation',  time:'15 min ago' },
  { id:3, icon:'💳', color:'rgba(251,191,36,0.15)',  text:'Payment of ₹1,500 received',               time:'32 min ago' },
  { id:4, icon:'🧑', color:'rgba(56,189,248,0.15)',  text:'New patient Anita Singh registered',        time:'1 hr ago' },
  { id:5, icon:'💊', color:'rgba(167,139,250,0.15)', text:'Prescription added by Dr. Arjun Mehta',    time:'2 hr ago' },
  { id:6, icon:'📋', color:'rgba(248,113,113,0.15)', text:'Lab report uploaded for patient #1042',    time:'3 hr ago' },
]
const MOCK_RECENT_APPTS = [
  { id:1, patient:'Rahul Verma',   doctor:'Dr. Priya Sharma',  date:'2026-05-18', time:'10:00', status:'CONFIRMED',  type:'IN_PERSON' },
  { id:2, patient:'Anita Singh',   doctor:'Dr. Arjun Mehta',   date:'2026-05-18', time:'11:30', status:'PENDING',    type:'ONLINE'    },
  { id:3, patient:'Karan Patel',   doctor:'Dr. Sunita Rao',    date:'2026-05-18', time:'14:00', status:'COMPLETED',  type:'IN_PERSON' },
  { id:4, patient:'Meena Joshi',   doctor:'Dr. Priya Sharma',  date:'2026-05-18', time:'15:30', status:'CANCELLED',  type:'IN_PERSON' },
  { id:5, patient:'Suresh Kumar',  doctor:'Dr. Arjun Mehta',   date:'2026-05-19', time:'09:00', status:'CONFIRMED',  type:'ONLINE'    },
]

const STATUS_BADGE = {
  CONFIRMED:  'badge-info',
  PENDING:    'badge-warning',
  COMPLETED:  'badge-success',
  CANCELLED:  'badge-danger',
  RESCHEDULED:'badge-purple',
}

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title:  { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: { grid: { color: '#1e3a5f30' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: '#1e3a5f30' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
})

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [appts,    setAppts]    = useState(MOCK_RECENT_APPTS)

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getAllAppointments({ page: 0, size: 5, sort: 'createdAt,desc' }),
    ])
      .then(([statsRes, apptRes]) => {
        setStats(statsRes.data?.data || MOCK_STATS)
        setAppts(apptRes.data?.data?.content || MOCK_RECENT_APPTS)
      })
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false))
  }, [])

  const s = stats || MOCK_STATS

  /* Chart data */
  const barData = {
    labels: MONTHS,
    datasets: [{
      label: 'Patients',
      data: MOCK_MONTHLY_PATIENTS,
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const lineData = {
    labels: MONTHS,
    datasets: [{
      label: 'Revenue (₹)',
      data: MOCK_MONTHLY_REVENUE,
      borderColor: '#4ade80',
      backgroundColor: 'rgba(74,222,128,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#4ade80',
      pointRadius: 4,
      fill: true,
      tension: 0.4,
    }],
  }

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [s.completedAppointments || 5210, s.pendingAppointments || 42, s.cancelledAppointments || 420],
      backgroundColor: ['rgba(74,222,128,0.8)', 'rgba(251,191,36,0.8)', 'rgba(248,113,113,0.8)'],
      borderColor: '#1e293b',
      borderWidth: 3,
    }],
  }

  const STAT_CARDS = [
    { label:'Total Patients',      value: s.totalPatients?.toLocaleString(),      icon:'🧑‍🤝‍🧑', color:'#6366f1', bg:'rgba(99,102,241,0.15)',  change:'+12%', up:true  },
    { label:'Total Doctors',       value: s.totalDoctors?.toLocaleString(),        icon:'👨‍⚕️', color:'#4ade80', bg:'rgba(74,222,128,0.15)',  change:'+3%',  up:true  },
    { label:'Appointments',        value: s.totalAppointments?.toLocaleString(),   icon:'📅',  color:'#38bdf8', bg:'rgba(56,189,248,0.15)',  change:'+8%',  up:true  },
    { label:'Total Revenue',       value:`₹${((s.totalRevenue||0)/1000).toFixed(0)}K`, icon:'💰', color:'#fbbf24', bg:'rgba(251,191,36,0.15)', change:'+15%', up:true  },
    { label:"Today's Appts",       value: s.todayAppointments?.toLocaleString(),   icon:'🗓️', color:'#a78bfa', bg:'rgba(167,139,250,0.15)', change:'Today', up:true  },
    { label:'New Patients (Mo.)',   value: s.newPatientsThisMonth?.toLocaleString(),icon:'📈', color:'#fb923c', bg:'rgba(251,146,60,0.15)',  change:'+5%',  up:true  },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <span style={{ fontSize:'0.8rem', color:'#64748b' }}>
            {new Date().toLocaleDateString('en-IN',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /><span>Loading dashboard…</span></div>
      ) : (
        <div className="stats-grid">
          {STAT_CARDS.map((c) => (
            <div
              key={c.label}
              className="stat-card"
              style={{ '--stat-color': c.color, '--stat-bg': c.bg }}
            >
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value ?? '—'}</div>
                <div className={`stat-change ${c.up ? 'up' : 'down'}`}>
                  {c.up ? '▲' : '▼'} {c.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">📊 Monthly Patients</span>
            <span style={{ fontSize:'0.75rem', color:'#64748b' }}>2026</span>
          </div>
          <div className="section-body" style={{ height: 240 }}>
            <Bar data={barData} options={chartOpts('Monthly Patients')} />
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">💰 Monthly Revenue</span>
            <span style={{ fontSize:'0.75rem', color:'#64748b' }}>2026</span>
          </div>
          <div className="section-body" style={{ height: 240 }}>
            <Line data={lineData} options={chartOpts('Monthly Revenue')} />
          </div>
        </div>
      </div>

      {/* Appointments table + Activity + Doughnut */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.25rem' }}>

        {/* Recent appointments */}
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">📅 Recent Appointments</span>
            <a href="/admin/appointments" style={{ fontSize:'0.8rem', color:'#6366f1' }}>View all →</a>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th><th>Doctor</th><th>Date</th>
                  <th>Time</th><th>Type</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:600, color:'#e2e8f0' }}>{a.patient || a.patientName}</td>
                    <td style={{ color:'#94a3b8' }}>{a.doctor || a.doctorName}</td>
                    <td>{a.date || a.appointmentDate}</td>
                    <td>{a.time || a.appointmentTime}</td>
                    <td>
                      <span className={`badge ${a.type === 'ONLINE' ? 'badge-purple' : 'badge-gray'}`}>
                        {a.type === 'ONLINE' ? '🌐 Online' : '🏥 In-Person'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Doughnut */}
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">📋 Appointment Status</span>
            </div>
            <div className="section-body" style={{ height: 200 }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 },
                    },
                    tooltip: {
                      backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1,
                      titleColor: '#f1f5f9', bodyColor: '#94a3b8',
                    },
                  },
                  cutout: '65%',
                }}
              />
            </div>
          </div>

          {/* Activity feed */}
          <div className="section-card" style={{ flex: 1 }}>
            <div className="section-header">
              <span className="section-title">⚡ Recent Activity</span>
            </div>
            <div className="section-body" style={{ padding:'0.5rem 1.4rem' }}>
              <div className="activity-list">
                {MOCK_RECENT_ACTIVITIES.map((a) => (
                  <div key={a.id} className="activity-item">
                    <div className="activity-dot" style={{ background: a.color }}>
                      {a.icon}
                    </div>
                    <div className="activity-text">
                      <div className="activity-title">{a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
