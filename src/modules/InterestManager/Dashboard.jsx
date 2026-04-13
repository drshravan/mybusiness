import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Wallet, 
  Calculator, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useInterestStore } from './store/useInterestStore';
import { formatCurrency, processLoan } from './utils/FinancialEngine';
import { StatCard, GlassCard, Button, StatusBadge, PageHeader } from './components/Shared/UI';

const Dashboard = () => {
  const navigate = useNavigate();
  const { loans, payments, contacts } = useInterestStore();
  
  const { totalActivePrincipal, totalProfit, totalOverdue, activeCount } = useMemo(() => {
    let tAP = 0;
    let tP = 0;
    let tOD = 0;
    let aC = 0;
    
    loans.filter(l => !l.deletedAt).forEach(loan => {
      try {
        const loanPayments = payments.filter(p => p.loanId === loan.id && !p.deletedAt);
        const engineData = processLoan(loan, loanPayments);
        const { currentPrincipal = 0, totalProfit = 0, unpaidInterest = 0 } = engineData || {};
        
        if (loan.status === 'Active' || loan.status === 'Overdue') {
          aC++;
          tAP += currentPrincipal;
          if (loan.status === 'Overdue') {
            tOD += currentPrincipal + unpaidInterest;
          }
        }
        tP += totalProfit;
      } catch (err) {
        console.error("Dashboard calculation failed for loan:", loan, err);
      }
    });
    
    return { totalActivePrincipal: tAP, totalProfit: tP, totalOverdue: tOD, activeCount: aC };
  }, [loans, payments]);

  // Dummy Chart Data
  const cashFlowData = [
    { name: 'Jan', in: 4000, out: 2400 },
    { name: 'Feb', in: 3000, out: 1398 },
    { name: 'Mar', in: 2000, out: 9800 },
    { name: 'Apr', in: 2780, out: 3908 },
    { name: 'May', in: 1890, out: 4800 },
    { name: 'Jun', in: 2390, out: 3800 },
  ];

  const portfolioData = [
    { name: 'Active', value: 400, color: '#10b981' },
    { name: 'Settled', value: 300, color: '#2563eb' },
    { name: 'Overdue', value: 100, color: '#f43f5e' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <PageHeader title="Financial Overview" subtitle="Welcome back! Here's your portfolio at a glance." />
        <div className="flex gap-3 mb-6">
          <Button icon={PlusCircle} onClick={() => navigate('/loans')}>New Loan</Button>
          <Button variant="ghost" icon={Wallet} onClick={() => navigate('/payments')}>Add Payment</Button>
          <Button variant="ghost" icon={Calculator} onClick={() => navigate('/calculator')}>Calc</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Principal" 
          value={formatCurrency(totalActivePrincipal)} 
          icon={Wallet} 
          trend={2.5} 
          color="blue" 
        />
        <StatCard 
          title="Total Profit Realized" 
          value={formatCurrency(totalProfit)} 
          icon={TrendingUp} 
          trend={12.4} 
          color="emerald" 
        />
        <StatCard 
          title="Overdue Receivables" 
          value={formatCurrency(totalOverdue)} 
          icon={AlertCircle} 
          trend={-1.2} 
          color="rose" 
        />
        <StatCard 
          title="Active Loans" 
          value={activeCount.toString()} 
          icon={ArrowUpRight} 
          color="gold" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <GlassCard className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Cash Flow (6 Months)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="in" name="Money In" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="out" name="Money Out" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-6">Portfolio Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="transparent"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <GlassCard>
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-400" /> 
              Upcoming Collections
           </h3>
           <div className="space-y-4">
             {loans.filter(l => l.status === 'Active').slice(0,3).map(loan => {
               const contact = contacts.find(c => c.id === loan.contactId);
               return (
                 <div key={loan.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer" onClick={() => navigate(`/loans/${loan.id}`)}>
                    <div>
                      <p className="font-semibold text-white">{contact?.name || 'Unknown'}</p>
                      <p className="text-sm text-white/50">Due date: {new Date(loan.collectionDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-amber-400">{formatCurrency(loan.principal * (loan.interestRate/100))}</p>
                       <p className="text-xs text-white/40">Expected Interest</p>
                    </div>
                 </div>
               )
             })}
           </div>
        </GlassCard>

        <GlassCard>
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-400" /> 
              Overdue Alerts
           </h3>
           <div className="space-y-4">
               {loans.filter(l => l.status === 'Overdue').length > 0 ? (
                 loans.filter(l => l.status === 'Overdue').slice(0,3).map(loan => {
                  const contact = contacts.find(c => c.id === loan.contactId);
                  return (
                    <div key={loan.id} className="flex justify-between items-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer" onClick={() => navigate(`/loans/${loan.id}`)}>
                       <div>
                         <p className="font-semibold text-white">{contact?.name || 'Unknown'}</p>
                         <p className="text-sm text-rose-400/80">Overdue by {Math.floor((new Date() - new Date(loan.collectionDate))/(1000*60*60*24))} days</p>
                       </div>
                       <StatusBadge status="Overdue" />
                    </div>
                  )
                 })
               ) : (
                 <div className="p-8 text-center border border-dashed border-white/20 rounded-xl">
                    <p className="text-white/60">No overdue items currently.</p>
                 </div>
               )}
           </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default Dashboard;
