import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Wand2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../utils/api.js';
import { DemoNotice, LiveNotice, ErrorAlert, LoadingState } from '../components/SharedComponents.jsx';
import CopyButton from '../components/CopyButton.jsx';

const PURPOSES = [
  { id: 'learning', label: '📚 Learning', desc: 'Understanding a concept or topic' },
  { id: 'summarization', label: '📝 Summarization', desc: 'Condensing study material' },
  { id: 'coding', label: '💻 Coding', desc: 'Learning programming concepts' },
  { id: 'quiz', label: '❓ Quiz Creation', desc: 'Generating study questions' },
];

const MAX_PROMPT_CHARS = 2000;

export default function PromptAssistant({ demoMode }) {
  const [prompt, setPrompt] = useState('');
  const [purpose, setPurpose] = useState('learning');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultWasDemo, setResultWasDemo] = useState(false);

  const handleImprove = async () => {
    if (prompt.trim().length < 10) {
      setError('Please enter at least 10 characters for your prompt.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.improvePrompt(prompt, purpose);
      setResult(data);
      setResultWasDemo(data.demoMode);
    } catch (err) {
      setError(err.message || 'Failed to improve prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {demoMode !== null && (demoMode ? <DemoNotice /> : <LiveNotice />)}

      <div className="card">
        <div className="card-header">
          <div className="card-icon success">
            <Wand2 size={22} />
          </div>
          <div>
            <h2 className="card-title">Prompt Assistant</h2>
            <p className="card-description">
              Enter a basic prompt and let AI transform it into a detailed, structured query that gets
              significantly better results from any AI tool.
            </p>
          </div>
        </div>

        <div className="card-body">
          {/* Purpose selector */}
          <div className="form-group">
            <label className="form-label">What is this prompt for?</label>
            <div className="purpose-tags">
              {PURPOSES.map((p) => (
                <button
                  key={p.id}
                  className={`purpose-tag ${purpose === p.id ? 'selected' : ''}`}
                  onClick={() => setPurpose(p.id)}
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="form-group">
            <label htmlFor="prompt-input" className="form-label">Your Basic Prompt</label>
            <textarea
              id="prompt-input"
              className="form-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Enter a simple prompt to improve...\n\nExample: "Explain photosynthesis"\nOr: "Help me understand machine learning"\nOr: "Write code for sorting a list"`}
              rows={5}
              maxLength={MAX_PROMPT_CHARS}
            />
            <span className="char-count">
              {prompt.length} / {MAX_PROMPT_CHARS}
            </span>
          </div>

          <ErrorAlert message={error} />

          <button
            id="improve-prompt-btn"
            className="btn btn-primary btn-full btn-lg"
            onClick={handleImprove}
            disabled={loading || prompt.trim().length < 10}
          >
            {loading ? (
              <><span className="spinner" /> Improving Prompt...</>
            ) : (
              <><Sparkles size={18} /> Improve My Prompt</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 24 }}>
          <LoadingState message="Crafting a better prompt with AI..." />
        </div>
      )}

      {result && !loading && (
        <div style={{ marginTop: 24 }}>
          {/* Prompt Comparison */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <ArrowRight size={18} color="var(--color-primary)" />
              Prompt Comparison
            </h3>
            {resultWasDemo && <span className="chip chip-demo">Demo</span>}
          </div>

          <div className="prompt-comparison">
            {/* Original */}
            <div className="prompt-box">
              <div className="prompt-box-header original">
                ❌ Original Prompt
              </div>
              <div className="prompt-box-body" style={{ color: 'var(--color-text-muted)' }}>
                {prompt}
              </div>
            </div>

            {/* Improved */}
            <div className="prompt-box" style={{ border: '1.5px solid var(--color-primary)' }}>
              <div className="prompt-box-header improved" style={{ justifyContent: 'space-between' }}>
                <span>✅ Improved Prompt</span>
                <CopyButton text={result.improved} />
              </div>
              <div className="prompt-box-body">
                {result.improved}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
                <div className="card-icon primary">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: 16 }}>Why This Works Better</h3>
                  <p className="card-description">AI analysis of the improvements made</p>
                </div>
              </div>
              <div className="card-body">
                <div className="result-box">
                  <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
