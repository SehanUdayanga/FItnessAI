import React from 'react';

const StatCard = ({ title, value, unit, subtitle, icon: Icon, color = 'green', trend }) => {
  const colorStyles = {
    green: {
      bg: 'bg-green-100',
      iconColor: 'text-green-700',
    },
    blue: {
      bg: 'bg-sky-100',
      iconColor: 'text-sky-700',
    },
    orange: {
      bg: 'bg-amber-100',
      iconColor: 'text-amber-700',
    },
    purple: {
      bg: 'bg-purple-100',
      iconColor: 'text-purple-700',
    }
  };

  const style = colorStyles[color] || colorStyles.green;

  return (
    <div className="p-5 rounded-[16px] bg-white border border-line shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-[10px] ${style.bg} ${style.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 mb-1">
        <span className="font-mono text-2xl font-bold text-navy-900 tracking-tight">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {subtitle && (
        <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
          <span>{subtitle}</span>
          {trend !== undefined && (
            <span className={`font-mono font-semibold ${trend < 0 ? 'text-green-700' : trend > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
              ({trend > 0 ? `+${trend}` : trend} kg)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

