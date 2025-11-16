import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import Navbar from "../components/Navbar";
import type { OutfitItem, ClosetStats } from "../types/types";
import "./Dashboard.css";

interface DashboardProps {
  setUser: User;
}

export default function Dashboard({ setUser: user }: DashboardProps) {
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [stats, setStats] = useState<ClosetStats>({
    totalOutfits: 0,
  });

  useEffect(() => {
    const mockOutfits: OutfitItem[] = [
      {
    id: "1",
    name: "Summer Casual",
    dateCreated: new Date("2025-11-10").toISOString(),
  },
  {
    id: "2",
    name: "Office Chic",
    dateCreated: new Date("2025-11-12").toISOString(),
  }
    ];

    const mockStats: ClosetStats = {
      totalOutfits: 12,
    };

    setOutfits(mockOutfits);
    setStats(mockStats);
  }, []);

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
              <button className="view-all-btn">View All →</button>
            </div>

            <div className="gallery-scroll">
              {outfits.length > 0 ? (
                outfits.map((outfit) => (
  <div key={outfit.id} className="outfit-card">
    <div className="outfit-info">
      <h3 className="outfit-name">{outfit.name}</h3>
      <span className="outfit-date">Created: {formatDate(outfit.dateCreated)}</span>
    </div>
  </div>
))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👗</div>
                  <p>No outfits yet. Create your first outfit!</p>
                  <button className="cta-button">Create Outfit</button>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
