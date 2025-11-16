import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import Navbar from "../components/Navbar";
import type { OutfitItem, ClosetStats } from "../types/types";
import "./Dashboard.css";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

interface DashboardProps {
  setUser: User; // this is actually the user object
}

export default function Dashboard({ setUser: user }: DashboardProps) {
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [stats, setStats] = useState<ClosetStats>({
    totalOutfits: 0,
  });
  const [popupOutfit, setPopupOutfit] = useState<OutfitItem | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!user) return;

        // users/{uid}/geminiData/history
        const historyRef = doc(db, "users", user.uid, "geminiData", "history");
        const snap = await getDoc(historyRef);

        if (!snap.exists()) {
          setOutfits([]);
          setStats({ totalOutfits: 0 });
          return;
        }

        const data = snap.data() as { history?: any[] };
        const historyArr = Array.isArray(data.history) ? data.history : [];

        // sort by createdAt (newest first)
        const sorted = historyArr
          .filter((entry) => entry && typeof entry === "object")
          .sort(
            (a, b) =>
              (b.createdAt ?? 0) - (a.createdAt ?? 0)
          );

        // take latest 3
        const latestThree = sorted.slice(0, 3);

        const outfitsFromHistory: OutfitItem[] = latestThree.map(
          (entry, index) => ({
            id: String(index),
            name: entry.prompt || `Look ${index + 1}`,
            description: entry.text || "",
            dateCreated: entry.createdAt
              ? new Date(entry.createdAt).toISOString()
              : new Date().toISOString(),
          })
        );

        setOutfits(outfitsFromHistory);
        setStats({ totalOutfits: historyArr.length });
      } catch (err) {
        console.error("Failed to load history for dashboard:", err);
      }
    };

    loadHistory();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* 🌼 User Profile Section */}
          <section className="profile-section">
            <img
              src={user.photoURL || "https://via.placeholder.com/120"}
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-info">
              <h1>Welcome, {user.displayName || "User"}!</h1>
              <p>Your AI-powered virtual closet assistant</p>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.totalOutfits}</span>
                  <span className="stat-label">Outfits</span>
                </div>
              </div>
            </div>
          </section>

          {/* 🌿 Recent Outfits Only */}
          <section className="outfits-gallery">
            <div className="section-title">
              <h2>Recent Outfits</h2>
            </div>

            <div className="gallery-scroll">
              {outfits.length > 0 ? (
                outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="outfit-card"
                    onClick={() => setPopupOutfit(outfit)}
                    tabIndex={0}
                    aria-label={`Open details for ${outfit.name}`}
                  >
                    <div className="outfit-info">
                      <h3 className="outfit-name">{outfit.name}</h3>
                      <div className="outfit-desc">
                        {outfit.description}
                      </div>
                      <span className="outfit-date">
                        Created: {formatDate(outfit.dateCreated)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👗</div>
                  <p>No outfits yet. Create your first outfit!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {popupOutfit && (
        <div className="popup-overlay" onClick={() => setPopupOutfit(null)}>
          <div
            className="popup-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <h2>{popupOutfit.name}</h2>
            <div className="popup-desc">{popupOutfit.description}</div>
            <div className="popup-date">
              Created: {formatDate(popupOutfit.dateCreated)}
            </div>
            <button
              className="popup-close"
              onClick={() => setPopupOutfit(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
