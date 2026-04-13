import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { GlassCard, Button, PageHeader } from '../../components/Shared/UI';
import { formatCurrency } from '../../utils/FinancialEngine';

const TrashBin = () => {
  const { contacts, loans, payments, restoreContact, restoreLoan, restorePayment, emptyTrash } = useInterestStore();

  const [activeTab, setActiveTab] = useState('contacts');

  const deletedContacts = contacts.filter(c => c.deletedAt);
  const deletedLoans = loans.filter(l => l.deletedAt);
  const deletedPayments = payments.filter(p => p.deletedAt);

  const getCount = () => deletedContacts.length + deletedLoans.length + deletedPayments.length;

  const handleEmptyTrash = () => {
    if (window.confirm("Are you sure you want to permanently delete ALL items in the trash? This cannot be undone.")) {
      emptyTrash();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <PageHeader 
        title="Trash Bin" 
        subtitle={`You have ${getCount()} items currently sitting in the trash.`}
        action={
          <Button variant="danger" icon={AlertTriangle} onClick={handleEmptyTrash} disabled={getCount() === 0}>
            Empty Trash
          </Button>
        }
      />

      <GlassCard className="!p-0 mb-6 flex overflow-x-auto border-b border-white/10">
        {[
          { id: 'contacts', label: 'Contacts', count: deletedContacts.length },
          { id: 'loans', label: 'Loans', count: deletedLoans.length },
          { id: 'payments', label: 'Payments', count: deletedPayments.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === tab.id ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-500/20' : 'bg-white/10 text-white/40'}`}>
               {tab.count}
            </span>
          </button>
        ))}
      </GlassCard>

      <div className="flex flex-col gap-3">
         {activeTab === 'contacts' && deletedContacts.length === 0 && <EmptyState type="Contacts" />}
         {activeTab === 'contacts' && deletedContacts.map(c => (
           <TrashRow 
             key={c.id} 
             title={c.name} 
             subtitle={`${c.phone} • Deleted on ${new Date(c.deletedAt).toLocaleDateString()}`}
             onRestore={() => restoreContact(c.id)}
           />
         ))}

         {activeTab === 'loans' && deletedLoans.length === 0 && <EmptyState type="Loans" />}
         {activeTab === 'loans' && deletedLoans.map(l => (
           <TrashRow 
             key={l.id} 
             title={`Loan #${l.id.slice(-4)}`} 
             subtitle={`Principal: ${formatCurrency(l.principal)} • Deleted on ${new Date(l.deletedAt).toLocaleDateString()}`}
             onRestore={() => restoreLoan(l.id)}
           />
         ))}

         {activeTab === 'payments' && deletedPayments.length === 0 && <EmptyState type="Payments" />}
         {activeTab === 'payments' && deletedPayments.map(p => (
           <TrashRow 
             key={p.id} 
             title={`${p.discount > 0 ? 'Waiver' : 'Payment'} of ${formatCurrency(p.amount)}`} 
             subtitle={`Notes: ${p.notes || 'N/A'} • Deleted on ${new Date(p.deletedAt).toLocaleDateString()}`}
             onRestore={() => restorePayment(p.id)}
           />
         ))}
      </div>
    </div>
  );
};

const TrashRow = ({ title, subtitle, onRestore }) => (
  <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
    <div className="mb-4 sm:mb-0">
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-sm text-white/50">{subtitle}</p>
    </div>
    <div className="w-full sm:w-auto">
      <Button variant="ghost" className="w-full sm:w-auto border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" icon={RotateCcw} onClick={onRestore}>
        Restore
      </Button>
    </div>
  </GlassCard>
);

const EmptyState = ({ type }) => (
  <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
    <Trash2 size={32} className="mx-auto mb-3 text-white/20"/>
    <p className="text-white/60">No deleted {type.toLowerCase()} in the trash bin.</p>
  </div>
);

export default TrashBin;
