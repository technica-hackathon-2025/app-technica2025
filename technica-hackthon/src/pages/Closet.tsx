import { useEffect, useState } from "react";
import "./Closet.css";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HistoryItem {
  id: string;
  prompt: string;
  text: string;
  createdAt: number;
}

export default function Closet() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [popupItem, setPopupItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to see your Gemini history.");
          setLoading(false);
          return;
        }

        const historyRef = doc(db, "users", user.uid, "geminiData", "history");
        const snap = await getDoc(historyRef);

        if (!snap.exists()) {
          // no history yet
          setItems([]);
          setLoading(false);
          return;
        }

        const data = snap.data() as { history?: any[] };

        if (!data.history || !Array.isArray(data.history)) {
          setItems([]);
          setLoading(false);
          return;
        }

        // Map entries into typed items with ids and sort by createdAt (oldest -> newest)
        const mapped: HistoryItem[] = data.history
          .filter((entry) => entry && typeof entry === "object")
          .map((entry, index) => ({
            id: String(index), // index-based id is fine for read-only display
            prompt: entry.prompt ?? "",
            text: entry.text ?? "",
            createdAt: entry.createdAt ?? 0,
          }))
          .sort((a, b) => a.createdAt - b.createdAt); // oldest first
          // use (b.createdAt - a.createdAt) for newest first

        setItems(mapped);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Gemini history:", err);
        setError("Failed to load your Gemini history.");
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (ms: number) => {
    if (!ms) return "";
    return new Date(ms).toLocaleString();
  };

  return (
    <>
      <Navbar />
      <div className="closet-page-root">
        <h1 className="closet-title">Your Closet</h1>

        {loading && <div className="closet-loading">Loading...</div>}

        {error && !loading && (
          <div className="closet-error">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="closet-empty">
            You don’t have any Gemini entries yet. Try generating something first!
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="pinterest-grid">
            {items.map((item) => (
              <div
                className="grid-outfit-card outfit-card-textonly"
                key={item.id}
                onClick={() => setPopupItem(item)}
                tabIndex={0}
                aria-label={`Open details for prompt: ${item.prompt}`}
              >
                <div className="card-name">
                  {item.prompt || "Untitled prompt"}
                </div>
                <div className="card-desc">
                  {item.text.length > 140
                    ? item.text.slice(0, 140) + "..."
                    : item.text}
                </div>
                <div className="card-date">{formatDate(item.createdAt)}</div>
              </div>
            ))}
          </div>
        )}

        {popupItem && (
          <div className="popup-overlay" onClick={() => setPopupItem(null)}>
            <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="popup-title">Prompt</h2>
              <p className="popup-prompt">{popupItem.prompt}</p>

              <h3 className="popup-subtitle">Gemini Response</h3>
              <p className="popup-desc">{popupItem.text}</p>

              <div className="popup-date">{formatDate(popupItem.createdAt)}</div>

              <button
                className="popup-close"
                onClick={() => setPopupItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
