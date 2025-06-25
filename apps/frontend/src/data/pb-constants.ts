// Port Battle Constants and Data

export const SHIP_NAMES_WITH_BR = {
  "Duke Of Kent": 353,
  "Santisima": 278,
  "L'Ocean": 239,
  "Santa Ana": 225,
  "DLC Victory": 224,
  "Victory": 216,
  "Christian VII": 164,
  "San Pedro": 164,
  "Implacable": 163,
  "Bucentaure": 161,
  "St. Pavel": 150,
  "ADR": 143,
  "Bellona": 134,
  "3rd Rate (74)": 132,
  "Wasa": 125,
  "Wapen von Hamburg III": 120,
  "Agamemnon": 114,
  "Ingermanland": 111,
  "Rättvisan": 107,
  "USS United States": 96,
  "Constitution": 96,
  "Leopard": 95,
  "Endymion": 85,
  "Trincomalee": 87,
  "Indefatigable": 79,
  "Diana": 78,
  "L'Hermione": 72,
  "Santa Cecilia": 72,
  "Essex": 71,
  "Pirate Frigate(Cherubim)": 67,
  "Frigate (Cherubim)": 66,
  "Belle Poule": 65,
  "Pandora": 65,
  "Surprise": 64,
  "Hercules": 58,
  "LGV Refit": 40,
  "Renommee": 38,
  "Indiaman": 37,
  "Cerberus": 33,
  "Rattlesnake Heavy": 32,
  "Le Requin": 30,
  "Le Gros Ventre": 28,
  "Snow (Ontario)": 27,
  "Trader Snow": 26,
  "Niagara": 25,
  "Mercury": 25,
  "Prince de Neufchatel": 25,
  "Rattlesnake": 22,
  "Navy Brig (Fair American)": 22,
  "Brig (Fair American)": 20,
  "Pickle": 15,
  "Yacht": 15,
  "Privateer": 15,
  "Cutter (Alert)": 15,
  "Mortar Brig": 15,
  "Trader Lynx": 13,
  "Lynx": 13
} as const;

export const SHIP_NAMES = Object.keys(SHIP_NAMES_WITH_BR);

export const CLAN_NAMES = [
  "[CLAN1]",
  "[CLAN2]", 
  "[CLAN3]",
  "[CLAN4]",
  "[CLAN5]",
  "Independent"
] as const;

export const NATIONS = [
  "Great Britain",
  "United States of America (USA)",
  "France", 
  "the Pirates",
  "Russia",
  "Sweden"
] as const;

export const WATER_TYPES = ["Deep Water", "Shallow Water"] as const;

export const SCREENING_TYPES = ["Offensive", "Defensive"] as const;

export const RATE_CATEGORIES = [
  "1st Rate",
  "2nd Rate", 
  "3rd Rate",
  "4th Rate",
  "5th Rate",
  "6th Rate",
  "7th Rate"
] as const;

export const ADMIN_DISCORD_IDS = [
  "1207434980855259206" // Your Discord ID
] as const;

// Helper function to get ship BR
export function getShipBR(shipName: string): number {
  return SHIP_NAMES_WITH_BR[shipName as keyof typeof SHIP_NAMES_WITH_BR] || 0;
}

// Helper function to categorize ships by rate
export function getShipsByRate(): Record<string, string[]> {
  const shipsByRate: Record<string, string[]> = {
    "1st Rate": [],
    "2nd Rate": [],
    "3rd Rate": [],
    "4th Rate": [],
    "5th Rate": [],
    "6th Rate": [],
    "7th Rate": []
  };

  Object.entries(SHIP_NAMES_WITH_BR).forEach(([ship, br]) => {
    if (br >= 200) {
      shipsByRate["1st Rate"].push(ship);
    } else if (br >= 150) {
      shipsByRate["2nd Rate"].push(ship);
    } else if (br >= 120) {
      shipsByRate["3rd Rate"].push(ship);
    } else if (br >= 80) {
      shipsByRate["4th Rate"].push(ship);
    } else if (br >= 60) {
      shipsByRate["5th Rate"].push(ship);
    } else if (br >= 30) {
      shipsByRate["6th Rate"].push(ship);
    } else {
      shipsByRate["7th Rate"].push(ship);
    }
  });

  return shipsByRate;
}
