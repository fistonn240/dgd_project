/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  CloudSun, 
  TrendingUp, 
  Camera, 
  MessageSquare, 
  Menu, 
  X, 
  ChevronRight,
  Droplets,
  Thermometer,
  Wind,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { agriAI } from './services/geminiService';
import { cn } from './lib/utils';

// Mock data for market prices
const marketData = [
  { month: 'Jan', maize: 450, cassava: 320, cocoa: 2100 },
  { month: 'Feb', maize: 470, cassava: 310, cocoa: 2150 },
  { month: 'Mar', maize: 460, cassava: 330, cocoa: 2200 },
  { month: 'Apr', maize: 480, cassava: 350, cocoa: 2180 },
  { month: 'May', maize: 500, cassava: 340, cocoa: 2250 },
  { month: 'Jun', maize: 520, cassava: 360, cocoa: 2300 },
];

const weatherData = [
  { time: '06:00', temp: 22, rain: 10 },
  { time: '09:00', temp: 26, rain: 5 },
  { time: '12:00', temp: 31, rain: 0 },
  { time: '15:00', temp: 33, rain: 15 },
  { time: '18:00', temp: 28, rain: 40 },
  { time: '21:00', temp: 24, rain: 20 },
];

type Tab = 'dashboard' | 'diagnosis' | 'market' | 'advisor';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDiagnosing(true);
    setDiagnosisResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await agriAI.diagnoseCrop(base64);
        setDiagnosisResult(result);
      } catch (error) {
        console.error('Diagnosis failed:', error);
        setDiagnosisResult('### Error\nFailed to analyze image. Please try again.');
      } finally {
        setIsDiagnosing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await agriAI.getFarmingAdvice(userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      console.error('Chat failed:', error);
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden agri-gradient text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-agri-sun" />
          <h1 className="font-bold text-xl tracking-tight">AgriSmart</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <nav className={cn(
        "fixed inset-0 z-40 md:relative md:flex md:w-64 flex-col bg-white border-r border-stone-200 transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="hidden md:flex items-center gap-3 p-8">
          <div className="p-2 bg-agri-green rounded-xl">
            <Sprout className="w-8 h-8 text-agri-sun" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-agri-green leading-none">AgriSmart</h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Africa Edition</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
            icon={<CloudSun className="w-5 h-5" />}
            label="Dashboard"
          />
          <NavButton 
            active={activeTab === 'diagnosis'} 
            onClick={() => { setActiveTab('diagnosis'); setIsMenuOpen(false); }}
            icon={<Camera className="w-5 h-5" />}
            label="Crop Diagnosis"
          />
          <NavButton 
            active={activeTab === 'market'} 
            onClick={() => { setActiveTab('market'); setIsMenuOpen(false); }}
            icon={<TrendingUp className="w-5 h-5" />}
            label="Market Prices"
          />
          <NavButton 
            active={activeTab === 'advisor'} 
            onClick={() => { setActiveTab('advisor'); setIsMenuOpen(false); }}
            icon={<MessageSquare className="w-5 h-5" />}
            label="AI Advisor"
          />
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-agri-green" />
              <span className="text-xs font-bold text-stone-500 uppercase">Location</span>
            </div>
            <p className="text-sm font-medium">Nairobi, Kenya</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900">Jambo, Farmer!</h2>
                  <p className="text-stone-500">Here's what's happening on your farm today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-stone-600">Sensors Online</span>
                </div>
              </header>

              {/* Weather & Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card rounded-3xl p-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Weather Forecast</p>
                        <h3 className="text-4xl font-bold mt-1">28°C</h3>
                        <p className="text-stone-500 flex items-center gap-1 mt-1">
                          <CloudSun className="w-4 h-4" /> Partly Cloudy
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-400 uppercase">Rain Probability</p>
                        <p className="text-2xl font-bold text-agri-sky">15%</p>
                      </div>
                    </div>
                    
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weatherData}>
                          <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip />
                          <Area type="monotone" dataKey="temp" stroke="#FB923C" fillOpacity={1} fill="url(#colorTemp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <StatCard 
                    icon={<Droplets className="text-blue-500" />} 
                    label="Soil Moisture" 
                    value="42%" 
                    trend="+2% from yesterday"
                    color="blue"
                  />
                  <StatCard 
                    icon={<Thermometer className="text-red-500" />} 
                    label="Soil Temp" 
                    value="24.5°C" 
                    trend="Optimal range"
                    color="red"
                  />
                  <StatCard 
                    icon={<Wind className="text-stone-500" />} 
                    label="Humidity" 
                    value="68%" 
                    trend="High - Watch for fungi"
                    color="stone"
                  />
                </div>
              </div>

              {/* Alerts & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Critical Alerts
                  </h4>
                  <div className="space-y-4">
                    <AlertItem 
                      type="warning" 
                      title="Locust Swarm Warning" 
                      desc="Swarm detected 50km North. Prepare protection." 
                    />
                    <AlertItem 
                      type="info" 
                      title="Market Opportunity" 
                      desc="Maize prices up 12% in local market." 
                    />
                  </div>
                </div>

                <div className="bg-agri-green rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Diagnostic Quick-Scan</h4>
                    <p className="text-agri-sun/80 text-sm mb-6">Spotted something unusual on your leaves? Use our AI to diagnose it instantly.</p>
                    <button 
                      onClick={() => setActiveTab('diagnosis')}
                      className="bg-white text-agri-green px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-agri-sun transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      Start Scanning
                    </button>
                  </div>
                  <Sprout className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10 rotate-12" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'diagnosis' && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-stone-900 mb-4 italic serif">Crop Doctor AI</h2>
                <p className="text-stone-500 max-w-lg mx-auto">Upload a clear photo of your plant's leaves or stems to identify pests and diseases.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-[40px] border-4 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-agri-green hover:bg-agri-green/5 transition-all group"
                  >
                    <div className="p-6 bg-stone-50 rounded-full group-hover:bg-agri-green group-hover:text-white transition-colors">
                      <Camera className="w-12 h-12" />
                    </div>
                    <p className="mt-4 font-bold text-stone-600 group-hover:text-agri-green">Click to Take Photo or Upload</p>
                    <p className="text-xs text-stone-400 mt-1">Supports JPG, PNG (Max 10MB)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
                    <h5 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Pro Tip
                    </h5>
                    <p className="text-sm text-amber-700">Ensure the plant is well-lit and the focus is sharp on the affected area for the most accurate diagnosis.</p>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] border border-stone-200 shadow-xl p-8 min-h-[400px] flex flex-col">
                  {isDiagnosing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-agri-green border-t-transparent rounded-full animate-spin" />
                      <p className="font-bold text-stone-600">Analyzing with AI...</p>
                    </div>
                  ) : diagnosisResult ? (
                    <div className="prose prose-stone max-w-none">
                      <ReactMarkdown>{diagnosisResult}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <Search className="w-16 h-16" />
                      <p className="font-medium">Diagnosis results will appear here after analysis.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'market' && (
            <motion.div 
              key="market"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold text-stone-900">Market Intelligence</h2>
                <p className="text-stone-500">Real-time commodity prices across East African markets.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-xl">Price Trends (KES/kg)</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-agri-green" />
                        <span className="text-xs font-bold text-stone-500 uppercase">Maize</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-stone-500 uppercase">Cocoa</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="maize" stroke="#2D5A27" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cocoa" stroke="#F59E0B" strokeWidth={3} dot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xl mb-4">Top Commodities</h3>
                  <MarketItem name="White Maize" price="45.00" change="+2.4%" trend="up" />
                  <MarketItem name="Cassava Flour" price="32.50" change="-1.2%" trend="down" />
                  <MarketItem name="Arabica Coffee" price="185.00" change="+5.7%" trend="up" />
                  <MarketItem name="Raw Cocoa" price="210.00" change="0.0%" trend="stable" />
                  <MarketItem name="Sorghum" price="28.00" change="+0.8%" trend="up" />
                  
                  <div className="mt-8 p-6 bg-stone-900 text-white rounded-3xl">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Market Insight</p>
                    <p className="text-sm leading-relaxed">Coffee prices are expected to rise due to supply constraints in the Rift Valley. Consider holding stock for 2 more weeks.</p>
                    <button className="mt-4 text-agri-sun font-bold flex items-center gap-1 text-sm">
                      Read Full Report <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'advisor' && (
            <motion.div 
              key="advisor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-6 pb-8 scrollbar-hide">
                {chatHistory.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <div className="w-20 h-20 bg-agri-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-agri-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">Ask AgriSmart AI</h3>
                    <p className="text-stone-500 mt-2">Get expert advice on planting, irrigation, and pest control.</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                      <button onClick={() => setChatInput("How can I improve maize yield in dry soil?")} className="p-4 bg-white border border-stone-200 rounded-2xl text-sm font-medium hover:border-agri-green transition-colors">
                        "How can I improve maize yield in dry soil?"
                      </button>
                      <button onClick={() => setChatInput("Best organic fertilizer for cassava?")} className="p-4 bg-white border border-stone-200 rounded-2xl text-sm font-medium hover:border-agri-green transition-colors">
                        "Best organic fertilizer for cassava?"
                      </button>
                    </div>
                  </div>
                )}
                
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-4 rounded-3xl",
                      msg.role === 'user' 
                        ? "bg-agri-green text-white rounded-tr-none" 
                        : "bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm"
                    )}>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase mt-2 px-2">
                      {msg.role === 'user' ? 'You' : 'AgriSmart AI'}
                    </span>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-white border border-stone-200 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-2">
                      <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="mt-auto relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about farming..."
                  className="w-full bg-white border border-stone-200 rounded-[32px] py-6 px-8 pr-20 shadow-xl focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                />
                <button 
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-agri-green text-white p-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-agri-green/90 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
        active 
          ? "bg-agri-green text-white shadow-lg shadow-agri-green/20" 
          : "text-stone-500 hover:bg-stone-50 hover:text-agri-green"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-agri-sun" />}
    </button>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center gap-4">
      <div className={cn("p-4 rounded-2xl", `bg-${color}-50`)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        <p className="text-[10px] font-medium text-stone-500 mt-0.5">{trend}</p>
      </div>
    </div>
  );
}

function AlertItem({ type, title, desc }: { type: 'warning' | 'info', title: string, desc: string }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border flex gap-4",
      type === 'warning' ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        type === 'warning' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
      )}>
        {type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
      </div>
      <div>
        <h5 className="font-bold text-sm text-stone-900">{title}</h5>
        <p className="text-xs text-stone-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function MarketItem({ name, price, change, trend }: { name: string, price: string, change: string, trend: 'up' | 'down' | 'stable' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center">
          <Sprout className="w-5 h-5 text-agri-green" />
        </div>
        <div>
          <p className="font-bold text-stone-800">{name}</p>
          <p className="text-xs text-stone-400">East Africa Average</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-stone-900">KES {price}</p>
        <p className={cn(
          "text-xs font-bold",
          trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-stone-400"
        )}>
          {change}
        </p>
      </div>
    </div>
  );
}
