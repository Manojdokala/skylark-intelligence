import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Database, Layers } from 'lucide-react';

export const DataQualityView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data-quality')
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load DQ report:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-400 space-y-3">
        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm">Auditing dataset completeness and normalization rules...</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Board Data Quality & Normalization Audit</h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-sky-950 text-sky-400 border border-sky-800/50">
            First-Class Feature
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Complete transparency into missing values, date resolution, and clean analytical baselines.
        </p>
      </div>

      {/* Board Health Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deals Board Health */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Deals Board Health</h3>
            </div>
            <span className="text-2xl font-extrabold font-mono text-sky-400">
              {report.dealsCompletenessPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${report.dealsCompletenessPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
              <span className="text-[10px] text-slate-400 uppercase">Total Records</span>
              <div className="text-base font-bold text-white">{report.dealsTotal}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
              <span className="text-[10px] text-slate-400 uppercase">Missing Values</span>
              <div className="text-base font-bold text-amber-400">{report.dealsMissingValueCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
              <span className="text-[10px] text-slate-400 uppercase">Missing Dates</span>
              <div className="text-base font-bold text-amber-400">{report.dealsMissingCloseDateCount}</div>
            </div>
          </div>
        </div>

        {/* Work Orders Board Health */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Work Orders Board Health</h3>
            </div>
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {report.workOrdersCompletenessPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${report.workOrdersCompletenessPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
              <span className="text-[10px] text-slate-400 uppercase">Total Work Orders</span>
              <div className="text-base font-bold text-white">{report.workOrdersTotal}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
              <span className="text-[10px] text-slate-400 uppercase">Missing Contract Amounts</span>
              <div className="text-base font-bold text-amber-400">{report.workOrdersMissingAmountCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Data Normalization Rules */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span>Active Data Normalization Layer Rules</span>
        </h3>
        <div className="space-y-2.5">
          {report.appliedRules?.map((rule: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-xs text-slate-300 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Data Caveats */}
      {report.caveats && report.caveats.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-amber-300 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Identified Data Caveats</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 pl-6 list-disc">
            {report.caveats.map((c: string, idx: number) => (
              <li key={idx} className="text-slate-300">{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
