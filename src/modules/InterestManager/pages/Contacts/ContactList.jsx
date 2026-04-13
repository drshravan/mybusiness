import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Phone, MapPin, MoreVertical, CreditCard } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency, processLoan } from '../../utils/FinancialEngine';
import { GlassCard, Button, StatusBadge, PageHeader } from '../../components/Shared/UI';
import ContactDetail from './ContactDetail';
import ContactForm from './ContactForm';

const ContactsView = () => {
  const navigate = useNavigate();
  const { contacts, loans, payments } = useInterestStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const activeContacts = contacts.filter(c => !c.deletedAt);

  // Compute metrics per contact
  const contactsWithMetrics = activeContacts.map(contact => {
    const contactLoans = loans.filter(l => l.contactId === contact.id && !l.deletedAt);
    let activeLoans = 0;
    let totalBal = 0;
    let isOverdue = false;

    contactLoans.forEach(loan => {
      const loanPayments = payments.filter(p => p.loanId === loan.id && !p.deletedAt);
      const { totalBalance } = processLoan(loan, loanPayments);
      
      if (loan.status === 'Active') activeLoans++;
      if (loan.status === 'Overdue') isOverdue = true;
      totalBal += totalBalance;
    });

    return { ...contact, activeLoans, totalBal, isOverdue };
  });

  const filtered = contactsWithMetrics.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    if (!matchesSearch) return false;
    
    if (filter === 'Overdue') return c.isOverdue;
    if (filter === 'Active Balance') return c.totalBal > 0;
    return true;
  });

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <PageHeader 
        title="Contacts CRM" 
        subtitle="Manage your borrowers, their active loans, and history." 
        action={<Button icon={PlusCircle} onClick={() => navigate('/contacts/new')}>Add Contact</Button>}
      />

      <GlassCard className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="im-input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {['All', 'Active Balance', 'Overdue'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(contact => (
          <GlassCard key={contact.id} className="relative group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => navigate(`/contacts/${contact.id}`)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{contact.name}</h3>
                  <div className="flexitems-center gap-1 text-white/50 text-sm">
                    <Phone size={12} className="inline mr-1"/>{contact.phone}
                  </div>
                </div>
              </div>
              <button className="p-2 text-white/40 hover:text-white bg-white/0 hover:bg-white/10 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/contacts/${contact.id}/edit`); }}>
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4 text-sm text-white/60">
               <MapPin size={14} className="text-white/40" />
               <span className="truncate">{contact.address || 'No address provided'}</span>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xs text-white/40 mb-1">Total Outstanding</p>
                <p className="font-bold text-blue-400 tabular-nums">{formatCurrency(contact.totalBal)}</p>
              </div>
              <div className="text-right">
                {contact.isOverdue ? (
                  <StatusBadge status="Overdue" />
                ) : contact.activeLoans > 0 ? (
                  <StatusBadge status="Active" />
                ) : (
                   <span className="text-xs text-white/40">No active loans</span>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
         <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center">
            <CreditCard size={48} className="text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No contacts found</h3>
            <p className="text-white/50 mb-6 w-full max-w-sm">No borrowers exist yet or none match your search filters.</p>
            <Button icon={PlusCircle} onClick={() => navigate('/contacts/new')}>Add Contact</Button>
         </div>
      )}
    </div>
  );
};

// Router wrapping standardizing routes within Contacts section
const ContactRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ContactsView />} />
      <Route path="new" element={<ContactForm />} />
      <Route path=":id/edit" element={<ContactForm />} />
      <Route path=":id" element={<ContactDetail />} />
    </Routes>
  );
};

export default ContactRouter;
