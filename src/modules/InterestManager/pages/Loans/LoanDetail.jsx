import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Calendar, FileText, Activity, AlertCircle, Edit, ExternalLink } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency, processLoan } from '../../utils/FinancialEngine';
import { GlassCard, Button, StatusBadge, StatCard } from '../../components/Shared/UI';
import { differenceInDays, parseISO } from 'date-fns';

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, contacts, payments } = useInterestStore();

  const loan = loans.find(l => l.id === id && !l.deletedAt);
  if (!loan) return <div className="p-8 text-white">Loan Record not found or deleted.</div>;

  const contact = contacts.find(c => c.id === loan.contactId);
  const loanPayments = payments.filter(p => p.loanId === loan.id && !p.deletedAt);
  
  const engineResult = processLoan(loan, loanPayments);
  const { 
    currentPrincipal, 
    unpaidInterest, 
    totalBalance, 
    totalProfit, 
    totalInterestPaid,
    transactions 
  } = engineResult;

  const durationDays = differenceInDays(new Date(), parseISO(loan.disbursementDate));

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/loans')} className="text-white/60 hover:text-white flex items-center gap-2 transition-colors">
          <ChevronLeft size={18} /> Loans
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" icon={Edit} onClick={() => navigate(`/loans/${loan.id}/edit`)}>Edit</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
         <GlassCard className="flex-1 w-full bg-gradient-to-br from-blue-900/30 to-black !border-blue-500/20">
           <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                 <User size={20} />
               </div>
               <div>
                 <p className="text-white/60 text-sm mb-0.5">Borrower</p>
                 <h2 className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer transition-colors" onClick={() => navigate(`/contacts/${loan.contactId}`)}>{contact?.name || 'Unknown'} <ExternalLink size={14} className="inline opacity-50"/></h2>
               </div>
             </div>
             <StatusBadge status={loan.status} />
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
             <div>
               <p className="text-white/40 text-xs mb-1">Original Principal</p>
               <p className="text-white font-semibold">{formatCurrency(loan.principal)}</p>
             </div>
             <div>
               <p className="text-white/40 text-xs mb-1">Interest Rate</p>
               <p className="text-emerald-400 font-semibold">{loan.interestRate}% {loan.interestMode}</p>
             </div>
             <div>
               <p className="text-white/40 text-xs mb-1">Start Date</p>
               <p className="text-white font-semibold">{new Date(loan.disbursementDate).toLocaleDateString()}</p>
             </div>
             <div>
               <p className="text-white/40 text-xs mb-1">Duration</p>
               <p className="text-amber-400 font-semibold">{durationDays} Days</p>
             </div>
           </div>
         </GlassCard>

         <div className="w-full md:w-80 shrink-0">
           <GlassCard className="h-full flex flex-col justify-center">
             <p className="text-white/50 text-sm mb-2 text-center">Total Open Balance</p>
             <h1 className="text-4xl font-bold text-center text-blue-400 tabular-nums">
               {formatCurrency(totalBalance)}
             </h1>
             <div className="flex justify-between mt-6 text-sm">
               <span className="text-white/40">Principal</span>
               <span className="text-white font-semibold">{formatCurrency(currentPrincipal)}</span>
             </div>
             <div className="flex justify-between mt-2 text-sm">
               <span className="text-white/40">Accrued Interest</span>
               <span className="text-rose-400 font-semibold">{formatCurrency(unpaidInterest)}</span>
             </div>
           </GlassCard>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Interest Recovered" value={formatCurrency(totalInterestPaid)} color="emerald" icon={Activity} />
        <StatCard title="Remaining Principal" value={formatCurrency(currentPrincipal)} color="blue" icon={FileText} />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Payment Timeline</h3>
        {transactions.filter(t => t.type === 'DISCOUNT' || t.type === 'CASH').length === 0 ? (
          <GlassCard className="text-center py-10 border-dashed">
            <AlertCircle size={32} className="mx-auto mb-3 text-white/20"/>
            <p className="text-white/60">No payments have been recorded for this loan.</p>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-3">
             {transactions.filter(t => t.type === 'DISCOUNT' || t.type === 'CASH').map((trx, idx) => (
                <GlassCard key={idx} className="!p-4 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${trx.type === 'DISCOUNT' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                       <Calendar size={20} />
                     </div>
                     <div>
                       <p className="font-semibold text-white">{trx.type === 'DISCOUNT' ? 'Waiver / Discount' : 'Payment Received'}</p>
                       <p className="text-xs text-white/50">{new Date(trx.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right w-full sm:w-auto">
                     <p className="font-bold text-lg text-emerald-400 tabular-nums">+{formatCurrency(trx.amount)}</p>
                     <p className="text-xs text-white/40">Int: {formatCurrency(trx.interestPortion)} | P: {formatCurrency(trx.principalPortion)}</p>
                  </div>
                </GlassCard>
             ))}
          </div>
        )}
      </div>

      {/* Floating Sticky CTA box for entering new payments against this loan */}
      <div className="fixed bottom-0 left-0 right-0 md:left-72 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-20 flex justify-end">
         <div className="max-w-5xl mx-auto w-full flex justify-end">
            <Button 
               size="lg" 
               className="shadow-[0_0_20px_rgba(37,99,235,0.3)] animate-pulse hover:animate-none"
               onClick={() => navigate('/payments/new', { state: { loanId: loan.id }})}
            >
              Add Payment
            </Button>
         </div>
      </div>
    </div>
  );
};

export default LoanDetail;
