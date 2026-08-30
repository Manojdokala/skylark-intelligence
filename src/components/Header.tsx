import React from 'react';
import { RefreshCw, Database, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  status: {
    mode: 'MONDAY_CONNECTED' | 'DEMO_FIXTURE' | 'ERROR';
    isMondayConnected: boolean;
    lastRefreshedAt: string;
    dealsRecordCount: number;
    workOrdersRecordCount: number;
  } | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, onRefresh, isRefreshing }) => {
  const formatTimestamp = (isoStr?: string) => {
    if (!isoStr) return 'Not available';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  const isConnected = status?.isMondayConnected;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Skylark Intelligence
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-sky-400 border border-sky-500/20">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Founder-level business intelligence from Monday.com
            </p>
          </div>
        </div>

        {/* Status & Last Refreshed Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Connection Mode Badge */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 border ${
            isConnected
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
              : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
          }`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monday.com Connected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo/Fixture Mode</span>
              </>
            )}
          </div>

          {/* Last Refreshed Indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span className="text-slate-400">Last refreshed:</span>
            <span className="font-mono font-medium text-slate-200">{formatTimestamp(status?.lastRefreshedAt)}</span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-medium transition flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-sky-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
