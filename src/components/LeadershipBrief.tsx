import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';

export const LeadershipBrief: React.FC = () => {
  const [briefData, setBriefData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchBrief = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leadership-brief');
      if (res.ok) {
        const data = await res.json();
        setBriefData(data);
      }
    } catch (err) {
      console.error('Failed to load leadership brief:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, []);

  const handleCopy = () => {
    if (!briefData) return;
    const textToCopy = `
SKYLARK DRONES - EXECUTIVE LEADERSHIP BRIEF
Generated: ${new Date().toLocaleString()}

${briefData.headline}

SUMMARY:
${briefData.summaryText}

KEY HIGHLIGHTS:
${briefData.keyInsights?.map((k: string) => `• ${k}`).join('\n')}

DATA QUALITY & RISKS:
${briefData.dataQualityCaveats?.map((c: string) => `• ${c}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Executive Leadership Brief</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-sky-950 text-sky-400 border border-sky-800/50">
              Data Grounded
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated founder-level synthesis of sales pipeline, operations, and data quality caveats.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBrief}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Brief</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!briefData || isLoading}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-md shadow-sky-600/20 flex items-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Brief'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Synthesizing leadership metrics from connected boards...</p>
        </div>
      ) : briefData ? (
        <div className="space-y-6">
          {/* Executive Metrics Overview Grid */}
          {briefData.metricsCards && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {briefData.metricsCards.map((card: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{card.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Core Brief Content Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Executive Summary</span>
            </div>
            
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-line border-l-2 border-sky-500 pl-4 py-1">
              {briefData.summaryText}
            </p>

            {/* Key Signals & Highlights */}
            {briefData.keyInsights && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Signals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {briefData.keyInsights.map((insight: string, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 text-xs text-slate-300 flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-normal">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Quality & Risk Disclaimer */}
            {briefData.dataQualityCaveats && briefData.dataQualityCaveats.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Data Quality Considerations for Leadership</span>
                </div>
                <ul className="space-y-1 text-slate-400 pl-6 list-disc">
                  {briefData.dataQualityCaveats.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Timestamp */}
            {briefData.evidence && (
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                <span>Board: <strong>{briefData.evidence.boardName}</strong></span>
                <span>Refreshed: <strong>{new Date(briefData.evidence.lastRefreshedAt).toLocaleTimeString()}</strong></span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
