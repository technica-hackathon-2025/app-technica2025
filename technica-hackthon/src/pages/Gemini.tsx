import React, { useState } from 'react';
import './Gemini.css';
import Navbar from '../components/Navbar';
interface OutfitItem {
  id: string;
  description: string;
  dateCreated: string;
}

export default function TextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outfitCards, setOutfitCards] = useState<OutfitItem[]>([]);


  const generateText = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedText('');

    try {
      const maxCharacters = 500; 
      const response = await fetch('http://127.0.0.1:8080/generate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) { throw new Error('Failed to generate text'); }
const data = await response.json();
const limitedText = data.text.length > maxCharacters
  ? data.text.slice(0, maxCharacters) + '...'
  : data.text;

setGeneratedText(limitedText);
const newOutfit = {
  id: crypto.randomUUID(),
  description: limitedText,
  dateCreated: new Date().toLocaleString(),
};
setOutfitCards((prev) => [newOutfit, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateText();
    }
  };

  return (
    <div className="text-generator-container">
      <div className="text-generator-wrapper">
      <Navbar />
        <div className="text-generator-card">
          <h1 className="text-generator-title">
            Gemini Closet Assistant
          </h1>
          <p className="text-generator-subtitle">
            Ask me anything, powered by Google's Gemini AI
          </p>
{generatedText && !loading && (
            <div className="text-generator-result">
              <h2 className="text-generator-result-title">
                Generated Response:
              </h2>
              <div className="text-generator-result-box">
                <p className="text-generator-result-text">
                  {generatedText}
                </p>
              </div>
            </div>
          )}
          <div className="text-generator-form">
            <div>
              <label className="text-generator-label">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or provide a prompt..."
                className="text-generator-textarea"
                rows={4}
                disabled={loading}
              />
              <p className="text-generator-hint">
                Press Enter to generate, Shift+Enter for new line
              </p>
            </div>

            <button
              onClick={generateText}
              disabled={loading}
              className="text-generator-button"
            >
              {loading ? 'Generating...' : 'Generate Text'}
            </button>
          </div>

          {error && (
            <div className="text-generator-error">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-generator-loading">
              <div className="text-generator-spinner"></div>
            </div>
          )}
          {outfitCards.length > 0 && (
  <div
    className="outfit-gallery"
    style={{
      display: "flex",
      gap: "1.2rem",
      overflowX: "auto",
      padding: "1rem 0",
      marginBottom: "2rem",
      borderBottom: "1px solid #e6dccb"
    }}
  >
    {outfitCards.map(card => (
      <div
        key={card.id}
        className="outfit-card"
        style={{
          minWidth: "210px",
          maxWidth: "260px",
          background: "#fffdf9",
          border: "2px solid #e6dccb",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(170,140,100,0.12)",
          padding: "1rem",
          flex: "0 0 auto"
        }}
      >
        <div>
          <strong>Description:</strong> {card.description}
        </div>
        <div style={{ fontSize: "0.9em", color: "#8c7b6b" }}>
          Created: {card.dateCreated}
        </div>
      </div>
    ))}
  </div>
)}


        </div>
      </div>
    </div>
  );
}
