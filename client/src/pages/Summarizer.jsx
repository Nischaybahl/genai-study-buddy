import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles } from 'lucide-react';
import { api } from '../utils/api.js';
import { DemoNotice, LiveNotice, ErrorAlert, LoadingState } from '../components/SharedComponents.jsx';
import CopyButton from '../components/CopyButton.jsx';

const SUMMARY_TYPES = [
  { id: 'short', label: 'Short Summary', desc: '2-3 sentence overview' },
  { id: 'detailed', label: 'Detailed Summary', desc: 'Comprehensive breakdown' },
  { id: 'bullets', label: 'Bullet Points', desc: 'Key points as bullets' },
  { id: 'concepts', label: 'Key Concepts', desc: 'Core terms & definitions' },
];

const MAX_CHARS = 10000;

const PLACEHOLDER = `Paste your study notes here...

For example:
"The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration, a process involving glycolysis, the Krebs cycle, and the electron transport chain. Mitochondria have their own DNA and ribosomes, suggesting they evolved from ancient bacteria (endosymbiotic theory)."`;

export default function Summarizer({ demoMode }) {
  const [text, setText] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultWasDemo, setResultWasDemo] = useState(false);

  const handleGenerate = async () => {
    if (text.trim().length < 10) {
      setError('Please enter at least 10 characters of study notes.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const data = await api.summarize(text, summaryType);
      setResult(data.result);
      setResultWasDemo(data.demoMode);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const charWarning = charCount > MAX_CHARS * 0.9 ? (charCount > MAX_CHARS ? 'error' : 'warning') : '';

  return (
    <div>
      {demoMode !== null && (demoMode ? <DemoNotice /> : <LiveNotice />)}

      <div className="card">
        <div className="card-header">
          <div className="card-icon primary">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="card-title">Notes Summarizer</h2>
            <p className="card-description">
              Paste your study notes below and choose a summary format. The AI will extract the most
              important information for you.
            </p>
          </div>
        </div>

        <div className="card-body">
          {/* Summary Type Selector */}
          <div className="form-group">
            <label className="form-label">Summary Format</label>
            <div className="segment-control" role="group" aria-label="Summary type">
              {SUMMARY_TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`segment-btn ${summaryType === t.id ? 'active' : ''}`}
                  onClick={() => setSummaryType(t.id)}
                  title={t.desc}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="form-group">
            <label htmlFor="notes-input" className="form-label">
              Your Study Notes
            </label>
            <textarea
              id="notes-input"
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={10}
              maxLength={MAX_CHARS}
              style={{ minHeight: 200 }}
            />
            <span className={`char-count ${charWarning}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </div>

          <ErrorAlert message={error} />

          <button
            id="summarize-btn"
            className="btn btn-primary btn-full btn-lg"
            onClick={handleGenerate}
            disabled={loading || text.trim().length < 10}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="card" style={{ marginTop: 24 }}>
          <LoadingState message="Summarizing your notes with AI..." />
        </div>
      )}

      {result && !loading && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div className="result-label">
                  <FileText size={14} />
                  AI-Generated{' '}
                  {SUMMARY_TYPES.find((t) => t.id === summaryType)?.label}
                  {resultWasDemo && (
                    <span className="chip chip-demo" style={{ marginLeft: 8 }}>Demo</span>
                  )}
                </div>
              </div>
              <CopyButton text={result} />
            </div>
          </div>
          <div className="card-body">
            <div className="result-box">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
