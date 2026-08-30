import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Info, CheckCircle2, ChevronRight, HelpCircle, Layers, ShieldAlert, Cpu } from 'lucide-react';

interface MetricCard {
  label: string;
  value: string;
  subtext?: string;
  status?: 'normal' | 'highlight' | 'warning';
}

interface EvidenceMetadata {
  boardName: string;
  recordsAnalyzed: number;
  validRecordsCount: number;
  calculatedMetrics: Record<string, string | number>;
  lastRefreshedAt: string;
}

interface ClarificationOption {
  label: string;
  query: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text?: string;
  headline?: string;
  summaryText?: string;
  keyInsights?: string[];
  metricsCards?: MetricCard[];
  evidence?: EvidenceMetadata;
  dataQualityCaveats?: string[];
  suggestedFollowUps?: string[];
  isAmbiguous?: boolean;
  clarificationOptions?: ClarificationOption[];
  llmPowered?: boolean;
  errorFallbackMessage?: string;
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  "How's our pipeline looking for the energy sector this quarter?",
  "What is our total current pipeline value?",
  "Which sectors have the strongest pipeline?",
  "Which deals need attention?",
  "How are our work orders performing?",
  "Compare pipeline with operational workload.",
  "Prepare a leadership update."
];

export const ChatInterface: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      headline: 'Ask anything about your business',
      summaryText: 'Welcome to Skylark Intelligence. I query live Monday.com Deals and Work Orders boards to provide verified, founder-level business insights.',
      keyInsights: [
        'Deterministic calculations for all revenue, pipeline, and operational metrics',
        'Transparent Data Quality auditing and source evidence tracking',
        'Automatic ambiguity detection & executive clarification flows'
      ],
      suggestedFollowUps: SAMPLE_QUESTIONS.slice(0, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        headline: data.headline,
        summaryText: data.summaryText,
        keyInsights: data.keyInsights || [],
        metricsCards: data.metricsCards || [],
        evidence: data.evidence,
        dataQualityCaveats: data.dataQualityCaveats || [],
        suggestedFollowUps: data.suggestedFollowUps || [],
        isAmbiguous: data.isAmbiguous,
        clarificationOptions: data.clarificationOptions,
        llmPowered: data.llmPowered,
        errorFallbackMessage: data.errorFallbackMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        headline: 'Connection / Query Error',
        summaryText: 'Unable to reach the Skylark BI backend. Please check your Monday.com API connection or retry.',
        errorFallbackMessage: err.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-130px)]">
      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            {/* User Message Bubble */}
            {msg.sender === 'user' ? (
              <div className="max-w-2xl bg-sky-600 text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-md text-sm font-medium">
                {msg.text}
              </div>
            ) : (
              /* Agent Message Card */
              <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
                {/* Agent Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Skylark BI Agent
                    </span>
                  </div>
                  
                  {/* Mode / LLM Badge */}
                  <div className="flex items-center space-x-2">
                    {msg.llmPowered ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 flex items-center space-x-1">
                        <Cpu className="w-3 h-3 text-indigo-400" />
                        <span>LLM Enhanced</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-sky-950 text-sky-300 border border-sky-700/50 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-400" />
                        <span>100% Deterministic Math</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Fallback Banner if LLM unconfigured/failed */}
                {msg.errorFallbackMessage && (
                  <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-xs text-sky-300 flex items-center space-x-2">
                    <Info className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{msg.errorFallbackMessage}</span>
                  </div>
                )}

                {/* Headline */}
                {msg.headline && (
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                    <span>{msg.headline}</span>
                  </h3>
                )}

                {/* Summary Text */}
                {msg.summaryText && (
                  <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {msg.summaryText}
                  </p>
                )}

                {/* Ambiguous Clarification Card */}
                {msg.isAmbiguous && msg.clarificationOptions && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Select a specific perspective to continue:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.clarificationOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(opt.query)}
                          className="p-3 text-left rounded-lg bg-slate-800/90 hover:bg-slate-750 text-xs text-slate-200 border border-slate-700/60 hover:border-sky-500/50 transition flex items-center justify-between group"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantitative Metrics Cards */}
                {msg.metricsCards && msg.metricsCards.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {msg.metricsCards.map((card, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                          card.status === 'highlight'
                            ? 'bg-sky-950/40 border-sky-700/50 text-sky-200'
                            : card.status === 'warning'
                            ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
                        }`}
                      >
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          {card.label}
                        </span>
                        <div className="text-lg sm:text-xl font-bold font-mono tracking-tight mt-1 text-white">
                          {card.value}
                        </div>
                        {card.subtext && (
                          <span className="text-[10px] text-slate-400 mt-1">{card.subtext}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Insights List */}
                {msg.keyInsights && msg.keyInsights.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Key Highlights
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {msg.keyInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Data Quality Caveats */}
                {msg.dataQualityCaveats && msg.dataQualityCaveats.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Data Quality Notes</span>
                    </div>
                    {msg.dataQualityCaveats.map((cav, idx) => (
                      <p key={idx} className="text-[11px] text-slate-400 leading-normal">
                        • {cav}
                      </p>
                    ))}
                  </div>
                )}

                {/* Source & Evidence Section (Rule #10) */}
                {msg.evidence && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-400">Board:</span>
                        <strong className="text-slate-300">{msg.evidence.boardName}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Records: <strong className="text-slate-300">{msg.evidence.validRecordsCount}/{msg.evidence.recordsAnalyzed}</strong>
                      </span>
                    </div>
                    <div className="font-mono text-slate-500">
                      Calculated at {msg.evidence.lastRefreshedAt ? new Date(msg.evidence.lastRefreshedAt).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(fu)}
                        className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-[11px] text-sky-400 border border-slate-700/60 transition"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-sky-400 text-xs font-medium p-4 bg-slate-900/60 rounded-xl border border-slate-800 max-w-sm">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing Monday.com board data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Clickable Founder Sample Questions Bar */}
      <div className="py-2 overflow-x-auto flex space-x-2 shrink-0">
        {SAMPLE_QUESTIONS.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs whitespace-nowrap transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="relative shrink-0 mt-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about pipeline, revenue, deals, or work orders..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition disabled:opacity-40 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
