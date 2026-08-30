import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { ChatInterface } from './components/ChatInterface';
import { LeadershipBrief } from './components/LeadershipBrief';
import { DataQualityView } from './components/DataQualityView';
import { ConnectionView } from './components/ConnectionView';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('intelligence');
  const [status, setStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/monday/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/monday/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Header */}
      <Header status={status} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* Main Tab Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Active Tab Content View */}
      <main className="flex-1">
        {activeTab === 'intelligence' && <ChatInterface />}
        {activeTab === 'brief' && <LeadershipBrief />}
        {activeTab === 'quality' && <DataQualityView />}
        {activeTab === 'connection' && (
          <ConnectionView status={status} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-500 shrink-0">
        <span>Skylark Intelligence MVP • Monday.com Business Intelligence Agent</span>
      </footer>
    </div>
  );
}

export default App;
