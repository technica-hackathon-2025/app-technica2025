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
    totalItems: 0,
    totalOutfits: 0,
    favoriteItems: 0,
    recentlyAdded: 0,
  });

  useEffect(() => {
    const mockOutfits: OutfitItem[] = [
      {
        id: "1",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
        name: "Summer Casual",
        category: "Casual",
        dateCreated: new Date("2025-11-10"),
        tags: ["casual", "summer"],
      },
      {
        id: "2",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        name: "Office Chic",
        category: "Professional",
        dateCreated: new Date("2025-11-12"),
        tags: ["work", "formal"],
      }
    ];

    const mockStats: ClosetStats = {
      totalItems: 48,
      totalOutfits: 12,
      favoriteItems: 8,
      recentlyAdded: 3,
    };

    setOutfits(mockOutfits);
    setStats(mockStats);
  }, []);

  const formatDate = (date: Date) => {
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
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="outfit-image"
                    />
                    <div className="outfit-info">
                      <h3 className="outfit-name">{outfit.name}</h3>
                      <div className="outfit-meta">
                        <span className="outfit-category">{outfit.category}</span>
                        <span className="outfit-date">
                          {formatDate(outfit.dateCreated)}
                        </span>
                      </div>
                      {outfit.tags && (
                        <div className="outfit-tags">
                          {outfit.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
