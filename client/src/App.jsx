import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  MessageCircle,
  Wand2,
  BookOpen,
  Menu,
  X,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { api } from './utils/api.js';
import Dashboard from './pages/Dashboard.jsx';
import Summarizer from './pages/Summarizer.jsx';
import QuizGenerator from './pages/QuizGenerator.jsx';
import StudyChat from './pages/StudyChat.jsx';
import PromptAssistant from './pages/PromptAssistant.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'summarizer', label: 'Notes Summarizer', icon: FileText },
  { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle },
  { id: 'chat', label: 'Study Chat', icon: MessageCircle },
  { id: 'prompt', label: 'Prompt Assistant', icon: Wand2 },
];

const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Welcome to your AI Study Buddy' },
  summarizer: { title: 'Notes Summarizer', subtitle: 'Transform your notes into clear summaries' },
  quiz: { title: 'Quiz Generator', subtitle: 'Test your knowledge with AI-generated quizzes' },
  chat: { title: 'Study Chat', subtitle: 'Ask questions and get instant explanations' },
  prompt: { title: 'Prompt Assistant', subtitle: 'Craft better prompts for AI tools' },
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(null); // null = loading

  useEffect(() => {
    api.health()
      .then((data) => setDemoMode(data.demoMode))
      .catch(() => setDemoMode(true));
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  return (
    <div className="app-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-logo"
            onClick={() => navigate('dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            <div className="sidebar-logo-icon">
              <BookOpen size={20} />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">GenAI Study Buddy</span>
              <span className="sidebar-logo-subtitle">AI-Powered Learning</span>
            </div>
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navigation</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <Icon className="nav-icon" size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {demoMode === null ? null : demoMode ? (
            <div className="demo-badge">
              <AlertTriangle size={14} />
              <div>
                <div style={{ fontWeight: 700 }}>Demo Mode</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>No API key configured</div>
              </div>
            </div>
          ) : (
            <div className="demo-badge live-badge">
              <Zap size={14} />
              <div>
                <div style={{ fontWeight: 700 }}>Live Mode</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>Gemini API active</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Page Header */}
        <header className="page-header">
          <div className="page-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="page-title">{meta.title}</h1>
              <p className="page-subtitle">{meta.subtitle}</p>
            </div>
          </div>

          {demoMode !== null && (
            <span className={`chip ${demoMode ? 'chip-demo' : 'chip-live'}`}>
              {demoMode ? (
                <><AlertTriangle size={10} /> Demo</>
              ) : (
                <><Zap size={10} /> Live</>
              )}
            </span>
          )}
        </header>

        {/* Page Content */}
        <div className="page-content">
          {activePage === 'dashboard' && (
            <Dashboard demoMode={demoMode} onNavigate={navigate} />
          )}
          {activePage === 'summarizer' && <Summarizer demoMode={demoMode} />}
          {activePage === 'quiz' && <QuizGenerator demoMode={demoMode} />}
          {activePage === 'chat' && <StudyChat demoMode={demoMode} />}
          {activePage === 'prompt' && <PromptAssistant demoMode={demoMode} />}
        </div>
      </main>
    </div>
  );
}
