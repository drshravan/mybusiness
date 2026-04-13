import { useState } from 'react'
import './core/styles/App.css'
import OpdModule from './modules/OPD/OpdModule'
import InterestManagerModule from './modules/InterestManager/InterestManagerModule'
import opRequisitionImage from './core/assets/op_requisition.png'
import interestManagerImage from './core/assets/interest_manager.png'
import chitsImage from './core/assets/chits.png'
import recurringDepositImage from './core/assets/recurring_deposit.png'

const modules = [
  {
    id: 'op-requisition',
    title: 'Op Requisition',
    description: 'Streamline approvals, track requests, and keep operations moving without paperwork bottlenecks.',
    image: opRequisitionImage,
    accent: 'cyan',
  },
  {
    id: 'interest-manager',
    title: 'Interest Manager',
    description: 'Monitor returns, configure plans, and give every customer a transparent growth snapshot.',
    image: interestManagerImage,
    accent: 'emerald',
  },
  {
    id: 'chits',
    title: 'Chits',
    description: 'Organize groups, payment cycles, and member activity in one coordinated workflow.',
    image: chitsImage,
    accent: 'violet',
  },
  {
    id: 'recurring-deposit',
    title: 'Recurring Deposit',
    description: 'Highlight disciplined saving with deposit insights, reminders, and maturity planning.',
    image: recurringDepositImage,
    accent: 'amber',
  },
]

function App() {
  const [activeModule, setActiveModule] = useState(null)

  if (activeModule === 'op-requisition') {
    return <OpdModule onBack={() => setActiveModule(null)} />
  }

  if (activeModule === 'interest-manager') {
    return <InterestManagerModule onBack={() => setActiveModule(null)} />
  }

  return (
    <main className="home-page">
      <section className="hero">
        <p className="hero__eyebrow">Smart finance dashboard</p>
        <h1 className="hero__title">MyBusiness</h1>
        <p className="hero__description">
          Built for modern business operations with sharper visuals, faster navigation, and a
          premium feel across every core module.
        </p>
      </section>

      <section className="module-grid" aria-label="Business modules">
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            className={`module-card module-card--${module.accent}`}
            onClick={() => {
              if (module.id === 'op-requisition' || module.id === 'interest-manager') {
                setActiveModule(module.id)
              }
            }}
          >
            <img
              className="module-card__image"
              src={module.image}
              alt={module.title}
            />
            <div className="module-card__overlay" />
            <div className="module-card__content">
              <span className="module-card__label">Module</span>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </div>
          </button>
        ))}
      </section>
    </main>
  )
}

export default App
