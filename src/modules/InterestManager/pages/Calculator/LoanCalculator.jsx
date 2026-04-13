import React, { useState, useMemo } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import { formatCurrency, calculateAccruedInterest } from '../../utils/FinancialEngine';
import { GlassCard, PageHeader, StatCard } from '../../components/Shared/UI';
import { formatISO, differenceInDays } from 'date-fns';

const LoanCalculator = () => {
  const [formData, setFormData] = useState({
    principal: 100000,
    rate: 2,
    mode: 'MONTHLY',
    startDate: formatISO(new Date(), { representation: 'date' }),
    endDate: formatISO(new Date(Date.now() + 30*24*60*60*1000), { representation: 'date' })
  });

  const calculation = useMemo(() => {
    const days = differenceInDays(new Date(formData.endDate), new Date(formData.startDate));
    if (days < 0 || !formData.principal || !formData.rate) return null;

    const interest = calculateAccruedInterest(
      parseFloat(formData.principal), 
      parseFloat(formData.rate), 
      days, 
      formData.mode
    );

    return {
      days,
      interest,
      total: parseFloat(formData.principal) + interest
    };
  }, [formData]);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <PageHeader 
        title="Interest Calculator" 
        subtitle="Quickly project future returns or check potential loan conditions." 
      />

      <div className="flex flex-col lg:flex-row gap-6">
         <GlassCard className="flex-1 w-full lg:w-1/2">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Calculator size={20} className="text-blue-400"/> Calculation Parameters</h3>
            
            <div className="grid gap-6">
              <div className="grid gap-2 relative">
                <label className="text-sm text-white/60 font-medium">Principal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">₹</span>
                  <input 
                    type="number" 
                    className="im-input pl-10 text-xl font-bold w-full" 
                    value={formData.principal}
                    onChange={e => setFormData({...formData, principal: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-white/60 font-medium">Interest Rate (%)</label>
                  <input 
                    type="number" 
                    className="im-input" 
                    value={formData.rate}
                    onChange={e => setFormData({...formData, rate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-white/60 font-medium">Mode</label>
                  <select 
                    className="im-input"
                    value={formData.mode}
                    onChange={e => setFormData({...formData, mode: e.target.value})}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-white/60 font-medium">Start Date</label>
                  <input 
                    type="date" 
                    className="im-input" 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-white/60 font-medium">End Date</label>
                  <input 
                    type="date" 
                    className="im-input" 
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
         </GlassCard>

         <div className="flex-[0.8] w-full lg:w-[40%] flex flex-col gap-6">
            {!calculation ? (
               <GlassCard className="h-full flex items-center justify-center text-center">
                  <p className="text-white/40">Enter valid dates and amounts to see the projection.</p>
               </GlassCard>
            ) : (
               <>
                 <GlassCard className="bg-gradient-to-br from-blue-900/40 to-black !border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
                    <p className="text-white/60 text-sm mb-1 text-center">Total Estimated Amount</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-white tabular-nums my-4">
                      {formatCurrency(calculation.total)}
                    </h1>
                 </GlassCard>

                 <StatCard 
                   title="Projected Interest" 
                   value={formatCurrency(calculation.interest)} 
                   color="emerald" 
                 />

                 <GlassCard className="flex items-center justify-between !py-4">
                    <span className="text-white/60">Duration</span>
                    <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-full">{calculation.days} Days</span>
                 </GlassCard>
               </>
            )}
         </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
