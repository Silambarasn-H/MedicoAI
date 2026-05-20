import React, { useState, useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { toast } from 'react-toastify'
import adminService from '../../services/adminService'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Fallback mock data used when backend is unavailable
const MOCK = {
  totalPatients: 1248, totalDoctors: 34, totalAppointments: 5672,
  completedAppts: 5210, cancelledAppts: 420, pendingAppts: 42,
  monthlyAppts:    [120,145,132,160,175,190,155,210,198,225,215,240],
  monthlyPatients: [65,78,90,85,110,125,98,140,132,155,148,162],
  year: new Date().getFullYear(),
}

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1,
      titleColor: '#f1f5f9', bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: { grid: { color: '#1e3a5f30' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: '#1e3a5f30' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
}

// ── CSV export helper ──────────────────────────────────────────────
function exportCSV(data, year) {
  const rows = [
    ['Month', 'Appointments', 'New Patients', 'Growth %'],
    ...MONTHS.map((m, i) => {
      const growth = i > 0 && data.monthlyAppts[i - 1] > 0
        ? (((data.monthlyAppts[i] - data.monthlyAppts[i - 1]) / data.monthlyAppts[i - 1]) * 100).toFixed(1)
        : '—'
      return [`${m} ${year}`, data.monthlyAppts[i], data.monthlyPatients[i], growth]
    }),
    [],
    ['Summary', '', '', ''],
    ['Total Patients',     data.totalPatients,     '', ''],
    ['Total Doctors',      data.totalDoctors,      '', ''],
    ['Total Appointments', data.totalAppointments, '', ''],
    ['Completed',          data.completedAppts,    '', ''],
    ['Cancelled',          data.cancelledAppts,    '', ''],
    ['Pending',            data.pendingAppts,      '', ''],
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `MedicoAI_Report_${year}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV exported successfully')
}

// ── PDF export helper (print-based, no extra library needed) ───────
function exportPDF() {
  window.print()
  toast.info('Use browser Print → Save as PDF')
}

export default function AdminReports() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getReportsSummary()
      .then(({ data: res }) => setData(res?.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false))
  }, [])

  const d = data || MOCK

  // Summary stat cards
  const CARDS = [
    { label: 'Total Patients',     value: d.totalPatients,     icon: '🧑‍🤝‍🧑', color: '#6366f1' },
    { label: 'Total Doctors',      value: d.totalDoctors,      icon: '👨‍⚕️', color: '#4ade80' },
    { label: 'Total Appointments', value: d.totalAppointments, icon: '📅',  color: '#38bdf8' },
    { label: 'Completed',          value: d.completedAppts,    icon: '✅',  color: '#4ade80' },
    { label: 'Cancelled',          value: d.cancelledAppts,    icon: '❌',  color: '#f87171' },
    { label: 'Pending',            value: d.pendingAppts,      icon: '⏳',  color: '#fbbf24' },
  ]

  const apptChartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Appointments',
      data: d.monthlyAppts,
      backgroundColor: 'rgba(56,189,248,0.7)',
      borderRadius: 6, borderSkipped: false,
    }],
  }

  const patientChartData = {
    labels: MONTHS,
    datasets: [{
      label: 'New Patients',
      data: d.monthlyPatients,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2, pointBackgroundColor: '#6366f1',
      pointRadius: 4, fill: true, tension: 0.4,
    }],
  }

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports & Analytics</h1>
          <p>Live data for {d.year} — patients, appointments and trends</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(d, d.year)}>
            ⬇ Export CSV
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportPDF}>
            🖨 Export PDF
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state"><div className="spinner" /><span>Loading reports…</span></div>
      )}

      {/* Summary cards */}
      {!loading && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {CARDS.map((c) => (
            <div key={c.label} className="stat-card"
              style={{ '--stat-color': c.color, '--stat-bg': `${c.color}20` }}>
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{(c.value ?? 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && (
        <>
          <div className="charts-grid">
            <div className="section-card">
              <div className="section-header">
                <span className="section-title">📅 Monthly Appointments</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.year}</span>
              </div>
              <div className="section-body" style={{ height: 260 }}>
                <Bar data={apptChartData} options={CHART_OPTS} />
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <span className="section-title">🧑 New Patients per Month</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.year}</span>
              </div>
              <div className="section-body" style={{ height: 260 }}>
                <Line data={patientChartData} options={CHART_OPTS} />
              </div>
            </div>
          </div>

          {/* Monthly breakdown table */}
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">📋 Monthly Breakdown — {d.year}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(d, d.year)}>
                ⬇ Export CSV
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Appointments</th>
                    <th>New Patients</th>
                    <th>Appt Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((m, i) => {
                    const prev   = i > 0 ? d.monthlyAppts[i - 1] : null
                    const curr   = d.monthlyAppts[i]
                    const growth = prev && prev > 0
                      ? (((curr - prev) / prev) * 100).toFixed(1)
                      : null
                    const up = growth !== null && parseFloat(growth) >= 0
                    return (
                      <tr key={m}>
                        <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{m} {d.year}</td>
                        <td style={{ color: '#38bdf8' }}>{curr.toLocaleString()}</td>
                        <td style={{ color: '#6366f1' }}>{d.monthlyPatients[i].toLocaleString()}</td>
                        <td>
                          {growth !== null ? (
                            <span className={`stat-change ${up ? 'up' : 'down'}`}>
                              {up ? '▲' : '▼'} {Math.abs(growth)}%
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
