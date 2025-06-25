'use client';

import { useState, useEffect } from 'react';

// Naval Action API endpoints
const API_ENDPOINTS = {
  itemTemplates: 'https://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json',
  shops: 'https://storage.googleapis.com/nacleanopenworldprodshards/Shops_cleanopenworldprodeu1.json',
  ports: 'https://storage.googleapis.com/nacleanopenworldprodshards/Ports_cleanopenworldprodeu1.json',
  nations: 'https://storage.googleapis.com/nacleanopenworldprodshards/Nations_cleanopenworldprodeu1.json'
};

// Item category mappings
const ITEM_CATEGORIES = {
  ships: {
    name: 'Ships',
    subcategories: {
      'first-rates': 'First Rates (100+ guns)',
      'second-rates': 'Second Rates (80-98 guns)', 
      'third-rates': 'Third Rates (64-80 guns)',
      'fourth-rates': 'Fourth Rates (50-60 guns)',
      'fifth-rates': 'Fifth Rates (32-44 guns)',
      'sixth-rates': 'Sixth Rates (20-30 guns)',
      'unrated': 'Unrated Vessels (<20 guns)',
      'special': 'Special & DLC Ships'
    }
  },
  cannons: {
    name: 'Cannons',
    subcategories: {
      'long-guns': 'Long Guns',
      'medium-guns': 'Medium Guns', 
      'carronades': 'Carronades',
      'mortars': 'Mortars & Special'
    }
  },
  ammunition: {
    name: 'Ammunition',
    subcategories: {
      'round-shot': 'Round Shot',
      'chain-shot': 'Chain Shot',
      'grape-shot': 'Grape Shot',
      'explosive-shot': 'Explosive Shot',
      'special-ammo': 'Special Ammunition'
    }
  },
  upgrades: {
    name: 'Ship Upgrades',
    subcategories: {
      'hull': 'Hull Upgrades',
      'rigging': 'Rigging Upgrades', 
      'crew': 'Crew Upgrades',
      'special': 'Special Upgrades'
    }
  },
  resources: {
    name: 'Resources & Materials',
    subcategories: {
      'basic': 'Basic Resources',
      'rare': 'Rare Materials',
      'crafting': 'Crafting Components',
      'trade': 'Trade Goods'
    }
  },
  books: {
    name: 'Knowledge Books',
    subcategories: {
      'gunnery': 'Gunnery Books',
      'sailing': 'Sailing Books',
      'boarding': 'Boarding Books',
      'special': 'Special Books'
    }
  }
};

interface ItemTemplate {
  Id: number;
  Name: string;
  ItemType: string;
  ItemSubType?: string;
  MaxStack: number;
  NotUsed: boolean;
  CanBeTraded: boolean;
  SortingGroup: string;
  ItemWeight: number;
  [key: string]: any;
}

interface Port {
  Id: number;
  Name: string;
  Nation: number;
  County: string;
  IsCapital: boolean;
  PortPoints: number;
  [key: string]: any;
}

interface Nation {
  Id: number;
  Name: string;
  ShortName: string;
  [key: string]: any;
}

interface CategorizedData {
  [category: string]: {
    [subcategory: string]: ItemTemplate[];
  };
}

export default function NavalActionAPIPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemTemplates, setItemTemplates] = useState<ItemTemplate[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [nations, setNations] = useState<Nation[]>([]);
  const [categorizedItems, setCategorizedItems] = useState<CategorizedData>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIData();
  }, []);

  const fetchAPIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all API data
      const [itemsResponse, portsResponse, nationsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.itemTemplates),
        fetch(API_ENDPOINTS.ports), 
        fetch(API_ENDPOINTS.nations)
      ]);

      if (!itemsResponse.ok || !portsResponse.ok || !nationsResponse.ok) {
        throw new Error('Failed to fetch API data');
      }

      const [itemsData, portsData, nationsData] = await Promise.all([
        itemsResponse.json(),
        portsResponse.json(),
        nationsResponse.json()
      ]);

      setItemTemplates(itemsData);
      setPorts(portsData);
      setNations(nationsData);

      // Categorize the items
      const categorized = categorizeItems(itemsData);
      setCategorizedItems(categorized);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const categorizeItems = (items: ItemTemplate[]): CategorizedData => {
    const categorized: CategorizedData = {};
    
    // Initialize categories
    Object.keys(ITEM_CATEGORIES).forEach(category => {
      categorized[category] = {};
      Object.keys(ITEM_CATEGORIES[category as keyof typeof ITEM_CATEGORIES].subcategories).forEach(subcategory => {
        categorized[category][subcategory] = [];
      });
    });

    items.forEach(item => {
      if (item.NotUsed) return; // Skip unused items

      const itemType = item.ItemType?.toLowerCase() || '';
      const itemSubType = item.ItemSubType?.toLowerCase() || '';
      const itemName = item.Name?.toLowerCase() || '';
      const sortingGroup = item.SortingGroup?.toLowerCase() || '';

      // Categorize ships
      if (itemType.includes('ship') || sortingGroup.includes('ship')) {
        categorizeShip(item, categorized);
      }
      // Categorize cannons
      else if (itemType.includes('cannon') || itemName.includes('gun') || itemName.includes('carronade') || itemName.includes('mortar')) {
        categorizeCannon(item, categorized);
      }
      // Categorize ammunition  
      else if (itemType.includes('ammunition') || itemName.includes('shot') || itemName.includes('ball')) {
        categorizeAmmunition(item, categorized);
      }
      // Categorize upgrades
      else if (itemType.includes('upgrade') || sortingGroup.includes('upgrade')) {
        categorizeUpgrade(item, categorized);
      }
      // Categorize books
      else if (itemType.includes('book') || itemName.includes('book') || sortingGroup.includes('book')) {
        categorizeBook(item, categorized);
      }
      // Categorize resources
      else if (itemType.includes('resource') || itemType.includes('material') || sortingGroup.includes('resource')) {
        categorizeResource(item, categorized);
      }
    });

    return categorized;
  };

  const categorizeShip = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    // First rates (100+ guns)
    if (name.includes('santisima') || name.includes('ocean') || name.includes('santa ana') || 
        name.includes('victory') || name.includes('christian vii')) {
      categorized.ships['first-rates'].push(item);
    }
    // Second rates (80-98 guns)
    else if (name.includes('bucentaure') || name.includes('redoutable') || name.includes('implacable')) {
      categorized.ships['second-rates'].push(item);
    }
    // Third rates (64-80 guns) 
    else if (name.includes('bellona') || name.includes('3rd rate') || name.includes('74') || name.includes('wasa')) {
      categorized.ships['third-rates'].push(item);
    }
    // Fourth rates (50-60 guns)
    else if (name.includes('constitution') || name.includes('united states') || name.includes('agamemnon')) {
      categorized.ships['fourth-rates'].push(item);
    }
    // Fifth rates (32-44 guns)
    else if (name.includes('frigate') || name.includes('endymion') || name.includes('trincomalee') || 
             name.includes('hermione') || name.includes('surprise')) {
      categorized.ships['fifth-rates'].push(item);
    }
    // Sixth rates (20-30 guns)
    else if (name.includes('brig') || name.includes('snow') || name.includes('mercury') || name.includes('prince')) {
      categorized.ships['sixth-rates'].push(item);
    }
    // Unrated (<20 guns)
    else if (name.includes('cutter') || name.includes('lynx') || name.includes('pickle') || name.includes('yacht')) {
      categorized.ships['unrated'].push(item);
    }
    // Special/DLC
    else {
      categorized.ships['special'].push(item);
    }
  };

  const categorizeCannon = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    if (name.includes('long') || name.includes('culverin')) {
      categorized.cannons['long-guns'].push(item);
    } else if (name.includes('carronade')) {
      categorized.cannons['carronades'].push(item);
    } else if (name.includes('mortar') || name.includes('howitzer')) {
      categorized.cannons['mortars'].push(item);
    } else {
      categorized.cannons['medium-guns'].push(item);
    }
  };

  const categorizeAmmunition = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    if (name.includes('round') || name.includes('ball')) {
      categorized.ammunition['round-shot'].push(item);
    } else if (name.includes('chain')) {
      categorized.ammunition['chain-shot'].push(item);
    } else if (name.includes('grape')) {
      categorized.ammunition['grape-shot'].push(item);
    } else if (name.includes('explosive') || name.includes('heated')) {
      categorized.ammunition['explosive-shot'].push(item);
    } else {
      categorized.ammunition['special-ammo'].push(item);
    }
  };

  const categorizeUpgrade = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    if (name.includes('hull') || name.includes('planking') || name.includes('frame')) {
      categorized.upgrades['hull'].push(item);
    } else if (name.includes('sail') || name.includes('rigging') || name.includes('mast')) {
      categorized.upgrades['rigging'].push(item);
    } else if (name.includes('crew') || name.includes('marine') || name.includes('officer')) {
      categorized.upgrades['crew'].push(item);
    } else {
      categorized.upgrades['special'].push(item);
    }
  };

  const categorizeBook = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    if (name.includes('gun') || name.includes('cannon') || name.includes('accuracy')) {
      categorized.books['gunnery'].push(item);
    } else if (name.includes('sail') || name.includes('speed') || name.includes('wind')) {
      categorized.books['sailing'].push(item);
    } else if (name.includes('board') || name.includes('crew') || name.includes('marine')) {
      categorized.books['boarding'].push(item);
    } else {
      categorized.books['special'].push(item);
    }
  };

  const categorizeResource = (item: ItemTemplate, categorized: CategorizedData) => {
    const name = item.Name?.toLowerCase() || '';
    
    if (name.includes('wood') || name.includes('iron') || name.includes('coal') || name.includes('cotton')) {
      categorized.resources['basic'].push(item);
    } else if (name.includes('rare') || name.includes('gold') || name.includes('silver') || name.includes('precious')) {
      categorized.resources['rare'].push(item);
    } else if (name.includes('craft') || name.includes('component') || name.includes('part')) {
      categorized.resources['crafting'].push(item);
    } else {
      categorized.resources['trade'].push(item);
    }
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: { total: number; subcategories: { [key: string]: number } } } = {};
    
    Object.keys(categorizedItems).forEach(category => {
      stats[category] = { total: 0, subcategories: {} };
      Object.keys(categorizedItems[category]).forEach(subcategory => {
        const count = categorizedItems[category][subcategory].length;
        stats[category].subcategories[subcategory] = count;
        stats[category].total += count;
      });
    });
    
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 loading-anchor">⚓</div>
            <h1 className="text-4xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Loading Naval Action API Data...
            </h1>
            <p className="text-sail-white/80 text-xl" style={{fontFamily: 'Crimson Text, serif'}}>
              Fetching item templates, ports, and nations data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light p-8">
        <div className="max-w-7xl mx-auto">
          <div className="neo-brutal-box bg-red-100 border-red-400 p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Error Loading Data</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchAPIData}
              className="neo-brutal-button bg-red-500 text-white px-6 py-3"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Naval Action API Explorer
          </h1>
          <p className="text-sail-white/80 text-xl max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Explore and categorize all items, ships, cannons, and resources from the Naval Action game data.
            Data sourced from the official Naval Action API.
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="neo-brutal-box p-6 bg-sail-white">
            <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Total Items
            </h3>
            <p className="text-3xl font-bold text-brass">{itemTemplates.length}</p>
          </div>
          <div className="neo-brutal-box p-6 bg-sail-white">
            <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Total Ports
            </h3>
            <p className="text-3xl font-bold text-brass">{ports.length}</p>
          </div>
          <div className="neo-brutal-box p-6 bg-sail-white">
            <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Nations
            </h3>
            <p className="text-3xl font-bold text-brass">{nations.length}</p>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="neo-brutal-box p-6 mb-8 bg-sail-white">
          <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
            Item Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ITEM_CATEGORIES).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => {
                  setSelectedCategory(categoryKey);
                  setSelectedSubcategory(null);
                }}
                className={`neo-brutal-button p-4 text-left transition-all ${
                  selectedCategory === categoryKey 
                    ? 'bg-brass text-navy-dark transform scale-105' 
                    : 'bg-cannon-smoke text-sail-white hover:bg-cannon-smoke/80'
                }`}
              >
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <p className="text-sm opacity-80">
                  {stats[categoryKey]?.total || 0} items
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory View */}
        {selectedCategory && (
          <div className="neo-brutal-box p-6 mb-8 bg-sail-white">
            <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              {ITEM_CATEGORIES[selectedCategory as keyof typeof ITEM_CATEGORIES].name} - Subcategories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ITEM_CATEGORIES[selectedCategory as keyof typeof ITEM_CATEGORIES].subcategories).map(([subcategoryKey, subcategoryName]) => (
                <button
                  key={subcategoryKey}
                  onClick={() => setSelectedSubcategory(subcategoryKey)}
                  className={`neo-brutal-button p-3 text-left transition-all ${
                    selectedSubcategory === subcategoryKey 
                      ? 'bg-brass text-navy-dark' 
                      : 'bg-ocean-medium text-sail-white hover:bg-ocean-medium/80'
                  }`}
                >
                  <h4 className="font-semibold mb-1">{subcategoryName}</h4>
                  <p className="text-sm opacity-80">
                    {stats[selectedCategory]?.subcategories[subcategoryKey] || 0} items
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item Details View */}
        {selectedCategory && selectedSubcategory && (
          <div className="neo-brutal-box p-6 bg-sail-white">
            <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              {(ITEM_CATEGORIES[selectedCategory as keyof typeof ITEM_CATEGORIES].subcategories as any)[selectedSubcategory]} 
              ({categorizedItems[selectedCategory]?.[selectedSubcategory]?.length || 0} items)
            </h2>
            
            {categorizedItems[selectedCategory]?.[selectedSubcategory]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedItems[selectedCategory][selectedSubcategory].map((item) => (
                  <div key={item.Id} className="border border-navy-dark/20 p-4 rounded">
                    <h3 className="font-bold text-navy-dark mb-2">{item.Name}</h3>
                    <div className="text-sm text-navy-dark/70 space-y-1">
                      <p><strong>Type:</strong> {item.ItemType}</p>
                      {item.ItemSubType && <p><strong>Subtype:</strong> {item.ItemSubType}</p>}
                      <p><strong>Weight:</strong> {item.ItemWeight}</p>
                      <p><strong>Max Stack:</strong> {item.MaxStack}</p>
                      <p><strong>Tradeable:</strong> {item.CanBeTraded ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-navy-dark/70 text-center py-8">No items found in this subcategory</p>
            )}
          </div>
        )}

        {/* Ports Section */}
        {!selectedCategory && (
          <div className="neo-brutal-box p-6 mb-8 bg-sail-white">
            <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              Ports by Nation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nations.map((nation) => {
                const nationPorts = ports.filter(port => port.Nation === nation.Id);
                const capitals = nationPorts.filter(port => port.IsCapital);
                
                return (
                  <div key={nation.Id} className="border border-navy-dark/20 p-4 rounded">
                    <h3 className="font-bold text-lg text-navy-dark mb-2">{nation.Name}</h3>
                    <p className="text-sm text-navy-dark/70 mb-2">
                      {nationPorts.length} ports ({capitals.length} capital{capitals.length !== 1 ? 's' : ''})
                    </p>
                    <div className="text-xs text-navy-dark/60">
                      <p><strong>Capitals:</strong> {capitals.map(c => c.Name).join(', ') || 'None'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
