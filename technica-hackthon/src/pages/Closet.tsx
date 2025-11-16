import { useState, useRef } from 'react';
import { Plus, Save, Sparkles, Upload, X, Wand2, Trash2, Download, Share2, Heart, Eye, Layers, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ClothingItem {
  id: number;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  imageUrl: string;
  position?: { x: number; y: number };
  zIndex?: number;
  scale?: number;
  rotation?: number;
  tags?: string[];
  color?: string;
  favorite?: boolean;
}

interface Outfit {
  id: number;
  name: string;
  items: ClothingItem[];
  occasion?: string;
  season?: string;
  favorite?: boolean;
  thumbnail?: string;
}

const Closet = () => {
  const [selectedCategory, setSelectedCategory] = useState<'tops' | 'bottoms' | 'shoes' | 'accessories'>('tops');
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');
  const [outfitSeason, setOutfitSeason] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'tops' | 'bottoms' | 'shoes' | 'accessories'>('tops');
  const [newItemTags, setNewItemTags] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedCanvasItem, setSelectedCanvasItem] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const categories = ['tops', 'bottoms', 'shoes', 'accessories'] as const;
  const occasions = ['Casual', 'Work', 'Date Night', 'Party', 'Formal', 'Athletic'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: ClothingItem = {
          id: Date.now(),
          name: newItemName || file.name.replace(/\.[^/.]+$/, ''),
          category: newItemCategory,
          imageUrl: reader.result as string,
          tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
          favorite: false,
        };
        setWardrobeItems([...wardrobeItems, newItem]);
        setNewItemName('');
        setNewItemTags('');
        setShowAddModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Image Generation with Gemini
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe the clothing item you want to generate');
      return;
    }

    setIsGenerating(true);

    try {
      // GEMINI API INTEGRATION - Comment out this block to disable
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `You are a fashion design AI. Generate a description for: "${aiPrompt}"
              
              Respond with ONLY a JSON object with these keys:
              - name: A descriptive name for the clothing item
              - category: One of "tops", "bottoms", "shoes", or "accessories"
              - description: A detailed visual description
              - color: Primary color hex code (e.g., #E8D5C4)
              - tags: Array of 2-3 style tags (e.g., ["casual", "summer", "floral"])
              
              No markdown, just JSON.` 
            }
          ],
        })
      });

      const data = await response.json();
      const aiResponse = data.content.find((item: any) => item.type === "text")?.text || "";
      const cleanResponse = aiResponse.replace(/```json|```/g, "").trim();
      const generated = JSON.parse(cleanResponse);

      // Create a sophisticated colored placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 600, 600);
        gradient.addColorStop(0, generated.color || '#E8D5C4');
        gradient.addColorStop(1, adjustColor(generated.color || '#E8D5C4', -20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 600);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 32px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(generated.name, 300, 280);
        
        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillText('AI Generated', 300, 320);
        
        const imageUrl = canvas.toDataURL();
        
        const newItem: ClothingItem = {
          id: Date.now(),
          name: generated.name,
          category: generated.category,
          imageUrl: imageUrl,
          tags: generated.tags || [],
          color: generated.color,
          favorite: false,
        };
        
        setWardrobeItems([...wardrobeItems, newItem]);
        setAiPrompt('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('AI generation is currently unavailable. Please upload an image instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  // Add item to outfit builder
  const addToOutfit = (item: ClothingItem) => {
    const zIndexMap = { tops: 3, bottoms: 2, shoes: 1, accessories: 4 };
    const newItem = {
      ...item,
      id: Date.now(),
      position: { x: 150, y: 100 },
      zIndex: zIndexMap[item.category],
      scale: 1,
      rotation: 0,
    };
    setCurrentOutfit([...currentOutfit, newItem]);
    setSelectedCanvasItem(newItem.id);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();
    const item = currentOutfit.find(i => i.id === itemId);
    if (item && item.position) {
      setDraggedItem(itemId);
      setSelectedCanvasItem(itemId);
      setDragOffset({
        x: e.clientX - item.position.x,
        y: e.clientY - item.position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width - 120, e.clientX - rect.left - dragOffset.x));
      const y = Math.max(0, Math.min(rect.height - 120, e.clientY - rect.top - dragOffset.y));
      
      setCurrentOutfit(currentOutfit.map(item =>
        item.id === draggedItem
          ? { ...item, position: { x, y } }
          : item
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  // Transform controls
  const scaleItem = (itemId: number, delta: number) => {
    setCurrentOutfit(currentOutfit.map(item =>
      item.id === itemId
        ? { ...item, scale: Math.max(0.5, Math.min(2, (item.scale || 1) + delta)) }
        : item
    ));
  };

  const rotateItem = (itemId: number) => {
    setCurrentOutfit(currentOutfit.map(item =>
      item.id === itemId
        ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 }
        : item
    ));
  };

  const bringToFront = (itemId: number) => {
    const maxZ = Math.max(...currentOutfit.map(i => i.zIndex || 0));
    setCurrentOutfit(currentOutfit.map(item =>
      item.id === itemId
        ? { ...item, zIndex: maxZ + 1 }
        : item
    ));
  };

  const removeFromOutfit = (itemId: number) => {
    setCurrentOutfit(currentOutfit.filter(item => item.id !== itemId));
    if (selectedCanvasItem === itemId) setSelectedCanvasItem(null);
  };

  const clearOutfit = () => {
    setCurrentOutfit([]);
    setSelectedCanvasItem(null);
  };

  const toggleFavorite = (itemId: number) => {
    setWardrobeItems(wardrobeItems.map(item =>
      item.id === itemId ? { ...item, favorite: !item.favorite } : item
    ));
  };

  const deleteItem = (itemId: number) => {
    if (confirm('Are you sure you want to delete this item from your wardrobe?')) {
      setWardrobeItems(wardrobeItems.filter(item => item.id !== itemId));
    }
  };

  // Outfit operations
  const saveOutfit = () => {
    if (currentOutfit.length === 0) {
      alert('Add some items to your outfit first!');
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSaveOutfit = () => {
    // Generate thumbnail from canvas
    const thumbnail = canvasRef.current ? generateThumbnail() : undefined;
    
    const newOutfit: Outfit = {
      id: Date.now(),
      name: outfitName || `Outfit ${savedOutfits.length + 1}`,
      items: currentOutfit,
      occasion: outfitOccasion || undefined,
      season: outfitSeason || undefined,
      favorite: false,
      thumbnail,
    };
    setSavedOutfits([...savedOutfits, newOutfit]);
    setCurrentOutfit([]);
    setOutfitName('');
    setOutfitOccasion('');
    setOutfitSeason('');
    setShowSaveModal(false);
    setSelectedCanvasItem(null);
  };

  const generateThumbnail = () => {
    // Simple thumbnail generation (in production, use html2canvas)
    return '📸'; // Placeholder
  };

  const loadOutfit = (outfit: Outfit) => {
    // Load outfit into canvas: give each item a fresh instance id and default transforms
    const items = outfit.items.map(item => ({
      ...item,
      id: Date.now() + Math.random(),
      position: item.position || { x: 150, y: 100 },
      zIndex: item.zIndex || 1,
      scale: item.scale || 1,
      rotation: item.rotation || 0,
    }));
    setCurrentOutfit(items);
    setSelectedCanvasItem(null);
  };

  const deleteOutfit = (outfitId: number) => {
    if (confirm('Delete this outfit?')) {
      setSavedOutfits(savedOutfits.filter(o => o.id !== outfitId));
    }
  };

  const toggleOutfitFavorite = (outfitId: number) => {
    setSavedOutfits(savedOutfits.map(outfit =>
      outfit.id === outfitId ? { ...outfit, favorite: !outfit.favorite } : outfit
    ));
  };

  // Export outfit as image
  const exportOutfit = () => {
    alert('Export feature: In production, this would capture the canvas as an image file.');
  };

  // Filter wardrobe items
  const filteredItems = wardrobeItems
    .filter(item => item.category === selectedCategory)
    .filter(item => {
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .filter(item => {
      if (filterTags.length > 0) {
        return item.tags?.some(tag => filterTags.includes(tag));
      }
      return true;
    });

  // Get all unique tags
  const allTags = Array.from(new Set(wardrobeItems.flatMap(item => item.tags || [])));

  return (
    <div className="min-h-screen bg-[#FBF7F4] p-6" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 text-center relative">
          <div className="absolute top-0 left-0">
            <div className="flex space-x-2">
              <button className="p-2 bg-white/60 backdrop-blur rounded-full hover:bg-white transition-all shadow-sm">
                <Share2 className="w-5 h-5 text-[#6B5D54]" />
              </button>
              <button className="p-2 bg-white/60 backdrop-blur rounded-full hover:bg-white transition-all shadow-sm">
                <Download className="w-5 h-5 text-[#6B5D54]" />
              </button>
            </div>
          </div>
          
          <h1 className="text-6xl font-serif text-[#6B5D54] mb-3 tracking-wide">
            My Wardrobe
          </h1>
          <p className="text-lg text-[#9B8B7E] italic mb-4">Curate your personal style, piece by piece</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4C4B0] to-transparent"></div>
            <Sparkles className="w-5 h-5 text-[#D4C4B0]" />
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4C4B0] to-transparent"></div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-3 text-sm text-[#9B8B7E]">
            <span>{wardrobeItems.length} items</span>
            <span>•</span>
            <span>{savedOutfits.length} outfits</span>
            <span>•</span>
            <span>{wardrobeItems.filter(i => i.favorite).length} favorites</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_550px] gap-8">
          {/* Left - Enhanced Wardrobe */}
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white/60 backdrop-blur rounded-3xl p-4 shadow-[0_4px_20px_rgba(107,93,84,0.08)] border border-[#E8DDD0]/50">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your wardrobe..."
                  className="flex-1 px-4 py-2 bg-[#FAF6F1] border-2 border-transparent focus:border-[#8B7355] rounded-2xl outline-none transition-all"
                />
                <button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 bg-[#FAF6F1] hover:bg-[#F5EFE7] rounded-xl transition-all"
                >
                  <Layers className="w-5 h-5 text-[#6B5D54]" />
                </button>
              </div>
              
              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 6).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTags(
                        filterTags.includes(tag) 
                          ? filterTags.filter(t => t !== tag)
                          : [...filterTags, tag]
                      )}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterTags.includes(tag)
                          ? 'bg-[#8B7355] text-white'
                          : 'bg-[#F5EFE7] text-[#6B5D54] hover:bg-[#E8DDD0]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Tabs */}
            <div className="bg-white/60 backdrop-blur rounded-3xl p-2 shadow-[0_4px_20px_rgba(107,93,84,0.08)] border border-[#E8DDD0]/50">
              <div className="grid grid-cols-4 gap-2">
                {categories.map((category) => {
                  const count = wardrobeItems.filter(i => i.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 capitalize text-sm relative ${
                        selectedCategory === category
                          ? 'bg-[#8B7355] text-white shadow-lg scale-105'
                          : 'bg-transparent text-[#6B5D54] hover:bg-[#F5EFE7]'
                      }`}
                    >
                      {category}
                      {count > 0 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                          selectedCategory === category ? 'bg-white text-[#8B7355]' : 'bg-[#8B7355] text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wardrobe Items */}
            <div className="bg-white/60 backdrop-blur rounded-3xl p-8 shadow-[0_4px_20px_rgba(107,93,84,0.08)] border border-[#E8DDD0]/50 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-serif text-[#6B5D54] capitalize">
                    {selectedCategory}
                  </h3>
                  <p className="text-sm text-[#9B8B7E] mt-1">
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNewItemCategory(selectedCategory);
                    setShowAddModal(true);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#8B7355] hover:bg-[#75634A] text-white rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add New</span>
                </button>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-20 text-[#9B8B7E]">
                  <Upload className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-xl mb-2">
                    {searchQuery || filterTags.length > 0 ? 'No items match your search' : `Your ${selectedCategory} collection is empty`}
                  </p>
                  <p className="text-sm">
                    {searchQuery || filterTags.length > 0 ? 'Try different filters' : 'Add items to start building your wardrobe'}
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-3'
                }>
                  {filteredItems.map((item) => (
                    <div key={item.id} className={`group relative ${viewMode === 'list' ? 'flex items-center space-x-4 p-3 bg-[#FAF6F1] rounded-2xl' : ''}`}>
                      <button
                        onClick={() => addToOutfit(item)}
                        className={`relative overflow-hidden border-2 border-[#E8DDD0] hover:border-[#8B7355] transition-all hover:shadow-2xl bg-white ${
                          viewMode === 'grid' ? 'w-full aspect-square rounded-2xl' : 'w-24 h-24 rounded-xl flex-shrink-0'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-semibold">{item.name}</p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-xs text-white">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {viewMode === 'list' && (
                        <div className="flex-1">
                          <p className="font-medium text-[#6B5D54]">{item.name}</p>
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-white rounded-full text-xs text-[#9B8B7E]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Item actions */}
                      <div className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'right-3'} flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <Heart className={`w-4 h-4 ${item.favorite ? 'fill-red-500 text-red-500' : 'text-[#6B5D54]'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - Enhanced Outfit Canvas */}
          <div className="space-y-6">
            {/* Outfit Builder */}
            <div className="bg-white/60 backdrop-blur rounded-3xl p-6 shadow-[0_4px_20px_rgba(107,93,84,0.08)] border border-[#E8DDD0]/50 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-serif text-[#6B5D54]">Create Outfit</h3>
                  <p className="text-sm text-[#9B8B7E] mt-1">{currentOutfit.length} {currentOutfit.length === 1 ? 'piece' : 'pieces'}</p>
                </div>
                <div className="flex space-x-2">
                  {currentOutfit.length > 0 && (
                    <>
                      <button
                        onClick={exportOutfit}
                        className="p-2 bg-[#F5EFE7] hover:bg-[#E8DDD0] rounded-xl transition-all"
                        title="Export as image"
                      >
                        <Download className="w-5 h-5 text-[#6B5D54]" />
                      </button>
                      <button
                        onClick={clearOutfit}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                        title="Clear all"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedCanvasItem(null)}
                className="relative w-full h-[550px] bg-gradient-to-br from-[#FAF6F1] to-[#F5EFE7] rounded-2xl border-2 border-dashed border-[#D4C4B0] overflow-hidden mb-4 shadow-inner"
              >
                {currentOutfit.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9B8B7E]">
                    <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">Your canvas awaits</p>
                    <p className="text-center px-6 text-sm leading-relaxed">
                      Click items from your wardrobe to add them here
                      <br />
                      <span className="italic">Drag • Scale • Rotate • Layer</span>
                    </p>
                  </div>
                ) : (
                  currentOutfit.map((item) => (
                    <div
                      key={item.id}
                      className={`absolute cursor-move group ${selectedCanvasItem === item.id ? 'ring-2 ring-[#8B7355] ring-offset-2' : ''}`}
                      style={{
                        left: item.position?.x || 0,
                        top: item.position?.y || 0,
                        zIndex: item.zIndex || 1,
                        transform: `scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCanvasItem(item.id);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-32 h-32 object-contain rounded-xl shadow-2xl ring-4 ring-white/50"
                          draggable={false}
                        />
                        
                        {/* Item controls on hover/select */}
                        {selectedCanvasItem === item.id && (
                          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-1 bg-white/95 backdrop-blur rounded-full p-1 shadow-xl border border-[#E8DDD0]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                scaleItem(item.id, 0.1);
                              }}
                              className="p-1.5 hover:bg-[#F5EFE7] rounded-full transition-all"
                              title="Zoom in"
                            >
                              <ZoomIn className="w-4 h-4 text-[#6B5D54]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                scaleItem(item.id, -0.1);
                              }}
                              className="p-1.5 hover:bg-[#F5EFE7] rounded-full transition-all"
                              title="Zoom out"
                            >
                              <ZoomOut className="w-4 h-4 text-[#6B5D54]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rotateItem(item.id);
                              }}
                              className="p-1.5 hover:bg-[#F5EFE7] rounded-full transition-all"
                              title="Rotate"
                            >
                              <RotateCw className="w-4 h-4 text-[#6B5D54]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                bringToFront(item.id);
                              }}
                              className="p-1.5 hover:bg-[#F5EFE7] rounded-full transition-all"
                              title="Bring to front"
                            >
                              <Layers className="w-4 h-4 text-[#6B5D54]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromOutfit(item.id);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-full transition-all"
                              title="Remove"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        )}
                        
                        {/* Quick remove on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromOutfit(item.id);
                          }}
                          className="absolute -top-2 -right-2 p-1.5 bg-[#8B7355] hover:bg-[#6B5D54] text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        {/* Item name tag */}
                        <div className="absolute -bottom-6 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-center text-[#6B5D54] bg-white/90 backdrop-blur px-2 py-1 rounded-full mx-auto w-fit shadow-sm">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={saveOutfit}
                  disabled={currentOutfit.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-[#8B7355] to-[#75634A] hover:from-[#75634A] hover:to-[#6B5D54] text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400"
                >
                  <Save className="w-5 h-5" />
                  <span>Save This Outfit</span>
                </button>
                
                {selectedCanvasItem && (
                  <div className="text-center">
                    <p className="text-xs text-[#9B8B7E] italic">Click item to see controls • Drag to move</p>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Outfits */}
            {savedOutfits.length > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-3xl p-6 shadow-[0_4px_20px_rgba(107,93,84,0.08)] border border-[#E8DDD0]/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-serif text-[#6B5D54]">Saved Outfits</h3>
                  <span className="text-sm text-[#9B8B7E]">{savedOutfits.length} saved</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedOutfits.map((outfit) => (
                    <div
                      key={outfit.id}
                      className="p-4 bg-[#FAF6F1] hover:bg-[#F5EFE7] rounded-2xl transition-all group border border-[#E8DDD0]/50 hover:border-[#8B7355]/30"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => loadOutfit(outfit)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{outfit.thumbnail || '👗'}</div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#6B5D54] group-hover:text-[#8B7355] transition-colors">
                                {outfit.name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-[#9B8B7E]">{outfit.items.length} pieces</p>
                                {outfit.occasion && (
                                  <>
                                    <span className="text-[#D4C4B0]">•</span>
                                    <span className="text-xs text-[#9B8B7E]">{outfit.occasion}</span>
                                  </>
                                )}
                                {outfit.season && (
                                  <>
                                    <span className="text-[#D4C4B0]">•</span>
                                    <span className="text-xs text-[#9B8B7E]">{outfit.season}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOutfitFavorite(outfit.id);
                            }}
                            className="p-2 hover:bg-white rounded-full transition-all"
                          >
                            <Heart className={`w-4 h-4 ${outfit.favorite ? 'fill-red-500 text-red-500' : 'text-[#9B8B7E]'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOutfit(outfit.id);
                            }}
                            className="p-2 hover:bg-white rounded-full transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-[#E8DDD0] animate-in slide-in-from-bottom duration-300">
            <h3 className="text-3xl font-serif text-[#6B5D54] mb-6">Add to Wardrobe</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Vintage Floral Dress"
                  className="w-full px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none transition-colors bg-[#FAF6F1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newItemTags}
                  onChange={(e) => setNewItemTags(e.target.value)}
                  placeholder="e.g., casual, summer, floral"
                  className="w-full px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none bg-[#FAF6F1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-dashed border-[#D4C4B0] hover:border-[#8B7355] rounded-2xl transition-all bg-[#FAF6F1] hover:bg-[#F5EFE7]"
                >
                  <Upload className="w-5 h-5 text-[#8B7355]" />
                  <span className="text-[#6B5D54] font-medium">Choose Image</span>
                </button>
              </div>

              <div className="pt-4 border-t-2 border-[#E8DDD0]">
                <label className="block text-sm font-medium text-[#6B5D54] mb-2 flex items-center space-x-2">
                  <Wand2 className="w-4 h-4" />
                  <span>Or Generate with AI</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateWithAI()}
                    placeholder="Describe: 'cozy cream sweater'..."
                    className="flex-1 px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none bg-[#FAF6F1]"
                  />
                  <button
                    onClick={generateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-6 py-3 bg-[#8B7355] hover:bg-[#75634A] text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Generate</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#9B8B7E] mt-2 italic">
                  AI generates colored placeholders. Comment out lines 87-141 to disable.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItemName('');
                  setNewItemTags('');
                  setAiPrompt('');
                }}
                className="flex-1 px-6 py-3 bg-[#F5EFE7] hover:bg-[#E8DDD0] text-[#6B5D54] rounded-full font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Outfit Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8DDD0] animate-in slide-in-from-bottom duration-300">
            <h3 className="text-3xl font-serif text-[#6B5D54] mb-2">Save Your Creation</h3>
            <p className="text-sm text-[#9B8B7E] mb-6 italic">Preserve this moment of style inspiration</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Outfit Name *</label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g., Sunday Brunch, Date Night"
                  className="w-full px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none transition-colors bg-[#FAF6F1]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Occasion</label>
                <select
                  value={outfitOccasion}
                  onChange={(e) => setOutfitOccasion(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none bg-[#FAF6F1] cursor-pointer"
                >
                  <option value="">Select occasion...</option>
                  {occasions.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">Season</label>
                <select
                  value={outfitSeason}
                  onChange={(e) => setOutfitSeason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E8DDD0] rounded-2xl focus:border-[#8B7355] focus:outline-none bg-[#FAF6F1] cursor-pointer"
                >
                  <option value="">Select season...</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setOutfitName('');
                  setOutfitOccasion('');
                  setOutfitSeason('');
                }}
                className="flex-1 px-6 py-3 bg-[#F5EFE7] hover:bg-[#E8DDD0] text-[#6B5D54] rounded-full font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveOutfit}
                disabled={!outfitName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B7355] to-[#75634A] hover:from-[#75634A] hover:to-[#6B5D54] text-white rounded-full font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Outfit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F5EFE7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4C4B0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B7355;
        }
      `}</style>
    </div>
  );
};

export default Closet;