import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50kb' }));

// --- Gemini client (only if API key is set) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const isDemoMode = !GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here';
let genai = null;
if (!isDemoMode) {
  genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const MODEL = 'gemini-2.0-flash';

// --- Helpers ---
async function generateContent(prompt) {
  const response = await genai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text;
}

function demoNotice() {
  return '\n\n---\n> ⚠️ **Demo Mode**: This is a sample response. Configure a real Gemini API key to get live AI-generated results.';
}

// --- Demo responses ---
const demoResponses = {
  summarize: (type) => {
    const responses = {
      short: `**Short Summary (Demo)**\n\nPhotosynthesis is the process by which plants convert sunlight, water, and CO₂ into glucose and oxygen. It occurs in two stages: the light-dependent reactions (in the thylakoid) and the Calvin cycle (in the stroma).${demoNotice()}`,
      detailed: `**Detailed Summary (Demo)**\n\nPhotosynthesis is a biological process carried out by plants, algae, and some bacteria to synthesize food from sunlight.\n\n**Stage 1 – Light Reactions:** Occur in the thylakoid membranes. Light energy is absorbed by chlorophyll and converted to chemical energy (ATP and NADPH). Water molecules are split, releasing oxygen as a by-product.\n\n**Stage 2 – Calvin Cycle:** Occurs in the stroma. Uses ATP and NADPH to fix CO₂ into glucose via a series of enzyme-driven reactions involving RuBisCO.\n\n**Overall Equation:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂${demoNotice()}`,
      bullets: `**Key Bullet Points (Demo)**\n\n• Photosynthesis converts light energy into chemical energy\n• Two stages: Light reactions and Calvin Cycle\n• Chlorophyll absorbs sunlight (primarily red and blue wavelengths)\n• Products: glucose (C₆H₁₂O₆) and oxygen (O₂)\n• Occurs in the chloroplast of plant cells\n• Water is split during the light reactions (photolysis)\n• CO₂ is fixed during the Calvin Cycle${demoNotice()}`,
      concepts: `**Key Concepts (Demo)**\n\n1. **Chlorophyll** – The green pigment in chloroplasts that captures light energy\n2. **Thylakoid** – Membrane-bound compartments where light reactions occur\n3. **Stroma** – The fluid-filled space of the chloroplast; site of the Calvin Cycle\n4. **ATP & NADPH** – Energy carriers produced in the light reactions\n5. **RuBisCO** – The enzyme that fixes CO₂ in the Calvin Cycle\n6. **Photolysis** – The splitting of water molecules by light${demoNotice()}`,
    };
    return responses[type] || responses.short;
  },

  quiz: (count, difficulty) => {
    const q = [
      {
        question: 'What is the primary pigment responsible for capturing light in photosynthesis?',
        options: ['Carotenoid', 'Chlorophyll', 'Xanthophyll', 'Anthocyanin'],
        correct: 1,
        explanation: 'Chlorophyll is the main photosynthetic pigment in plants, absorbing red and blue light while reflecting green light.',
      },
      {
        question: 'Where does the Calvin Cycle take place?',
        options: ['Thylakoid membrane', 'Mitochondria', 'Stroma of the chloroplast', 'Cytoplasm'],
        correct: 2,
        explanation: 'The Calvin Cycle (light-independent reactions) takes place in the stroma, the fluid-filled region of the chloroplast.',
      },
      {
        question: 'Which gas is released as a by-product of photosynthesis?',
        options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
        correct: 2,
        explanation: 'Oxygen is released when water molecules are split during the light-dependent reactions (photolysis).',
      },
      {
        question: 'What are the two main stages of photosynthesis?',
        options: [
          'Oxidation and Reduction',
          'Light reactions and Calvin Cycle',
          'Glycolysis and Krebs Cycle',
          'Transcription and Translation',
        ],
        correct: 1,
        explanation: 'Photosynthesis consists of light-dependent reactions (light reactions) and light-independent reactions (Calvin Cycle).',
      },
      {
        question: 'Which enzyme is responsible for carbon fixation in the Calvin Cycle?',
        options: ['ATP synthase', 'Helicase', 'RuBisCO', 'DNA polymerase'],
        correct: 2,
        explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase) is the enzyme that catalyzes CO₂ fixation in the Calvin Cycle.',
      },
      {
        question: 'What is the overall chemical equation for photosynthesis?',
        options: [
          'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy',
          '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
          '6O₂ + C₆H₁₂O₆ → 6CO₂ + 6H₂O',
          'CO₂ + H₂O → CH₂O + O₂',
        ],
        correct: 1,
        explanation: 'The overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.',
      },
      {
        question: 'In which organelle does photosynthesis occur?',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'],
        correct: 3,
        explanation: 'Photosynthesis occurs in the chloroplast, which contains the thylakoids and stroma.',
      },
      {
        question: 'What wavelengths of light does chlorophyll absorb most efficiently?',
        options: ['Green and yellow', 'Red and blue', 'UV and infrared', 'Orange and violet'],
        correct: 1,
        explanation: 'Chlorophyll absorbs red light (~680 nm) and blue light (~450 nm) most efficiently, which is why plants appear green.',
      },
      {
        question: 'What role does water play in photosynthesis?',
        options: [
          'It is the source of carbon for glucose',
          'It provides energy for the Calvin Cycle',
          'It is split to provide electrons and release oxygen',
          'It acts as the final electron acceptor',
        ],
        correct: 2,
        explanation: 'Water is split (photolysis) during the light reactions to provide electrons to replace those lost by chlorophyll, and oxygen is released.',
      },
      {
        question: 'What are ATP and NADPH used for in photosynthesis?',
        options: [
          'To split water molecules',
          'To power the Calvin Cycle for glucose synthesis',
          'To absorb light energy',
          'To transport glucose out of the cell',
        ],
        correct: 1,
        explanation: 'ATP and NADPH, produced during the light reactions, provide the energy and reducing power needed to drive the Calvin Cycle.',
      },
    ];
    return { questions: q.slice(0, count), difficulty };
  },

  chat: (message) => {
    return `**Study Explanation (Demo)**\n\nGreat question! Here's an explanation of **"${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"**:\n\nThis is a fundamental concept in biology/science. To understand it fully, consider these key points:\n\n1. **Definition** – Start by understanding the core definition and what the concept describes.\n2. **Mechanism** – How does it actually work? What are the step-by-step processes involved?\n3. **Importance** – Why does this matter? What would happen if it didn't exist?\n4. **Real-world examples** – Connect the concept to things you can observe in everyday life.\n5. **Common misconceptions** – Students often confuse this with related concepts — make sure to distinguish them.\n\n**Study Tip:** Try to explain this concept in your own words without looking at your notes. If you can teach it simply, you understand it deeply!${demoNotice()}`;
  },

  improvePrompt: (prompt, purpose) => {
    return {
      improved: `As an expert educator, provide a comprehensive yet accessible explanation of ${prompt}. Include: (1) a clear definition suitable for a student, (2) the key underlying mechanisms or principles, (3) 2-3 concrete real-world examples, (4) connections to related concepts in ${purpose}, and (5) a brief summary of why this topic is important. Format your response with clear headings and use analogies where helpful.`,
      explanation: `**Why this prompt works better (Demo):**\n\n• **Role assignment** – "As an expert educator" sets the AI's persona and communication style\n• **Structured output** – Numbered requirements ensure complete, organized responses\n• **Concrete deliverables** – Asking for examples and analogies makes abstract concepts tangible\n• **Context anchoring** – Mentioning the subject area (${purpose}) helps the AI tailor its response\n• **Student-focused framing** – Specifying "suitable for a student" calibrates the complexity level${demoNotice()}`,
    };
  },
};

// --- Validation ---
function validateText(text, fieldName = 'text', maxLength = 10000) {
  if (!text || typeof text !== 'string') {
    return `${fieldName} is required and must be a string.`;
  }
  if (text.trim().length < 10) {
    return `${fieldName} must be at least 10 characters long.`;
  }
  if (text.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters.`;
  }
  return null;
}

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', demoMode: isDemoMode, timestamp: new Date().toISOString() });
});

// Summarize
app.post('/api/summarize', async (req, res) => {
  const { text, summaryType = 'short' } = req.body;
  const validTypes = ['short', 'detailed', 'bullets', 'concepts'];

  const textError = validateText(text, 'text');
  if (textError) return res.status(400).json({ error: textError });
  if (!validTypes.includes(summaryType)) {
    return res.status(400).json({ error: 'Invalid summaryType. Must be one of: short, detailed, bullets, concepts' });
  }

  if (isDemoMode) {
    return res.json({ result: demoResponses.summarize(summaryType), demoMode: true });
  }

  try {
    const typeLabels = {
      short: 'a concise short summary (2-3 sentences)',
      detailed: 'a detailed summary covering all major points',
      bullets: 'a bulleted list of key points',
      concepts: 'a list of key concepts with brief definitions',
    };

    const prompt = `You are an expert study assistant. Analyze the following study notes and provide ${typeLabels[summaryType]}.

Study Notes:
"""
${text}
"""

Format your response in clear markdown. Be accurate, educational, and student-friendly.`;

    const result = await generateContent(prompt);
    res.json({ result, demoMode: false });
  } catch (err) {
    console.error('Summarize error:', err.message);
    res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
  }
});

// Quiz
app.post('/api/quiz', async (req, res) => {
  const { text, questionCount = 5, difficulty = 'medium' } = req.body;
  const validCounts = [5, 10];
  const validDifficulties = ['easy', 'medium', 'hard'];

  const textError = validateText(text, 'text');
  if (textError) return res.status(400).json({ error: textError });
  if (!validCounts.includes(Number(questionCount))) {
    return res.status(400).json({ error: 'questionCount must be 5 or 10.' });
  }
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty. Must be easy, medium, or hard.' });
  }

  if (isDemoMode) {
    const demo = demoResponses.quiz(Number(questionCount), difficulty);
    return res.json({ questions: demo.questions, difficulty, demoMode: true });
  }

  try {
    const prompt = `You are an expert quiz creator. Based on the following study material, create exactly ${questionCount} multiple-choice questions at ${difficulty} difficulty level.

Study Material:
"""
${text}
"""

Return ONLY a valid JSON array with exactly ${questionCount} question objects. Each object must have:
- "question": string (the question text)
- "options": array of exactly 4 strings (answer choices)
- "correct": number (0-based index of the correct option)
- "explanation": string (brief explanation of why the answer is correct)

Example format:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Because..."
  }
]

Return only the JSON array, no other text.`;

    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid quiz format returned from AI');
    }

    res.json({ questions: questions.slice(0, questionCount), difficulty, demoMode: false });
  } catch (err) {
    console.error('Quiz error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

// Chat
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  const msgError = validateText(message, 'message', 2000);
  if (msgError) return res.status(400).json({ error: msgError });

  if (isDemoMode) {
    return res.json({ reply: demoResponses.chat(message), demoMode: true });
  }

  try {
    const historyText = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Student' : 'AI Tutor'}: ${h.content}`)
      .join('\n');

    const prompt = `You are a knowledgeable, encouraging AI study tutor. Your goal is to help students understand concepts clearly and develop good study habits.

Previous conversation:
${historyText || '(new conversation)'}

Student question: ${message}

Respond in clear, student-friendly language. Use markdown formatting where helpful. Keep responses focused and educational.`;

    const reply = await generateContent(prompt);
    res.json({ reply, demoMode: false });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to get a response. Please try again.' });
  }
});

// Improve prompt
app.post('/api/improve-prompt', async (req, res) => {
  const { prompt, purpose = 'learning' } = req.body;
  const validPurposes = ['learning', 'summarization', 'coding', 'quiz'];

  const promptError = validateText(prompt, 'prompt', 2000);
  if (promptError) return res.status(400).json({ error: promptError });
  if (!validPurposes.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid purpose. Must be one of: learning, summarization, coding, quiz.' });
  }

  if (isDemoMode) {
    const demo = demoResponses.improvePrompt(prompt, purpose);
    return res.json({ improved: demo.improved, explanation: demo.explanation, demoMode: true });
  }

  try {
    const contextMap = {
      learning: 'explaining educational concepts for a student',
      summarization: 'summarizing study material effectively',
      coding: 'learning programming concepts and getting code examples',
      quiz: 'generating study questions and quizzes',
    };

    const systemPrompt = `You are an expert prompt engineer specializing in educational AI prompts. A student has written a basic prompt for ${contextMap[purpose]}. Improve it significantly.

Original prompt: "${prompt}"

Provide:
1. An improved, detailed, and effective version of the prompt
2. A clear explanation of what makes the improved version more effective

Return ONLY valid JSON with this structure:
{
  "improved": "the improved prompt text here",
  "explanation": "markdown explanation of improvements"
}`;

    const raw = await generateContent(systemPrompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    res.json({ improved: result.improved, explanation: result.explanation, demoMode: false });
  } catch (err) {
    console.error('Improve-prompt error:', err.message);
    res.status(500).json({ error: 'Failed to improve prompt. Please try again.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 GenAI Study Buddy Server running on port ${PORT}`);
  console.log(`📡 Mode: ${isDemoMode ? '🟡 DEMO (no API key)' : '🟢 LIVE (Gemini API active)'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
});
