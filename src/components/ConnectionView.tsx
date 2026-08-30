import React from 'react';
import { Plug, CheckCircle, AlertTriangle, RefreshCw, Server, ShieldCheck, Database, Key } from 'lucide-react';

interface ConnectionViewProps {
  status: {
    mode: 'MONDAY_CONNECTED' | 'DEMO_FIXTURE' | 'ERROR';
    isMondayConnected: boolean;
    dealsBoardName: string;
    workOrdersBoardName: string;
    dealsRecordCount: number;
    workOrdersRecordCount: number;
    lastRefreshedAt: string;
    errorMessage?: string;
  } | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ConnectionView: React.FC<ConnectionViewProps> = ({ status, onRefresh, isRefreshing }) => {
  const isConnected = status?.isMondayConnected;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Monday.com Connection Status</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor GraphQL API integration state, board names, record counts, and last synchronization timestamp.
        </p>
      </div>

      {/* Main Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Plug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Integration Mode</h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                  isConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isConnected ? 'MONDAY.COM CONNECTED' : 'DEMO / FIXTURE MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isConnected
                  ? 'Real-time GraphQL API active via server environment credentials.'
                  : 'Operating via isolated local Excel data fixtures. Monday credentials unconfigured.'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-md flex items-center space-x-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Testing Connection...' : 'Test & Sync Connection'}</span>
          </button>
        </div>

        {/* Board Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase">
              <Database className="w-4 h-4" />
              <span>Deals Board</span>
            </div>
            <div className="text-base font-bold text-white">{status?.dealsBoardName || 'N/A'}</div>
            <div className="text-xs text-slate-400">
              Loaded Records: <strong className="text-slate-200">{status?.dealsRecordCount || 0}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase">
              <Server className="w-4 h-4" />
              <span>Work Orders Board</span>
            </div>
            <div className="text-base font-bold text-white">{status?.workOrdersBoardName || 'N/A'}</div>
            <div className="text-xs text-slate-400">
              Loaded Records: <strong className="text-slate-200">{status?.workOrdersRecordCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Error Details if any */}
        {status?.errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-1">
            <div className="font-semibold flex items-center space-x-1.5 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Connection Error Notice</span>
            </div>
            <p className="text-slate-300">{status.errorMessage}</p>
          </div>
        )}

        {/* Refresh Timestamp */}
        <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
          <span>Last synchronized:</span>
          <span className="font-mono font-medium text-slate-200">
            {status?.lastRefreshedAt ? new Date(status.lastRefreshedAt).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Security & Setup Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span>Server Security & Configuration Setup</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          For security best practices, API credentials are strictly configured via server environment variables (`.env`) on the backend server.
          The frontend bundle never contains or exposes your API tokens.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-sky-300 space-y-1.5">
          <div className="text-slate-500 font-sans font-medium text-[11px] mb-1"># Required .env variables:</div>
          <div>MONDAY_API_TOKEN=your_monday_personal_access_token</div>
          <div>MONDAY_DEALS_BOARD_ID=1234567890</div>
          <div>MONDAY_WORK_ORDERS_BOARD_ID=0987654321</div>
          <div>GEMINI_API_KEY=optional_gemini_key</div>
        </div>
      </div>
    </div>
  );
};
