import React from 'react';
import { Settings, User, Bell, Shield, Cloud, Smartphone, MessageCircle, Info } from 'lucide-react';
import { useInterestStore } from '../../store/useInterestStore';
import { GlassCard, PageHeader } from '../../components/Shared/UI';

const SettingsView = () => {
  const { settings, updateSettings } = useInterestStore();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Icon size={20} className="text-blue-400" /> {title}
      </h3>
      <div className="grid gap-3">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ title, subtitle, action }) => (
    <GlassCard className="!p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
       <div className="mb-4 sm:mb-0">
         <p className="font-semibold text-white">{title}</p>
         <p className="text-sm text-white/50">{subtitle}</p>
       </div>
       <div className="shrink-0 w-full sm:w-auto text-right">
         {action}
       </div>
    </GlassCard>
  );

  const ToggleSwitch = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-500' : 'bg-white/10'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Application Settings" 
        subtitle="Manage your preferences, security, and account syncing." 
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 mt-8">
        <div className="hidden md:flex flex-col gap-1 sticky top-6">
           <GlassCard className="!p-2 flex flex-col gap-1 w-full bg-black/40">
             {['Account', 'Security', 'Notifications', 'Data Backup', 'Support'].map((nav, i) => (
                <button key={nav} className={`px-4 py-2.5 text-left rounded-lg text-sm font-semibold transition-colors ${i === 0 ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  {nav}
                </button>
             ))}
           </GlassCard>
        </div>

        <div>
          <Section title="Account & Identity" icon={User}>
             <SettingRow 
               title="Google Account Sync" 
               subtitle="Guest Account (Currently Offline)"
               action={<button className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-bold transition-colors">Sign in with Google</button>}
             />
             <SettingRow 
               title="Currency Format" 
               subtitle="Display: INR (₹)"
               action={<span className="text-white/40 text-sm">Cannot be changed</span>}
             />
          </Section>

          <Section title="Security & Access" icon={Shield}>
             <SettingRow 
               title="Require Authentication" 
               subtitle="Lock the app using a secondary PIN or biometric."
               action={<ToggleSwitch checked={settings.appLockEnabled} onChange={() => handleToggle('appLockEnabled')} />}
             />
          </Section>

          <Section title="Notifications" icon={Bell}>
             <SettingRow 
               title="Enable Alerts" 
               subtitle="Receive messages for approaching due dates."
               action={<ToggleSwitch checked={settings.notificationsEnabled} onChange={() => handleToggle('notificationsEnabled')} />}
             />
             {settings.notificationsEnabled && (
                <SettingRow 
                  title="Daily Reminder Time" 
                  subtitle="When to calculate daily tasks."
                  action={
                    <input 
                      type="time" 
                      className="im-input !py-1 !px-3 text-sm" 
                      value={settings.dailyReminderTime} 
                      onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })} 
                    />
                  }
                />
             )}
          </Section>

          <Section title="Data & Backup" icon={Cloud}>
             <SettingRow 
               title="Local Storage Backup" 
               subtitle={`Using ${Math.round(JSON.stringify(localStorage).length / 1024)} KB of storage.`}
               action={<button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold transition-colors">Export JSON</button>}
             />
             <SettingRow 
               title="Restore Data" 
               subtitle="Overwrite current local data with a backup file."
               action={<button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 rounded-lg text-sm font-bold transition-colors">Import File</button>}
             />
          </Section>

          <Section title="Support & Information" icon={Info}>
             <SettingRow 
               title="WhatsApp Support" 
               subtitle="Get help directly from developers."
               action={(
                 <a href="#" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-bold border border-emerald-500/30 px-3 py-1.5 rounded-lg bg-emerald-500/10">
                   <MessageCircle size={16} /> Contact Us
                 </a>
               )}
             />
             <SettingRow 
               title="App Version" 
               subtitle="Build v1.0.0 (Production Desktop Beta)"
               action={<span className="text-white/40 text-xs font-mono bg-black/50 px-2 py-1 rounded">f22c9a1</span>}
             />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
