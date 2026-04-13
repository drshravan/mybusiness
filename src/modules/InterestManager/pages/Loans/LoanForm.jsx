import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { GlassCard, Button, PageHeader } from '../../components/Shared/UI';
import { formatISO } from 'date-fns';

const LoanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); // To pick up prefilled contactId if passed
  const { loans, contacts, addLoan, updateLoan, softDeleteLoan } = useInterestStore();
  
  const isEditing = Boolean(id);
  const passedContactId = location.state?.contactId || '';

  const activeContacts = contacts.filter(c => !c.deletedAt);

  const [formData, setFormData] = useState({
    contactId: passedContactId,
    principal: '',
    interestRate: '',
    interestMode: 'MONTHLY',
    disbursementDate: formatISO(new Date(), { representation: 'date' }),
    collectionDate: '',
    reminderEnabled: false,
    nomineeName: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      const loan = loans.find(l => l.id === id);
      if (loan) {
        setFormData({
          contactId: loan.contactId,
          principal: loan.principal,
          interestRate: loan.interestRate,
          interestMode: loan.interestMode,
          disbursementDate: loan.disbursementDate.split('T')[0],
          collectionDate: loan.collectionDate ? loan.collectionDate.split('T')[0] : '',
          reminderEnabled: loan.reminderEnabled,
          nomineeName: loan.nomineeName || '',
          notes: loan.notes || '',
        });
      } else {
        navigate('/loans');
      }
    }
  }, [id, isEditing, loans, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.contactId || !formData.principal || !formData.interestRate) {
      return alert('Missing required fields');
    }

    const payload = {
      ...formData,
      principal: parseFloat(formData.principal),
      interestRate: parseFloat(formData.interestRate),
      disbursementDate: new Date(formData.disbursementDate).toISOString(),
      collectionDate: formData.collectionDate ? new Date(formData.collectionDate).toISOString() : '',
    };

    if (isEditing) {
      updateLoan(id, payload);
    } else {
      addLoan(payload);
    }
    navigate('/loans');
  };

  const handleDelete = () => {
    if (window.confirm("Move this loan to trash?")) {
      softDeleteLoan(id);
      navigate('/loans');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <button onClick={() => navigate('/loans')} className="text-white/60 hover:text-white flex items-center gap-2 mb-4 transition-colors">
          <ChevronLeft size={18} /> Back to Loans
        </button>
        <PageHeader 
          title={isEditing ? 'Edit Financial Record' : 'New Loan Disbursement'} 
          subtitle="Configure interest rate, duration, and tracking rules."
        />
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Select Borrower <span className="text-rose-500">*</span></label>
              <select 
                className="im-input"
                value={formData.contactId}
                onChange={e => setFormData({...formData, contactId: e.target.value})}
                required
                disabled={isEditing} // usually don't change borrower after creating
              >
                <option value="">-- Select Contact --</option>
                {activeContacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Principal Amount (₹) <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                step="0.01"
                className="im-input" 
                placeholder="50000" 
                value={formData.principal}
                onChange={e => setFormData({...formData, principal: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Interest Rate (%) <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                step="0.01"
                className="im-input" 
                placeholder="2.0" 
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Interest Mode</label>
              <select 
                className="im-input"
                value={formData.interestMode}
                onChange={e => setFormData({...formData, interestMode: e.target.value})}
              >
                <option value="MONTHLY">Monthly (Per 30 Days)</option>
                <option value="YEARLY">Yearly (Per 365 Days)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Disbursement Date</label>
              <input 
                type="date" 
                className="im-input"
                value={formData.disbursementDate}
                onChange={e => setFormData({...formData, disbursementDate: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/60 font-medium">Estimated Collection Date</label>
              <input 
                type="date" 
                className="im-input"
                value={formData.collectionDate}
                onChange={e => setFormData({...formData, collectionDate: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm text-white/60 font-medium">Nominee Details (Optional)</label>
              <input 
                type="text" 
                className="im-input"
                placeholder="Name and contact"
                value={formData.nomineeName}
                onChange={e => setFormData({...formData, nomineeName: e.target.value})}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm text-white/60 font-medium">Notes</label>
              <textarea 
                className="im-input" 
                placeholder="Add context to this loan..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 mt-2 border-t border-white/10">
            <Button type="submit" icon={Save}>
              {isEditing ? 'Save Changes' : 'Record Loan'}
            </Button>
            {isEditing && (
              <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete} className="ml-auto">
                Delete
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default LoanForm;
