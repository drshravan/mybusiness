import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency } from '../../utils/FinancialEngine';
import { GlassCard, StatCard, PageHeader } from '../../components/Shared/UI';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { getTransactions } = useInterestStore();
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = getTransactions();

  const totalLent = transactions.reduce((acc, t) => acc + (t.type === 'LOAN_GIVEN' ? t.amount : 0), 0);
  const totalCollected = transactions.reduce((acc, t) => acc + (t.type === 'PAYMENT_RECEIVED' ? t.amount : 0), 0);

  const filtered = transactions.filter(t => 
    t.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-6xl mx-auto">
      <PageHeader 
        title="Transaction Ledger" 
        subtitle="Chronological history of all capital outlays and incoming payments." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard title="Total Capital Lent" value={formatCurrency(totalLent)} icon={ArrowUpRight} color="blue" />
        <StatCard title="Total Capital Recovered" value={formatCurrency(totalCollected)} icon={ArrowDownLeft} color="emerald" />
      </div>

      <GlassCard className="mb-6 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by contact or notes..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="im-input pl-10 w-full"
          />
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
           <div className="p-12 text-center">
              <Activity size={32} className="mx-auto mb-3 text-white/20"/>
              <p className="text-white/60">No transactions recorded yet.</p>
           </div>
        ) : (
          <div className="divide-y divide-white/10">
             {filtered.map(trx => (
               <div 
                 key={trx.id} 
                 className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-white/5 transition-colors cursor-pointer"
                 onClick={() => {
                   if (trx.type === 'LOAN_GIVEN') navigate(`/loans/${trx.loanId}`);
                   if (trx.type === 'PAYMENT_RECEIVED') navigate(`/payments`); // No direct payment detail view currently, list is fine
                 }}
               >
                 <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-1/2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${trx.type === 'PAYMENT_RECEIVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {trx.type === 'PAYMENT_RECEIVED' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{trx.contactName}</h3>
                      <p className="text-sm text-white/50">{trx.type === 'PAYMENT_RECEIVED' ? 'Payment Received' : 'Loan Disbursed'} • {new Date(trx.date).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="w-full sm:w-1/4">
                   <p className="text-sm text-white/70 truncate">{trx.notes}</p>
                 </div>

                 <div className="w-full sm:w-1/4 text-right mt-3 sm:mt-0">
                    <p className={`font-bold text-lg tabular-nums ${trx.type === 'PAYMENT_RECEIVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trx.type === 'PAYMENT_RECEIVED' ? '+' : '-'}{formatCurrency(trx.amount)}
                    </p>
                 </div>
               </div>
             ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default TransactionHistory;
