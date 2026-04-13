import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { GlassCard, Button, PageHeader } from '../../components/Shared/UI';

const ContactForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { contacts, addContact, updateContact, softDeleteContact } = useInterestStore();
  
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (isEditing) {
      const contact = contacts.find(c => c.id === id);
      if (contact) {
        setFormData({ name: contact.name, phone: contact.phone, address: contact.address });
      } else {
        navigate('/contacts');
      }
    }
  }, [id, isEditing, contacts, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('Name and phone are required');
    
    if (isEditing) {
      updateContact(id, formData);
    } else {
      addContact(formData);
    }
    navigate('/contacts');
  };

  const handleDelete = () => {
    if (window.confirm("Move this contact to trash?")) {
      softDeleteContact(id);
      navigate('/contacts');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <button onClick={() => navigate('/contacts')} className="text-white/60 hover:text-white flex items-center gap-2 mb-4 transition-colors">
          <ChevronLeft size={18} /> Back to Contacts
        </button>
        <PageHeader 
          title={isEditing ? 'Edit Contact' : 'New Contact'} 
          subtitle="Record borrower details"
        />
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid gap-2">
            <label className="text-sm text-white/60 font-medium">Full Name <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              className="im-input" 
              placeholder="e.g. Ramesh Kumar" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-white/60 font-medium">Phone Number <span className="text-rose-500">*</span></label>
            <input 
              type="tel" 
              className="im-input" 
              placeholder="+91 9999999999" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-white/60 font-medium">Address</label>
            <textarea 
              className="im-input min-h-[100px] resize-y" 
              placeholder="Enter full address"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4 mt-2 border-t border-white/10">
            <Button type="submit" icon={Save}>
              {isEditing ? 'Save Changes' : 'Create Contact'}
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

export default ContactForm;
