import { useMemo, useState } from 'react'
import {
  dashboardStats,
  dosageOptions,
  existingPatients,
  initialMedicines,
  initialPrintSettings,
  initialRegistration,
  initialSectionOrder,
  opdTrend,
  patientFlow,
  symptomBreakdown,
  visits,
} from './data/opdData'

function moveItem(items, index, direction) {
  const nextIndex = direction === 'up' ? index - 1 : index + 1

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items
  }

  const updated = [...items]
  const [selected] = updated.splice(index, 1)
  updated.splice(nextIndex, 0, selected)
  return updated
}

function MiniIcon({ type }) {
  const icons = {
    dashboard: '▦',
    register: '+',
    list: '≣',
    print: '⎙',
    settings: '⚙',
    back: '←',
    search: '⌕',
  }

  return <span aria-hidden="true">{icons[type]}</span>
}

function DashboardSection({ trendFilter, setTrendFilter }) {
  const totalSymptoms = symptomBreakdown.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="opd-stack">
      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Clinic snapshot</p>
            <h2>Dashboard</h2>
          </div>
          <div className="segmented-control">
            {['Month', '3 Months', '1 Year'].map((item) => (
              <button
                key={item}
                type="button"
                className={trendFilter === item ? 'is-active' : ''}
                onClick={() => setTrendFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="stats-grid">
          {dashboardStats.map((item) => (
            <article key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.meta}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="opd-panel chart-card">
          <div className="panel-heading">
            <div>
              <p className="panel-heading__eyebrow">Daily OP count</p>
              <h3>Trend overview</h3>
            </div>
            <span className="panel-badge">{trendFilter}</span>
          </div>

          <div className="trend-chart" aria-label="OP trend chart">
            {opdTrend.map((item) => (
              <div key={item.label} className="trend-chart__item">
                <div className="trend-chart__bar" style={{ height: `${item.value}%` }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="opd-panel chart-card">
          <div className="panel-heading">
            <div>
              <p className="panel-heading__eyebrow">Symptoms</p>
              <h3>Patient count by symptom</h3>
            </div>
          </div>

          <div className="symptom-layout">
            <div
              className="symptom-ring"
              style={{
                background: `conic-gradient(
                  ${symptomBreakdown[0].color} 0% 34%,
                  ${symptomBreakdown[1].color} 34% 60%,
                  ${symptomBreakdown[2].color} 60% 82%,
                  ${symptomBreakdown[3].color} 82% 100%
                )`,
              }}
            >
              <div>
                <strong>{totalSymptoms}</strong>
                <span>Patients</span>
              </div>
            </div>

            <div className="legend-list">
              {symptomBreakdown.map((item) => (
                <div key={item.label} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }} />
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.value} patients</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="opd-panel chart-card chart-card--wide">
          <div className="panel-heading">
            <div>
              <p className="panel-heading__eyebrow">Patient flow</p>
              <h3>Visit type distribution</h3>
            </div>
          </div>

          <div className="flow-chart">
            {patientFlow.map((item) => (
              <div key={item.label} className="flow-chart__row">
                <span>{item.label}</span>
                <div className="flow-chart__track">
                  <div className="flow-chart__fill" style={{ width: `${item.value * 2}%` }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function RegistrationSection({
  medicines,
  registration,
  setRegistration,
  setMedicines,
}) {
  const updateRegistrationField = (field, value) => {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  const updateMedicine = (id, field, value) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id ? { ...medicine, [field]: value } : medicine
      )
    )
  }

  const addMedicine = () => {
    setMedicines((current) => [
      ...current,
      { id: Date.now(), name: '', dosage: 'OD', days: '5', note: '' },
    ])
  }

  return (
    <div className="opd-stack">
      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Patient intake</p>
            <h2>New Registration</h2>
          </div>
          <div className="segmented-control">
            {['new', 'existing'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={registration.patientMode === mode ? 'is-active' : ''}
                onClick={() => updateRegistrationField('patientMode', mode)}
              >
                {mode === 'new' ? 'New Patient' : 'Existing Patient'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          {registration.patientMode === 'existing' && (
            <label className="field field--full">
              <span>Select patient</span>
              <select
                value={registration.existingPatient}
                onChange={(event) => updateRegistrationField('existingPatient', event.target.value)}
              >
                {existingPatients.map((patient) => (
                  <option key={patient} value={patient}>
                    {patient}
                  </option>
                ))}
              </select>
            </label>
          )}

          {[
            ['patientName', 'Patient name', 'Enter full name'],
            ['age', 'Age', 'Age'],
            ['village', 'Village', 'Village / area'],
            ['mobile', 'Mobile', '10-digit mobile number'],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="field">
              <span>{label}</span>
              <input
                value={registration[field]}
                onChange={(event) => updateRegistrationField(field, event.target.value)}
                placeholder={placeholder}
              />
            </label>
          ))}

          <label className="field">
            <span>Sex</span>
            <select
              value={registration.sex}
              onChange={(event) => updateRegistrationField('sex', event.target.value)}
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </label>
        </div>
      </section>

      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Vitals</p>
            <h3>Measure and record</h3>
          </div>
        </div>

        <div className="form-grid vitals-grid">
          {[
            ['temperature', 'Temperature (F)'],
            ['bp', 'BP'],
            ['pulse', 'Pulse'],
            ['weight', 'Weight (kg)'],
            ['height', 'Height (cm)'],
            ['spo2', 'SpO2'],
          ].map(([field, label]) => (
            <label key={field} className="field">
              <span>{label}</span>
              <input
                value={registration[field]}
                onChange={(event) => updateRegistrationField(field, event.target.value)}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Examination</p>
            <h3>Clinical summary</h3>
          </div>
        </div>

        <div className="form-grid">
          {[
            ['chiefComplaint', 'Chief complaint', 'Describe symptoms and duration', 3],
            ['clinicalExam', 'Clinical examination', 'Document examination findings', 3],
            ['diagnosis', 'Diagnosis', 'Enter diagnosis / provisional diagnosis', 2],
          ].map(([field, label, placeholder, rows]) => (
            <label key={field} className="field field--full">
              <span>{label}</span>
              <textarea
                rows={rows}
                value={registration[field]}
                onChange={(event) => updateRegistrationField(field, event.target.value)}
                placeholder={placeholder}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Treatment</p>
            <h3>Prescription entry</h3>
          </div>
          <button type="button" className="ghost-button" onClick={addMedicine}>
            Add Medicine
          </button>
        </div>

        <div className="medicine-list">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="medicine-row">
              <label className="field field--grow">
                <span>Medicine</span>
                <input
                  value={medicine.name}
                  onChange={(event) => updateMedicine(medicine.id, 'name', event.target.value)}
                  placeholder="Medicine name"
                />
              </label>
              <label className="field">
                <span>Dosage</span>
                <select
                  value={medicine.dosage}
                  onChange={(event) => updateMedicine(medicine.id, 'dosage', event.target.value)}
                >
                  {dosageOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Days</span>
                <input
                  value={medicine.days}
                  onChange={(event) => updateMedicine(medicine.id, 'days', event.target.value)}
                />
              </label>
              <label className="field field--grow">
                <span>Notes</span>
                <input
                  value={medicine.note}
                  onChange={(event) => updateMedicine(medicine.id, 'note', event.target.value)}
                  placeholder="Before food / after food"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Advice</p>
            <h3>Discharge and follow-up</h3>
          </div>
        </div>

        <div className="form-grid">
          <label className="field field--full">
            <span>Advice</span>
            <textarea
              rows="3"
              value={registration.advice}
              onChange={(event) => updateRegistrationField('advice', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Follow-up date</span>
            <input
              type="date"
              value={registration.followUpDate}
              onChange={(event) => updateRegistrationField('followUpDate', event.target.value)}
            />
          </label>
        </div>
      </section>
    </div>
  )
}

function OpListSection({ searchTerm }) {
  const [listMode, setListMode] = useState('op')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedVisit, setSelectedVisit] = useState(null)

  const matchesSearch = (visit) => {
    if (!searchTerm.trim()) {
      return true
    }

    const value = searchTerm.toLowerCase()
    return [visit.patientName, visit.patientId, visit.opNo, visit.mobile, visit.complaint]
      .some((field) => field.toLowerCase().includes(value))
  }

  const parseVisitDate = (value) => new Date(value).getTime()

  const baseVisits = useMemo(() => {
    const filtered = visits.filter(matchesSearch)
    return [...filtered].sort((left, right) =>
      sortDirection === 'asc'
        ? parseVisitDate(left.visitDate) - parseVisitDate(right.visitDate)
        : parseVisitDate(right.visitDate) - parseVisitDate(left.visitDate)
    )
  }, [searchTerm, sortDirection])

  const patientGroups = useMemo(() => {
    const groups = baseVisits.reduce((accumulator, visit) => {
      const existing = accumulator[visit.patientId]

      if (existing) {
        existing.visits.push(visit)
      } else {
        accumulator[visit.patientId] = {
          patientId: visit.patientId,
          patientName: visit.patientName,
          ageSex: visit.ageSex,
          village: visit.village,
          mobile: visit.mobile,
          visits: [visit],
        }
      }

      return accumulator
    }, {})

    return Object.values(groups).sort((left, right) =>
      left.patientName.localeCompare(right.patientName)
    )
  }, [baseVisits])

  const dateGroups = useMemo(() => {
    const groups = baseVisits.reduce((accumulator, visit) => {
      if (!accumulator[visit.visitDate]) {
        accumulator[visit.visitDate] = []
      }

      accumulator[visit.visitDate].push(visit)
      return accumulator
    }, {})

    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        count: items.length,
        visits: items,
      }))
      .sort((left, right) =>
        sortDirection === 'asc'
          ? parseVisitDate(left.date) - parseVisitDate(right.date)
          : parseVisitDate(right.date) - parseVisitDate(left.date)
      )
  }, [baseVisits, sortDirection])

  const activeDate = selectedDate || dateGroups[0]?.date || null
  const dateVisits = activeDate
    ? baseVisits.filter((visit) => visit.visitDate === activeDate)
    : []

  const datePatients = dateVisits.reduce((accumulator, visit) => {
    if (!accumulator.some((item) => item.patientId === visit.patientId)) {
      accumulator.push({
        patientId: visit.patientId,
        patientName: visit.patientName,
        ageSex: visit.ageSex,
        village: visit.village,
        mobile: visit.mobile,
      })
    }
    return accumulator
  }, [])

  const activePatient =
    selectedPatient ||
    (listMode === 'patient' ? patientGroups[0]?.patientId : datePatients[0]?.patientId) ||
    null

  const patientVisits =
    listMode === 'patient'
      ? baseVisits.filter((visit) => visit.patientId === activePatient)
      : dateVisits.filter((visit) => visit.patientId === activePatient)

  const activeVisit =
    selectedVisit ||
    (listMode === 'op' ? baseVisits[0]?.opNo : patientVisits[0]?.opNo) ||
    null

  const visitDetail = baseVisits.find((visit) => visit.opNo === activeVisit) || null

  const modeCounts = {
    op: baseVisits.length,
    patient: patientGroups.length,
    date: dateGroups.length,
  }

  const selectMode = (mode) => {
    setListMode(mode)
    setSelectedVisit(null)
    setSelectedPatient(null)
    setSelectedDate(null)
  }

  const renderVisitTile = (visit) => (
    <button
      key={visit.opNo}
      type="button"
      className={activeVisit === visit.opNo ? 'browser-item is-active' : 'browser-item'}
      onClick={() => setSelectedVisit(visit.opNo)}
    >
      <div className="browser-item__top">
        <strong>{visit.opNo}</strong>
        <span className="record-pill">{visit.status}</span>
      </div>
      <h3>{visit.patientName}</h3>
      <p>{visit.visitDate} • {visit.time}</p>
      <small>{visit.complaint}</small>
    </button>
  )

  return (
    <div className="opd-stack">
      <section className="opd-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-heading__eyebrow">Records</p>
            <h2>OP List</h2>
          </div>
        </div>

        <div className="records-toolbar">
          <div className="segmented-control">
            <button
              type="button"
              className={listMode === 'op' ? 'is-active' : ''}
              onClick={() => selectMode('op')}
            >
              OP List ({modeCounts.op})
            </button>
            <button
              type="button"
              className={listMode === 'patient' ? 'is-active' : ''}
              onClick={() => selectMode('patient')}
            >
              Patient List ({modeCounts.patient})
            </button>
            <button
              type="button"
              className={listMode === 'date' ? 'is-active' : ''}
              onClick={() => selectMode('date')}
            >
              Date Wise ({modeCounts.date})
            </button>
          </div>
          <div className="records-toolbar__right">
            <span className="panel-badge">
              {listMode === 'patient' ? `${modeCounts.patient} patients` : `${modeCounts.op} records`}
            </span>
            <button
              type="button"
              className="sort-button"
              onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            >
              Sort {sortDirection === 'asc' ? 'Oldest First ↑' : 'Newest First ↓'}
            </button>
          </div>
        </div>

        {listMode === 'op' && (
          <div className="op-browser op-browser--two">
            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>OP Records</h3>
                <span>{baseVisits.length} items</span>
              </div>
              <div className="browser-list">
                {baseVisits.map(renderVisitTile)}
              </div>
            </div>

            <div className="browser-pane">
              <div className="browser-pane__header">
                <div>
                  <h3>OP Record Preview</h3>
                  <span>Open record with quick actions</span>
                </div>
                <div className="detail-actions">
                  <button type="button">Edit</button>
                  <button type="button">Delete</button>
                  <button type="button">Print</button>
                </div>
              </div>

              {visitDetail && (
                <article className="record-card record-card--detail">
                  <div className="record-preview__banner">
                    <div>
                      <p className="panel-heading__eyebrow">Selected OP Record</p>
                      <h3>{visitDetail.opNo}</h3>
                    </div>
                    <span className="record-pill">{visitDetail.status}</span>
                  </div>

                  <div className="record-card__top">
                    <div>
                      <h3>{visitDetail.patientName}</h3>
                      <p>
                        {visitDetail.patientId} • {visitDetail.ageSex} • {visitDetail.village}
                      </p>
                    </div>
                    <div className="record-meta">
                      <strong>{visitDetail.opNo}</strong>
                      <span>
                        {visitDetail.visitDate} • {visitDetail.time}
                      </span>
                    </div>
                  </div>

                  <div className="record-grid">
                    <div>
                      <span>Complaint</span>
                      <strong>{visitDetail.complaint}</strong>
                    </div>
                    <div>
                      <span>Diagnosis</span>
                      <strong>{visitDetail.diagnosis}</strong>
                    </div>
                    <div>
                      <span>Doctor</span>
                      <strong>{visitDetail.doctor}</strong>
                    </div>
                    <div>
                      <span>Follow-up</span>
                      <strong>{visitDetail.followUp}</strong>
                    </div>
                    <div>
                      <span>Mobile</span>
                      <strong>{visitDetail.mobile}</strong>
                    </div>
                  </div>

                  <div className="record-detail-note">
                    <div>
                      <span>Clinical note</span>
                      <strong>{visitDetail.complaint}</strong>
                    </div>
                    <div>
                      <span>Prescription status</span>
                      <strong>Ready for review and printing</strong>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
        )}

        {listMode === 'patient' && (
          <div className="op-browser op-browser--two">
            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>Patient List</h3>
                <span>{patientGroups.length} patients</span>
              </div>
              <div className="browser-list">
                {patientGroups.map((patient) => (
                  <button
                    key={patient.patientId}
                    type="button"
                    className={activePatient === patient.patientId ? 'browser-item is-active' : 'browser-item'}
                    onClick={() => {
                      setSelectedPatient(patient.patientId)
                      setSelectedVisit(null)
                    }}
                  >
                    <div className="browser-item__top">
                      <strong>{patient.patientName}</strong>
                      <span className="record-pill">{patient.visits.length}</span>
                    </div>
                    <p>
                      {patient.patientId} • {patient.ageSex}
                    </p>
                    <small>{patient.village}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>OP List</h3>
                <span>{patientVisits.length} visits</span>
              </div>
              <div className="browser-list">
                {patientVisits.map(renderVisitTile)}
              </div>
            </div>
          </div>
        )}

        {listMode === 'date' && (
          <div className="op-browser op-browser--three">
            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>Date List</h3>
                <span>{dateGroups.length} dates</span>
              </div>
              <div className="browser-list">
                {dateGroups.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    className={activeDate === item.date ? 'browser-item is-active' : 'browser-item'}
                    onClick={() => {
                      setSelectedDate(item.date)
                      setSelectedPatient(null)
                      setSelectedVisit(null)
                    }}
                  >
                    <div className="browser-item__top">
                      <strong>{item.date}</strong>
                      <span className="record-pill">{item.count}</span>
                    </div>
                    <small>OP count for selected date</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>Patient List</h3>
                <span>{datePatients.length} patients</span>
              </div>
              <div className="browser-list">
                {datePatients.map((patient) => (
                  <button
                    key={patient.patientId}
                    type="button"
                    className={activePatient === patient.patientId ? 'browser-item is-active' : 'browser-item'}
                    onClick={() => {
                      setSelectedPatient(patient.patientId)
                      setSelectedVisit(null)
                    }}
                  >
                    <div className="browser-item__top">
                      <strong>{patient.patientName}</strong>
                    </div>
                    <p>
                      {patient.patientId} • {patient.ageSex}
                    </p>
                    <small>{patient.village}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="browser-pane">
              <div className="browser-pane__header">
                <h3>OP List</h3>
                <span>{patientVisits.length} visits</span>
              </div>
              <div className="browser-list">
                {patientVisits.map(renderVisitTile)}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function PrintSettingsSection({
  medicines,
  printSettings,
  registrationAdvice,
  sectionOrder,
  setPrintSettings,
  setSectionOrder,
}) {
  return (
    <div className="opd-stack">
      <div className="print-layout">
        <section className="opd-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-heading__eyebrow">Prescription settings</p>
              <h2>Print Settings</h2>
            </div>
          </div>

          <div className="form-grid">
            {[
              ['clinicName', 'Clinic / hospital name'],
              ['clinicTagline', 'Tagline'],
              ['address', 'Address'],
              ['doctorName', 'Doctor name'],
              ['qualification', 'Qualification'],
              ['registrationNo', 'Registration number'],
            ].map(([field, label]) => (
              <label
                key={field}
                className={`field ${field === 'address' || field === 'qualification' ? 'field--full' : ''}`}
              >
                <span>{label}</span>
                <input
                  value={printSettings[field]}
                  onChange={(event) =>
                    setPrintSettings((current) => ({ ...current, [field]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="settings-split">
            <div className="settings-group">
              <h3>Patient info toggles</h3>
              {[
                ['showAgeSex', 'Show age and sex'],
                ['showVillage', 'Show village'],
                ['showVitals', 'Show vitals'],
                ['showAdvice', 'Show advice section'],
              ].map(([field, label]) => (
                <label key={field} className="toggle-row">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={printSettings[field]}
                    onChange={(event) =>
                      setPrintSettings((current) => ({ ...current, [field]: event.target.checked }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="settings-group">
              <h3>Format settings</h3>
              {[
                ['medicineFormat', ['Detailed', 'Compact']],
                ['textStyle', ['Modern', 'Classic']],
                ['fontSize', ['Small', 'Medium', 'Large']],
                ['pageLayout', ['A5 Portrait', 'A4 Portrait']],
                ['signatureStyle', ['Digital Signature', 'Manual Signature']],
              ].map(([field, options]) => (
                <label key={field} className="field">
                  <span>{field.replace(/([A-Z])/g, ' $1')}</span>
                  <select
                    value={printSettings[field]}
                    onChange={(event) =>
                      setPrintSettings((current) => ({ ...current, [field]: event.target.value }))
                    }
                  >
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <div className="panel-heading">
              <div>
                <p className="panel-heading__eyebrow">Section order</p>
                <h3>Reorder print layout</h3>
              </div>
            </div>
            <div className="section-order">
              {sectionOrder.map((item, index) => (
                <div key={item} className="section-order__item">
                  <strong>{item}</strong>
                  <div className="section-order__actions">
                    <button
                      type="button"
                      onClick={() => setSectionOrder((current) => moveItem(current, index, 'up'))}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionOrder((current) => moveItem(current, index, 'down'))}
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="opd-panel print-preview">
          <div className="panel-heading">
            <div>
              <p className="panel-heading__eyebrow">Live preview</p>
              <h3>Prescription layout</h3>
            </div>
          </div>

          <div className="preview-sheet">
            <header className="preview-sheet__header">
              <h4>{printSettings.clinicName}</h4>
              <p>{printSettings.clinicTagline}</p>
              <small>{printSettings.address}</small>
            </header>

            <section className="preview-sheet__section">
              <strong>{printSettings.doctorName}</strong>
              <span>{printSettings.qualification}</span>
              <span>Reg No: {printSettings.registrationNo}</span>
            </section>

            <section className="preview-sheet__section">
              <strong>Patient: Sowmya Reddy</strong>
              {printSettings.showAgeSex && <span>29 / Female</span>}
              {printSettings.showVillage && <span>Nellore</span>}
              {printSettings.showVitals && <span>Temp 98.4 | BP 120/80 | SpO2 99</span>}
            </section>

            <section className="preview-sheet__section">
              <strong>Rx</strong>
              <ul>
                {medicines.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.name || 'Medicine name'} - {item.dosage} - {item.days} days
                  </li>
                ))}
              </ul>
            </section>

            {printSettings.showAdvice && (
              <section className="preview-sheet__section">
                <strong>Advice</strong>
                <p>{registrationAdvice}</p>
              </section>
            )}

            <footer className="preview-sheet__footer">
              <span>{printSettings.signatureStyle}</span>
              <strong>{printSettings.doctorName}</strong>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  )
}

function OpdModule({ onBack }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [trendFilter, setTrendFilter] = useState('Month')
  const [registration, setRegistration] = useState(initialRegistration)
  const [medicines, setMedicines] = useState(initialMedicines)
  const [printSettings, setPrintSettings] = useState(initialPrintSettings)
  const [sectionOrder, setSectionOrder] = useState(initialSectionOrder)

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'register', label: 'New Registration', icon: 'register' },
    { id: 'op-list', label: 'OP List', icon: 'list' },
    { id: 'print-settings', label: 'Print Settings', icon: 'print' },
  ]

  const renderCurrentSection = () => {
    if (activeSection === 'register') {
      return (
        <RegistrationSection
          medicines={medicines}
          registration={registration}
          setMedicines={setMedicines}
          setRegistration={setRegistration}
        />
      )
    }

    if (activeSection === 'op-list') {
      return <OpListSection searchTerm={searchTerm} />
    }

    if (activeSection === 'print-settings') {
      return (
        <PrintSettingsSection
          medicines={medicines}
          printSettings={printSettings}
          registrationAdvice={registration.advice}
          sectionOrder={sectionOrder}
          setPrintSettings={setPrintSettings}
          setSectionOrder={setSectionOrder}
        />
      )
    }

    return <DashboardSection trendFilter={trendFilter} setTrendFilter={setTrendFilter} />
  }

  return (
    <div className="opd-shell">
      <aside className="opd-sidebar">
        <button type="button" className="sidebar-brand" onClick={onBack}>
          <span className="sidebar-brand__icon">
            <MiniIcon type="back" />
          </span>
          <div>
            <strong>OP Requisition</strong>
            <small>Medical outpatient</small>
          </div>
        </button>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? 'sidebar-link is-active' : 'sidebar-link'}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="sidebar-link__icon">
                <MiniIcon type={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-summary">
          <p>Today at a glance</p>
          <strong>128 patients</strong>
          <span>7 doctors, 4 counters, 1 live OP queue</span>
        </div>
      </aside>

      <main className="opd-main">
        <header className="opd-topbar">
          <label className="search-box">
            <span>
              <MiniIcon type="search" />
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patient, OP number, diagnosis..."
            />
          </label>

          <div className="topbar-actions">
            <button type="button" className="icon-button">
              <MiniIcon type="settings" />
            </button>

            <div className="profile-menu">
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setShowProfileMenu((current) => !current)}
              >
                <span className="profile-avatar">DS</span>
                <div>
                  <strong>Dr. Shravan</strong>
                  <small>Chief consultant</small>
                </div>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button type="button">Edit Profile</button>
                  <button type="button">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {renderCurrentSection()}
      </main>
    </div>
  )
}

export default OpdModule
