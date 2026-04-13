import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MapPin, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { formatCurrency, processLoan } from '../../utils/FinancialEngine';
import { GlassCard, Button, StatusBadge } from '../../components/Shared/UI';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, loans, payments } = useInterestStore();

  const contact = contacts.find(c => c.id === id && !c.deletedAt);
  if (!contact) return <div className="p-8 text-white">Contact not found or deleted.</div>;

  const contactLoans = loans.filter(l => l.contactId === id && !l.deletedAt);

  let totalPrincipal = 0;
  let totalBalance = 0;
  
  const enrichedLoans = contactLoans.map(loan => {
    const loanPayments = payments.filter(p => p.loanId === loan.id && !p.deletedAt);
    const { currentPrincipal, totalBalance: bal } = processLoan(loan, loanPayments);
    totalPrincipal += currentPrincipal;
    totalBalance += bal;
    return { ...loan, currentPrincipal, totalBalance: bal };
  });

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate('/contacts')} className="text-white/60 hover:text-white flex items-center gap-2 mb-6 transition-colors">
        <ChevronLeft size={18} /> Contacts
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
        <GlassCard className="flex-1 w-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 p-1 shadow-lg">
               <div className="w-full h-full bg-black/50 rounded-xl flex items-center justify-center text-4xl font-bold text-white border border-white/20">
                 {contact.name.charAt(0)}
               </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
              <div className="flex flex-col gap-2 text-white/70">
                <span className="flex items-center gap-2"><Phone size={16} className="text-blue-400"/> {contact.phone}</span>
                {contact.address && <span className="flex items-center gap-2"><MapPin size={16} className="text-emerald-400"/> {contact.address}</span>}
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4 w-full md:w-72 shrink-0">
          <GlassCard className="!p-4 bg-blue-900/20 border-blue-500/30">
            <p className="text-sm text-blue-300/80 mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-white tabular-nums">{formatCurrency(totalBalance)}</p>
          </GlassCard>
          <Button icon={PlusCircle} className="w-full justify-center" onClick={() => navigate('/loans/new', { state: { contactId: contact.id }})}>
            New Loan
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Linked Loans</h2>
        {enrichedLoans.length === 0 ? (
          <GlassCard className="text-center py-12 border-dashed">
            <p className="text-white/60 mb-4">No loans associated with this contact.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedLoans.map(loan => (
              <GlassCard key={loan.id} className="cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => navigate(`/loans/${loan.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Loan #{loan.id.slice(-4)}</p>
                    <p className="text-xl font-bold text-white mb-1 tabular-nums">{formatCurrency(loan.principal)}</p>
                    <p className="text-xs text-white/40">{loan.interestRate}% {loan.interestMode}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={loan.status} />
                    <ArrowUpRight size={18} className="text-white/20 mt-2" />
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-white/10 flex justify-between">
                   <div>
                     <p className="text-xs text-white/50">Current Balance</p>
                     <p className="font-bold text-blue-400 tabular-nums">{formatCurrency(loan.totalBalance)}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-white/50">Collection Date</p>
                     <p className="text-sm text-white border-b border-white/20 pb-0.5 inline-block">{new Date(loan.collectionDate).toLocaleDateString()}</p>
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ContactDetail;
