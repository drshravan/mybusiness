import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { processLoan, formatCurrency } from '../../utils/FinancialEngine';
import { GlassCard, Button, PageHeader } from '../../components/Shared/UI';
import { formatISO } from 'date-fns';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const passedLoanId = location.state?.loanId || '';
  
  const { payments, loans, contacts, addPayment, softDeletePayment } = useInterestStore();
  const isEditing = Boolean(id);

  const activeLoans = loans.filter(l => !l.deletedAt);

  const [formData, setFormData] = useState({
    loanId: passedLoanId,
    amount: '',
    discount: 0,
    date: formatISO(new Date(), { representation: 'date' }),
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      const p = payments.find(p => p.id === id);
      if (p) {
        setFormData({
          loanId: p.loanId,
          amount: p.amount,
          discount: p.discount,
          date: p.date.split('T')[0],
          notes: p.notes || '',
        });
      } else {
        navigate('/payments');
      }
    }
  }, [id, isEditing, payments, navigate]);

  const selectedLoanData = useMemo(() => {
    if (!formData.loanId) return null;
    const loan = loans.find(l => l.id === formData.loanId);
    if (!loan) return null;

    // To prevent cyclical dependency of "what was the due BEFORE this payment", we will just process standard up to this moment
    // For editing past payments, the engine already handles it but predicting requires complex replay.
    // In MVP, we provide smart helper chips based on current situation (as if it's a new payment).
    const loanPayments = payments.filter(p => p.loanId === formData.loanId && !p.deletedAt && p.id !== id);
    return processLoan(loan, loanPayments, new Date(formData.date));
  }, [formData.loanId, formData.date, loans, payments, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.loanId || !formData.amount) return alert('Loan and amount required.');

    const amountNum = parseFloat(formData.amount);
    
    // Auto-calculate split directly mimicking engine logic
    let tempUnpaid = selectedLoanData?.unpaidInterest || 0;
    
    let appliedToInterest = 0;
    let appliedToPrincipal = 0;

    if (formData.discount > 0) {
       appliedToInterest = Math.min(amountNum, tempUnpaid);
       appliedToPrincipal = Math.min(amountNum - appliedToInterest, selectedLoanData?.currentPrincipal || 0);
    } else {
       appliedToInterest = Math.min(amountNum, tempUnpaid);
       appliedToPrincipal = Math.min(amountNum - appliedToInterest, selectedLoanData?.currentPrincipal || 0);
    }

    const payload = {
      loanId: formData.loanId,
      amount: amountNum,
      discount: formData.discount,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes,
      interestPortion: appliedToInterest,
      principalPortion: appliedToPrincipal,
    };

    if (isEditing) {
      // Direct replacement unsupported elegantly without store rewrite, so we soft delete and add for MVP
      // Wait, Store updatePayment wasn't written! Let's implement updating via the store logic by rewriting... 
      // Actually softDelete + add is an idempotent way to "update" financial ledgers visually and logically.
      // But let's just make it error if editing for now, or just use softDelete + add.
      softDeletePayment(id);
      addPayment(payload);
    } else {
      addPayment(payload);
    }
    
    // Return to the loan that we came from if passed via state
    if (passedLoanId) {
       navigate(`/loans/${passedLoanId}`);
    } else {
       navigate('/payments');
    }
  };

  const handleSmartFill = (amount, isDiscount = 0) => {
    setFormData(prev => ({
       ...prev,
       amount: amount.toFixed(2),
       discount: isDiscount
    }));
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white flex items-center gap-2 mb-4 transition-colors">
          <ChevronLeft size={18} /> Back
        </button>
        <PageHeader 
          title={isEditing ? 'Edit Entry' : 'Record New Entry'} 
          subtitle="Apply funds or waivers against borrower's active outstanding."
        />
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid gap-2">
            <label className="text-sm text-white/60 font-medium">Target Loan <span className="text-rose-500">*</span></label>
            <select 
              className="im-input"
              value={formData.loanId}
              onChange={e => setFormData({...formData, loanId: e.target.value})}
              required
              disabled={isEditing || Boolean(passedLoanId)}
            >
              <option value="">-- Choose Active Loan --</option>
              {activeLoans.map(l => {
                const c = contacts.find(contact => contact.id === l.contactId);
                return (
                  <option key={l.id} value={l.id}>
                    {c?.name} - {formatCurrency(l.principal)} - #{l.id.slice(-4)}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Effective Date <span className="text-rose-500">*</span></label>
              <input 
                type="date" 
                className="im-input" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Entry Type</label>
              <select 
                className="im-input"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: parseInt(e.target.value)})}
              >
                <option value={0}>Cash Payment Received</option>
                <option value={1}>Waiver / Discount Applied</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2 mt-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">SMART HELPER CHIPS</label>
            <div className="flex gap-2 flex-wrap">
               <button type="button" onClick={() => handleSmartFill(selectedLoanData?.unpaidInterest || 0, 0)} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  Interest Due ({formatCurrency(selectedLoanData?.unpaidInterest || 0)})
               </button>
               <button type="button" onClick={() => handleSmartFill(selectedLoanData?.totalBalance || 0, 0)} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                  Full Settlement ({formatCurrency(selectedLoanData?.totalBalance || 0)})
               </button>
               <button type="button" onClick={() => handleSmartFill(selectedLoanData?.unpaidInterest || 0, 1)} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
                  Waive Interest
               </button>
            </div>
          </div>

          <div className="grid gap-2 relative">
            <label className="text-sm text-white/60 font-medium">Amount (₹) <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">₹</span>
              <input 
                type="number" 
                step="0.01"
                className="im-input pl-10 text-xl font-bold w-full" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-white/60 font-medium">Note / Transaction Details</label>
            <input 
              type="text" 
              className="im-input" 
              placeholder="e.g. Paid via UPI / Settled mutually"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex justify-between items-center mt-2">
             <div className="text-sm">
                <span className="text-white/60">Interest Split: </span>
                <span className="text-white font-bold">{formatCurrency((formData.amount && selectedLoanData) ? Math.min(parseFloat(formData.amount), selectedLoanData.unpaidInterest) : 0)}</span>
             </div>
             <div className="text-sm">
                <span className="text-white/60">Principal Split: </span>
                <span className="text-white font-bold">{formatCurrency((formData.amount && selectedLoanData) ? Math.min(parseFloat(formData.amount) - Math.min(parseFloat(formData.amount), selectedLoanData.unpaidInterest), selectedLoanData.currentPrincipal) : 0)}</span>
             </div>
          </div>

          <div className="flex gap-4 pt-4 mt-2 border-t border-white/10">
            <Button type="submit" icon={Save}>
              {isEditing ? 'Update Entry' : 'Record Entry'}
            </Button>
            {isEditing && (
              <Button type="button" variant="danger" icon={Trash2} onClick={() => {
                if (window.confirm("Move this payment to trash?")) {
                  softDeletePayment(id);
                  navigate(-1);
                }
              }} className="ml-auto">
                Delete
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default PaymentForm;
