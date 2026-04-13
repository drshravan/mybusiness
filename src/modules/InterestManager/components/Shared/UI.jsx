import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', noPadding = false, onClick, ...props }) => {
  return (
    <div 
      className={`glass-card ${noPadding ? '' : 'p-6'} ${className} ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const AnimatedGlassCard = ({ children, className = '', index = 0, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: delay || index * 0.08 }}
      className={`glass-card p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/50',
    gold: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/50',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/50',
  };

  const gradientMap = {
    blue: 'from-blue-500/20 to-transparent',
    emerald: 'from-emerald-500/20 to-transparent',
    rose: 'from-rose-500/20 to-transparent',
    gold: 'from-amber-500/20 to-transparent',
    violet: 'from-violet-500/20 to-transparent',
  };

  return (
    <AnimatedGlassCard className={`group relative !p-0 border ${colorMap[color].split(' ')[2]}`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientMap[color]} blur-2xl opacity-50 transition-opacity group-hover:opacity-100 rounded-full mix-blend-screen pointer-events-none`} />
      
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2.5 rounded-xl border ${colorMap[color].split(' ').slice(0,3).join(' ')} shadow-lg`}>
            {Icon && <Icon size={22} />}
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-white/60 text-sm font-medium mt-4">{title}</p>
        <h3 className="tabular-nums text-3xl font-extrabold text-white tracking-tight mt-1 truncate">{value}</h3>
        {trendLabel && <p className="text-xs text-white/40 mt-1">{trendLabel}</p>}
      </div>
    </AnimatedGlassCard>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    Overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    Closed: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    Settled: 'bg-white/5 text-white/70 border-white/10',
  };

  const currentStyle = styles[status] || styles.Settled;

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border ${currentStyle} transition-all`}>
      {status}
    </span>
  );
};

export const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const base = "im-btn relative overflow-hidden";
  const variants = {
    primary: "im-btn-primary shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:bg-[#1d4ed8]",
    ghost: "im-btn-ghost backdrop-blur-md bg-white/5 hover:bg-white/10",
    danger: "bg-rose-600/90 text-white hover:bg-rose-500 border border-rose-500/50 shadow-[0_4px_14px_0_rgba(244,63,94,0.39)]",
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} className={variant === 'ghost' ? 'text-blue-400' : ''} />}
      {children && <span>{children}</span>}
    </button>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 mt-2">
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight im-title">{title}</h1>
      {subtitle && <p className="text-white/60 text-base md:text-lg max-w-2xl">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
