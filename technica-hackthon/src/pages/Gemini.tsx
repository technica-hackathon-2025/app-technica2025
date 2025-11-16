import React, { useState } from 'react';
import './Gemini.css';
import Navbar from '../components/Navbar';
import {
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // ⬅️ no .ts

// 🔹 Save to a single doc as an array field
const saveGeneratedText = async (prompt: string, text: string) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No user logged in, not saving to Firestore");
    return;
  }

  // Single document:
  // users/{uid}/geminiHistory/history
  const historyRef = doc(db, "users", user.uid, "geminiData", "history");

  // Firestore does NOT allow serverTimestamp() inside arrays,
  // so we use Date.now() (ms since epoch)
  const entry = {
    prompt,
    text,
    createdAt: Date.now(),
  };

  try {
    // Try to append to existing array
    await updateDoc(historyRef, {
      history: arrayUnion(entry),
    });
    console.log("Appended to existing history array");
  } catch (err: any) {
    // If doc doesn't exist yet, create it with first entry
    console.warn("history doc missing or update failed, creating new one:", err);
    await setDoc(historyRef, {
      history: [entry],
    });
    console.log("Created new history doc with first entry");
  }
};

export default function TextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateText = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedText('');

    try {
      const response = await fetch('http://127.0.0.1:8080/generate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      setGeneratedText(data.text);

      // 🔹 Save to Firestore as an array entry
      saveGeneratedText(prompt, data.text).catch((err) => {
        console.error("Failed to save generated text:", err);
      });

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
            Gemini Text Generator
          </h1>
          <p className="text-generator-subtitle">
            Ask me anything, powered by Google's Gemini AI
          </p>

          <p className="text-generator-subtitle">
            When requesting outfits, please ask 2-3 sentences for best results! Emphasize what occasions, styles, or colors you want, and what specific cloth type (e.g., dress, jacket, etc.) you prefer.
          </p>

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
        </div>
      </div>
    </div>
  );
}
