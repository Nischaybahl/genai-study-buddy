import { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { api } from '../utils/api.js';
import { DemoNotice, LiveNotice, ErrorAlert, LoadingState } from '../components/SharedComponents.jsx';

const PLACEHOLDER = `Paste your study material here...

Example:
"The water cycle (hydrological cycle) describes the continuous movement of water on, above, and below Earth's surface. The main processes are evaporation, condensation, precipitation, and collection. Solar energy drives evaporation from oceans and land. Water vapor rises, cools, and condenses into clouds. Precipitation falls as rain or snow, collecting in oceans, rivers, and groundwater."`;

export default function QuizGenerator({ demoMode }) {
  const [text, setText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultWasDemo, setResultWasDemo] = useState(false);

  const handleGenerate = async () => {
    if (text.trim().length < 10) {
      setError('Please enter at least 10 characters of study material.');
      return;
    }
    setLoading(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    try {
      const data = await api.quiz(text, questionCount, difficulty);
      setQuestions(data.questions);
      setResultWasDemo(data.demoMode);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError('');
    setText('');
  };

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0;
  const pct = submitted ? Math.round((score / questions.length) * 100) : 0;

  const getOptionClass = (qIdx, optIdx, correctIdx) => {
    if (!submitted) return answers[qIdx] === optIdx ? 'selected' : '';
    if (optIdx === correctIdx) return 'correct';
    if (answers[qIdx] === optIdx && optIdx !== correctIdx) return 'incorrect';
    return '';
  };

  const OPTIONS_LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div>
      {demoMode !== null && (demoMode ? <DemoNotice /> : <LiveNotice />)}

      {/* Config Card */}
      {!questions.length && (
        <div className="card">
          <div className="card-header">
            <div className="card-icon purple">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="card-title">Quiz Generator</h2>
              <p className="card-description">
                Paste study material to generate an interactive multiple-choice quiz. Test your
                knowledge and review explanations for each answer.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label htmlFor="quiz-text" className="form-label">Study Material</label>
              <textarea
                id="quiz-text"
                className="form-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={9}
                maxLength={10000}
                style={{ minHeight: 180 }}
              />
            </div>

            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="question-count" className="form-label">Number of Questions</label>
                <select
                  id="question-count"
                  className="form-select"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="difficulty" className="form-label">Difficulty Level</label>
                <select
                  id="difficulty"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <ErrorAlert message={error} />

            <button
              id="generate-quiz-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={handleGenerate}
              disabled={loading || text.trim().length < 10}
            >
              {loading ? (
                <><span className="spinner" /> Generating Quiz...</>
              ) : (
                <><Sparkles size={18} /> Generate Quiz</>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <LoadingState message="Building your quiz with AI..." />
        </div>
      )}

      {/* Quiz Display */}
      {questions.length > 0 && !loading && (
        <div>
          {/* Score Card (after submit) */}
          {submitted && (
            <div className="quiz-score-card">
              <Trophy size={36} color="var(--color-primary)" style={{ marginBottom: 12 }} />
              <div className="quiz-score-number">{pct}%</div>
              <div className="quiz-score-label">
                You got {score} out of {questions.length} correct
              </div>
              {resultWasDemo && <span className="chip chip-demo" style={{ marginTop: 12, display: 'inline-flex' }}>Demo Results</span>}
            </div>
          )}

          {/* Quiz Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>
                {questions.length} Questions
              </h2>
              <span className={`chip chip-difficulty-${difficulty}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              {resultWasDemo && !submitted && <span className="chip chip-demo">Demo</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RotateCcw size={14} /> New Quiz
            </button>
          </div>

          <ErrorAlert message={error} />

          {/* Questions */}
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="quiz-question-card">
              <div className="quiz-question-number">{qIdx + 1}</div>
              <div className="quiz-question-text">{q.question}</div>

              <div className="quiz-options">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    className={`quiz-option ${getOptionClass(qIdx, optIdx, q.correct)}`}
                    onClick={() => handleSelectAnswer(qIdx, optIdx)}
                    disabled={submitted}
                  >
                    <span className="quiz-option-letter">{OPTIONS_LETTERS[optIdx]}</span>
                    {opt}
                    {submitted && optIdx === q.correct && (
                      <CheckCircle size={16} color="var(--color-success)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                    {submitted && answers[qIdx] === optIdx && optIdx !== q.correct && (
                      <XCircle size={16} color="var(--color-error)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>

              {submitted && q.explanation && (
                <div className="quiz-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {/* Submit / Retry */}
          {!submitted ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                id="submit-quiz-btn"
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                style={{ flex: 1 }}
              >
                Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary btn-lg" onClick={handleReset} style={{ flex: 1 }}>
                <RotateCcw size={18} /> Take New Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
