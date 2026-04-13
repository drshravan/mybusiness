import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseISO, subDays, addDays, formatISO } from 'date-fns';

const today = new Date();
const fmt = (d) => formatISO(d);

const initialContacts = [
  { id: 'c1', name: 'Ramesh Kumar', phone: '+91 9876543210', address: 'Plot 42, Jubilee Hills, Hyderabad', createdAt: fmt(subDays(today, 100)), updatedAt: fmt(today), deletedAt: null },
  { id: 'c2', name: 'Srinivas Reddy', phone: '+91 8765432109', address: 'Ameerpet, Hyderabad', createdAt: fmt(subDays(today, 80)), updatedAt: fmt(today), deletedAt: null },
  { id: 'c3', name: 'Priya Sharma', phone: '+91 7654321098', address: 'Madhapur, IT Corridor', createdAt: fmt(subDays(today, 50)), updatedAt: fmt(today), deletedAt: null },
  { id: 'c4', name: 'Anil Desai', phone: '+91 6543210987', address: 'Kondapur, Hitech City', createdAt: fmt(subDays(today, 30)), updatedAt: fmt(today), deletedAt: null },
  { id: 'c5', name: 'Gita Patel', phone: '+91 5432109876', address: 'Secunderabad', createdAt: fmt(subDays(today, 10)), updatedAt: fmt(today), deletedAt: null },
];

const initialLoans = [
  { id: 'l1', contactId: 'c1', principal: 500000, interestRate: 2.0, interestMode: 'MONTHLY', disbursementDate: fmt(subDays(today, 90)), collectionDate: fmt(addDays(today, 30)), reminderEnabled: true, status: 'Active', nomineeName: 'Suresh Kumar', notes: 'Business expansion loan', createdAt: fmt(subDays(today, 90)), deletedAt: null },
  { id: 'l2', contactId: 'c2', principal: 100000, interestRate: 3.0, interestMode: 'MONTHLY', disbursementDate: fmt(subDays(today, 70)), collectionDate: fmt(subDays(today, 10)), reminderEnabled: false, status: 'Overdue', notes: 'Emergency medical funds', createdAt: fmt(subDays(today, 70)), deletedAt: null },
  { id: 'l3', contactId: 'c3', principal: 250000, interestRate: 24.0, interestMode: 'YEARLY', disbursementDate: fmt(subDays(today, 45)), collectionDate: fmt(addDays(today, 300)), reminderEnabled: true, status: 'Active', nomineeName: '', notes: 'Home renovation', createdAt: fmt(subDays(today, 45)), deletedAt: null },
  { id: 'l4', contactId: 'c1', principal: 50000, interestRate: 2.5, interestMode: 'MONTHLY', disbursementDate: fmt(subDays(today, 120)), collectionDate: fmt(subDays(today, 30)), reminderEnabled: false, status: 'Closed', notes: 'Short term requirement', createdAt: fmt(subDays(today, 120)), deletedAt: null },
];

const initialPayments = [
  { id: 'p1', loanId: 'l1', amount: 30000, discount: 0, date: fmt(subDays(today, 60)), interestPortion: 10000, principalPortion: 20000, notes: 'First partial payment', createdAt: fmt(subDays(today, 60)), deletedAt: null },
  { id: 'p2', loanId: 'l1', amount: 15000, discount: 0, date: fmt(subDays(today, 30)), interestPortion: 8000, principalPortion: 7000, notes: 'Second partial payment', createdAt: fmt(subDays(today, 30)), deletedAt: null },
  { id: 'p3', loanId: 'l4', amount: 53750, discount: 0, date: fmt(subDays(today, 30)), interestPortion: 3750, principalPortion: 50000, notes: 'Full settlement', createdAt: fmt(subDays(today, 30)), deletedAt: null },
];

const initialSettings = {
  theme: 'dark',
  language: 'en',
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  appLockEnabled: false,
};

export const useInterestStore = create(
  persist(
    (set, get) => ({
      contacts: initialContacts,
      loans: initialLoans,
      payments: initialPayments,
      settings: initialSettings,
      reminders: [], // Future expandability
      
      // Selectors & Computed 
      getActiveContacts: () => get().contacts.filter(c => !c.deletedAt),
      getActiveLoans: () => get().loans.filter(l => !l.deletedAt),
      getActivePayments: () => get().payments.filter(p => !p.deletedAt),
      
      getTransactions: () => {
        const { loans, payments, contacts } = get();
        const contactMap = contacts.reduce((acc, c) => ({...acc, [c.id]: c}), {});
        const transactions = [];
        
        loans.filter(l => !l.deletedAt).forEach(l => {
          transactions.push({
            id: `trx_l_${l.id}`,
            date: l.disbursementDate,
            type: 'LOAN_GIVEN',
            amount: l.principal,
            contactId: l.contactId,
            contactName: contactMap[l.contactId]?.name || 'Unknown',
            loanId: l.id,
            notes: l.notes || 'Loan Disbursement'
          });
        });
        
        payments.filter(p => !p.deletedAt).forEach(p => {
          const loan = loans.find(l => l.id === p.loanId);
          transactions.push({
            id: `trx_p_${p.id}`,
            date: p.date,
            type: 'PAYMENT_RECEIVED',
            amount: p.amount,
            contactId: loan?.contactId,
            contactName: contactMap[loan?.contactId]?.name || 'Unknown',
            loanId: p.loanId,
            notes: p.notes || 'Payment Received'
          });
        });
        
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // Contact Actions
      addContact: (contact) => set(state => ({
        contacts: [...state.contacts, { ...contact, id: `c_${Date.now()}`, createdAt: fmt(new Date()), updatedAt: fmt(new Date()), deletedAt: null }]
      })),
      updateContact: (id, updates) => set(state => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates, updatedAt: fmt(new Date()) } : c)
      })),
      softDeleteContact: (id) => set(state => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, deletedAt: fmt(new Date()) } : c)
      })),
      restoreContact: (id) => set(state => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, deletedAt: null } : c)
      })),

      // Loan Actions
      addLoan: (loan) => set(state => ({
        loans: [...state.loans, { ...loan, id: `l_${Date.now()}`, createdAt: fmt(new Date()), status: 'Active', deletedAt: null }]
      })),
      updateLoan: (id, updates) => set(state => ({
        loans: state.loans.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      softDeleteLoan: (id) => set(state => ({
        loans: state.loans.map(l => l.id === id ? { ...l, deletedAt: fmt(new Date()) } : l)
      })),
      restoreLoan: (id) => set(state => ({
        loans: state.loans.map(l => l.id === id ? { ...l, deletedAt: null } : l)
      })),

      // Payment Actions
      addPayment: (payment) => set(state => ({
        payments: [...state.payments, { ...payment, id: `p_${Date.now()}`, createdAt: fmt(new Date()), deletedAt: null }]
      })),
      softDeletePayment: (id) => set(state => ({
        payments: state.payments.map(p => p.id === id ? { ...p, deletedAt: fmt(new Date()) } : p)
      })),
      restorePayment: (id) => set(state => ({
        payments: state.payments.map(p => p.id === id ? { ...p, deletedAt: null } : p)
      })),
      
      // Settings Actions
      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      // Trash Bin Cleanup
      emptyTrash: () => set(state => ({
        contacts: state.contacts.filter(c => !c.deletedAt),
        loans: state.loans.filter(l => !l.deletedAt),
        payments: state.payments.filter(p => !p.deletedAt),
      })),
    }),
    {
      name: 'interest-manager-storage',
    }
  )
);
