import { FileText, HelpCircle, MessageCircle, Wand2, ArrowRight, BookOpen, Sparkles, Zap, AlertTriangle, BookMarked, GraduationCap } from 'lucide-react';
import { DemoNotice, LiveNotice } from '../components/SharedComponents.jsx';

const FEATURES = [
  {
    id: 'summarizer',
    icon: FileText,
    color: '#6366f1',
    bgColor: '#eef2ff',
    title: 'Notes Summarizer',
    desc: 'Paste your study notes and get concise summaries, bullet points, or key concept lists in seconds.',
    badge: 'Most Popular',
  },
  {
    id: 'quiz',
    icon: HelpCircle,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    title: 'Quiz Generator',
    desc: 'Generate interactive multiple-choice quizzes from any study material to test your understanding.',
    badge: 'Interactive',
  },
  {
    id: 'chat',
    icon: MessageCircle,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    title: 'Study Chat',
    desc: 'Chat with an AI tutor to get instant explanations for complex topics and study questions.',
    badge: 'Real-time',
  },
  {
    id: 'prompt',
    icon: Wand2,
    color: '#10b981',
    bgColor: '#ecfdf5',
    title: 'Prompt Assistant',
    desc: 'Transform basic prompts into powerful, structured queries that get better AI responses.',
    badge: 'Pro Tip',
  },
];

const STATS = [
  { value: '4', label: 'AI Features' },
  { value: '∞', label: 'Study Sessions' },
  { value: '4', label: 'Quiz Modes' },
  { value: '100%', label: 'Free to Use' },
];

const TIPS = [
  { icon: BookMarked, text: 'Paste lecture notes into the Summarizer to get a quick recap before exams.' },
  { icon: HelpCircle, text: 'Use Quiz Generator on hard topics — testing yourself is the #1 study technique.' },
  { icon: GraduationCap, text: 'Ask the Study Chat to explain concepts "like I\'m 10" for better intuition.' },
  { icon: Wand2, text: 'Use Prompt Assistant before querying any AI tool for better, more useful answers.' },
];

export default function Dashboard({ demoMode, onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-tag">
          <Sparkles size={12} />
          Powered by Google Gemini AI
        </div>
        <h2 className="hero-title">Your Personal AI Study Assistant</h2>
        <p className="hero-subtitle">
          Summarize notes, generate quizzes, get instant explanations, and craft better prompts —
          all in one beautifully designed study companion.
        </p>
        <div className="hero-actions">
          <button className="btn-hero" onClick={() => onNavigate('summarizer')}>
            <BookOpen size={16} />
            Start Studying
          </button>
          <button className="btn-hero btn-hero-outline" onClick={() => onNavigate('quiz')}>
            Take a Quiz
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Demo/Live Notice */}
      {demoMode !== null && (demoMode ? <DemoNotice /> : <LiveNotice />)}

      {/* Stats */}
      <div className="stats-bar">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <h2 className="section-title">
        <Zap size={18} color="var(--color-primary)" />
        AI-Powered Features
      </h2>
      <div className="features-grid">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.id} className="feature-card" onClick={() => onNavigate(f.id)} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(f.id)}>
              <div className="feature-card-icon" style={{ background: f.bgColor, color: f.color }}>
                <Icon size={22} />
              </div>
              <div className="feature-card-title">{f.title}</div>
              <div className="feature-card-desc">{f.desc}</div>
              <div className="feature-card-link">
                Try it out <ArrowRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Study Tips */}
      <h2 className="section-title" style={{ marginTop: 32 }}>
        <BookMarked size={18} color="var(--color-purple)" />
        Study Tips
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={i} style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--color-primary-bg)',
                color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
