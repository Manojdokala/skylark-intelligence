import React from 'react';
import { MessageSquare, FileText, ShieldAlert, Plug } from 'lucide-react';

export type TabType = 'intelligence' | 'brief' | 'quality' | 'connection';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'intelligence' as TabType, label: 'Intelligence Agent', icon: MessageSquare },
    { id: 'brief' as TabType, label: 'Leadership Brief', icon: FileText },
    { id: 'quality' as TabType, label: 'Data Quality Audit', icon: ShieldAlert },
    { id: 'connection' as TabType, label: 'Monday Connection', icon: Plug },
  ];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
