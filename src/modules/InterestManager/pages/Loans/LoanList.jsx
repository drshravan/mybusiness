import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Calendar, FileText, ArrowUpRight } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency, processLoan } from '../../utils/FinancialEngine';
import { GlassCard, Button, StatusBadge, PageHeader } from '../../components/Shared/UI';
import LoanDetail from './LoanDetail';
import LoanForm from './LoanForm';

const LoansView = () => {
  const navigate = useNavigate();
  const { loans, contacts, payments } = useInterestStore();
  const [filter, setFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

  const activeLoans = loans.filter(l => !l.deletedAt);

  const enrichedLoans = activeLoans.map(loan => {
    const contact = contacts.find(c => c.id === loan.contactId);
    const loanPayments = payments.filter(p => p.loanId === loan.id && !p.deletedAt);
    const { totalBalance, unpaidInterest } = processLoan(loan, loanPayments);
    return { ...loan, contactName: contact?.name || 'Unknown', totalBalance, unpaidInterest };
  });

  const filtered = enrichedLoans.filter(l => {
    const matchesSearch = l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filter === 'All') return true;
    return l.status === filter;
  });

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <PageHeader 
        title="Loan Management" 
        subtitle="Track active disbursements and settlements." 
        action={<Button icon={PlusCircle} onClick={() => navigate('/loans/new')}>New Loan</Button>}
      />

      <GlassCard className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by contact or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="im-input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {['All', 'Active', 'Overdue', 'Settled', 'Closed'].map(f => (
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

      <div className="flex flex-col gap-4">
         {filtered.length === 0 && (
           <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-2">No loans found</h3>
              <p className="text-white/50">Try adjusting your search or filters.</p>
           </div>
         )}
         
         {filtered.map(loan => (
           <GlassCard 
             key={loan.id} 
             className="cursor-pointer hover:border-blue-500/50 transition-all group !p-0 overflow-hidden" 
             onClick={() => navigate(`/loans/${loan.id}`)}
           >
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{loan.contactName}</h3>
                      <p className="text-sm text-white/40">ID: #{loan.id.slice(-4)}</p>
                    </div>
                 </div>

                 <div className="flex flex-row justify-between w-full md:w-auto md:flex-1 px-0 md:px-8 border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                    <div>
                       <p className="text-xs text-white/40 mb-1">Principal</p>
                       <p className="font-semibold text-white">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div>
                       <p className="text-xs text-white/40 mb-1">Rate</p>
                       <p className="font-semibold text-emerald-400">{loan.interestRate}% {loan.interestMode === 'MONTHLY' ? '/mo' : '/yr'}</p>
                    </div>
                    <div>
                       <p className="text-xs text-white/40 mb-1">Total Bal</p>
                       <p className="font-bold text-blue-400">{formatCurrency(loan.totalBalance)}</p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <StatusBadge status={loan.status} />
                    <ArrowUpRight size={20} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                 </div>
              </div>
           </GlassCard>
         ))}
      </div>
    </div>
  );
};

// Sub-router
const LoanRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoansView />} />
      <Route path="new" element={<LoanForm />} />
      <Route path=":id/edit" element={<LoanForm />} />
      <Route path=":id" element={<LoanDetail />} />
    </Routes>
  );
};

export default LoanRouter;
