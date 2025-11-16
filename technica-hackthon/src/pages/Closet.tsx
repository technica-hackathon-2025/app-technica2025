import React, { useState } from 'react';
import './Closet.css';
import Navbar from '../components/Navbar';
import type { OutfitItem} from "../types/types";

const sampleOutfits: OutfitItem[] = [
  {
    id: '1',
    name: 'Floral Picnic',
    description: "A breezy floral dress, perfect for spring afternoons and picnics in the park.",
    dateCreated: '2025-11-10 14:22:33',
  },
  {
    id: '2',
    name: 'Cottagecore Chic',
    description: "Cozy knits, linen pants, and a straw hat. Ideal for a book and tea by the window.",
    dateCreated: '2025-11-11 09:10:21',
  },
  
  
  // Add more outfits as needed
];

export default function Closet() {
  const [popupOutfit, setPopupOutfit] = useState<OutfitItem | null>(null);

  return (
    <>
    <Navbar />
    <div className="closet-page-root">
      <h1 className="closet-title">Your Closet</h1>
      <div className="pinterest-grid">
        {sampleOutfits.map(outfit => (
          <div
            className="grid-outfit-card outfit-card-textonly"
            key={outfit.id}
            onClick={() => setPopupOutfit(outfit)}
            tabIndex={0}
            aria-label={`Open details for ${outfit.name}`}
          >
            <div className="card-name">{outfit.name}</div>
            <div className="card-desc">{outfit.description}</div>
            <div className="card-date">{outfit.dateCreated}</div>
          </div>
        ))}
      </div>
      {popupOutfit && (
        <div className="popup-overlay" onClick={() => setPopupOutfit(null)}>
          <div className="popup-modal" onClick={e => e.stopPropagation()}>
            <h2>{popupOutfit.name}</h2>
            <p className="popup-desc">{popupOutfit.description}</p>
            <div className="popup-date">{popupOutfit.dateCreated}</div>
            <button className="popup-close" onClick={() => setPopupOutfit(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
