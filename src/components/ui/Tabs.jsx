import React from 'react';

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = ''
}) {
  const variants = {
    default: {
      container: 'flex gap-2 p-1.5 bg-gray-100 rounded-xl inline-flex',
      tab: 'px-4 py-2 rounded-lg text-sm font-medium transition-all',
      active: 'bg-white text-gray-800 shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
    },
    temperament: {
      container: 'flex gap-2 p-1.5 bg-blue-50 rounded-xl inline-flex',
      tab: 'px-4 py-2 rounded-lg text-sm font-medium transition-all',
      active: 'bg-blue-500 text-white shadow-md shadow-blue-500/25',
      inactive: 'text-blue-600 hover:bg-blue-100'
    },
    character: {
      container: 'flex gap-2 p-1.5 bg-emerald-50 rounded-xl inline-flex',
      tab: 'px-4 py-2 rounded-lg text-sm font-medium transition-all',
      active: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
      inactive: 'text-emerald-600 hover:bg-emerald-100'
    },
    pills: {
      container: 'flex gap-3',
      tab: 'px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
      active: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25',
      inactive: 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div className={`${style.container} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`${style.tab} ${activeTab === tab.key ? style.active : style.inactive}`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
