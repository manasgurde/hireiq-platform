'use client'

import { useState, useEffect } from 'react'
import { Brain, Cpu, Database, Play, CheckCircle2, AlertCircle, RefreshCw, Loader2, GitBranch } from 'lucide-react'
import axios from 'axios'

export default function MLOpsDashboard() {
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [lastTrained, setLastTrained] = useState('2 days ago')
  const [metrics, setMetrics] = useState({
    accuracy: 0.94,
    f1_score: 0.92,
    latency_ms: 45
  })

  // Simulated fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleRetrain = async () => {
    if (!confirm('Are you sure you want to trigger a model retraining pipeline? This may take several hours and consume significant compute resources.')) return
    
    setRetraining(true)
    try {
      // In a real app this hits POST /admin/ml-ops/retrain
      await new Promise(r => setTimeout(r, 2000))
      alert('Pipeline triggered successfully via MLflow/Airflow.')
    } catch (e) {
      console.error(e)
      alert('Failed to trigger pipeline.')
    } finally {
      setRetraining(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-emerald-500" />
              ML Operations
            </h1>
            <p className="text-slate-400">Manage AI models, feature stores, and MLflow pipelines.</p>
          </div>
          <button 
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {retraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Trigger Retraining
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Model Status</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">Healthy</div>
            <p className="text-sm text-slate-400">Serving traffic on v2.4.1</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <Cpu className="w-5 h-5" />
              <span className="font-semibold">Inference Latency</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{metrics.latency_ms} ms</div>
            <p className="text-sm text-slate-400">Average over last 24h</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <GitBranch className="w-5 h-5" />
              <span className="font-semibold">Last Trained</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{lastTrained}</div>
            <p className="text-sm text-slate-400">Using 1.2M training samples</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Model */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-6">Active Model Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Architecture</div>
                  <div className="font-semibold text-slate-200">SentenceTransformer (all-MiniLM-L6-v2)</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Dimensions</div>
                  <div className="font-semibold text-slate-200">384</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Framework</div>
                  <div className="font-semibold text-slate-200">PyTorch</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm text-slate-500 mb-1">F1 Score (Validation)</div>
                  <div className="font-semibold text-emerald-400">{(metrics.f1_score * 100).toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Accuracy</div>
                  <div className="font-semibold text-emerald-400">{(metrics.accuracy * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Store */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Feature Store Integration
              </h2>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full">
                Connected
              </span>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The embedding models are connected to the pgvector extension in PostgreSQL. Profiles and Jobs are automatically tokenized and vectorized upon creation or update.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                <span className="text-sm text-slate-300">Profiles Vectorized</span>
                <span className="text-sm font-medium text-white">45,201</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                <span className="text-sm text-slate-300">Jobs Vectorized</span>
                <span className="text-sm font-medium text-white">8,942</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-300">Sync Status</span>
                <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Real-time
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
