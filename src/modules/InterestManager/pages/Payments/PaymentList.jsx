import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Wallet, ArrowDownLeft } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency } from '../../utils/FinancialEngine';
import { GlassCard, Button, StatCard, PageHeader } from '../../components/Shared/UI';
import PaymentForm from './PaymentForm';

const PaymentsView = () => {
  const navigate = useNavigate();
  const { payments, loans, contacts } = useInterestStore();
  const [searchTerm, setSearchTerm] = useState('');

  const activePayments = payments.filter(p => !p.deletedAt);
  
  const totalCollected = activePayments.reduce((acc, p) => acc + (p.discount === 0 ? p.amount : 0), 0);
  const totalDiscounts = activePayments.reduce((acc, p) => acc + (p.discount > 0 ? p.amount : 0), 0);

  const enrichedPayments = activePayments.map(payment => {
    const loan = loans.find(l => l.id === payment.loanId);
    const contact = contacts.find(c => c.id === loan?.contactId);
    return { ...payment, contactName: contact?.name || 'Unknown', loanIdShort: loan?.id.slice(-4) || 'Unk' };
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  const filtered = enrichedPayments.filter(p => {
    return p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <PageHeader 
        title="Payment Center" 
        subtitle="Manage all incoming cash flow and waivers." 
        action={<Button icon={PlusCircle} onClick={() => navigate('/payments/new')}>Add Payment / Waiver</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard title="Total Cash Collected" value={formatCurrency(totalCollected)} icon={ArrowDownLeft} color="emerald" />
        <StatCard title="Total Waivers Granted" value={formatCurrency(totalDiscounts)} icon={Wallet} color="gold" />
      </div>

      <GlassCard className="mb-6 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by borrower or note..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="im-input pl-10 w-full"
          />
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3">
         {filtered.length === 0 && (
           <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-2">No payments found</h3>
              <p className="text-white/50">Record a payment from the loans section or click Add Payment.</p>
           </div>
         )}
         
         {filtered.map(payment => (
           <GlassCard 
             key={payment.id} 
             className="!p-4 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:border-emerald-500/50 transition-all border border-transparent"
             onClick={() => navigate(`/payments/${payment.id}/edit`)}
           >
              <div className="flex justify-between w-full md:w-1/3 mb-4 md:mb-0">
                 <div>
                   <h3 className="font-bold text-white">{payment.contactName}</h3>
                   <p className="text-xs text-white/50">Loan #{payment.loanIdShort}</p>
                 </div>
                 <div className="text-right md:hidden">
                    <p className={`font-bold tabular-nums ${payment.discount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {payment.discount > 0 ? 'Waiver' : '+CASH'} {formatCurrency(payment.amount)}
                    </p>
                 </div>
              </div>
              
              <div className="flex w-full md:w-2/3 items-start md:items-center justify-between gap-4">
                 <div className="flex-1">
                   <p className="text-sm text-white/70 truncate max-w-[200px]">{payment.notes || 'No notes'}</p>
                   <p className="text-xs text-white/40">{new Date(payment.date).toLocaleDateString()}</p>
                 </div>
                 
                 <div className="hidden md:block text-right shrink-0 min-w-[120px]">
                    <p className={`font-bold tabular-nums text-lg ${payment.discount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(payment.amount)}
                    </p>
                 </div>
                 
                 <div className="text-right shrink-0 hidden sm:block min-w-[150px]">
                    <p className="text-xs text-white/50">Interest Applied: {formatCurrency(payment.interestPortion)}</p>
                    <p className="text-xs text-white/50">Principal Applied: {formatCurrency(payment.principalPortion)}</p>
                 </div>
              </div>
           </GlassCard>
         ))}
      </div>
    </div>
  );
};

const PaymentRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<PaymentsView />} />
      <Route path="new" element={<PaymentForm />} />
      <Route path=":id/edit" element={<PaymentForm />} />
    </Routes>
  );
};

export default PaymentRouter;
