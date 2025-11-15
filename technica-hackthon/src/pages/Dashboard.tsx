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
    // Mock data - Replace with actual Firebase fetch
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
      },
      {
        id: "3",
        imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
        name: "Evening Glam",
        category: "Evening",
        dateCreated: new Date("2025-11-13"),
        tags: ["party", "elegant"],
      },
      {
        id: "4",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        name: "Weekend Vibes",
        category: "Casual",
        dateCreated: new Date("2025-11-14"),
        tags: ["weekend", "relaxed"],
      },
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
          {/* User Profile Section */}
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
                  <span className="stat-number">{stats.totalItems}</span>
                  <span className="stat-label">Items</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.totalOutfits}</span>
                  <span className="stat-label">Outfits</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.favoriteItems}</span>
                  <span className="stat-label">Favorites</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.recentlyAdded}</span>
                  <span className="stat-label">New This Week</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Outfits Gallery */}
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

          {/* AI Closet Features */}
          <div className="features-grid">
            <div className="feature-card primary">
              <div className="feature-icon">✨</div>
              <h3>AI Outfit Generator</h3>
              <p>
                Let AI create perfect outfit combinations based on your style,
                occasion, and weather
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Style Recommendations</h3>
              <p>
                Get personalized style suggestions based on your wardrobe and
                fashion preferences
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Outfit Calendar</h3>
              <p>
                Plan your outfits for the week and never wonder what to wear
                again
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌤️</div>
              <h3>Weather-Based Suggestions</h3>
              <p>
                Smart outfit recommendations that adapt to daily weather
                conditions
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <h3>Smart Categorization</h3>
              <p>
                Automatically organize your clothes by type, color, season, and
                occasion
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Wardrobe Analytics</h3>
              <p>
                Track what you wear most, identify gaps, and optimize your
                closet
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}