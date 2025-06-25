// Port Battle Types
export interface Ship {
  name: string;
  br: number;
}

export interface Captain {
  id: string;
  name: string;
  clan: string;
  ship: string;
  books: number; // 1-5
  alternateShip: string;
  alternateBooks: number; // 1-5
  willingToScreen: boolean;
  comments?: string;
  status: 'pending' | 'approved' | 'denied';
  signedUpAt: Date;
}

export interface FleetRole {
  id: string;
  position: number;
  captain?: Captain;
  assignedShip?: string;
  assignedBR?: number;
}

export interface ScreeningFleet {
  id: string;
  type: 'offensive' | 'defensive';
  observation: string;
  shipRequirements: string[]; // Either specific ships or "1st Rate", "2nd Rate", etc.
  nation: 'Great Britain' | 'United States of America (USA)' | 'France' | 'Pirates' | 'Russia' | 'Sweden';
  commander: string;
  captains: {
    name: string;
    clan: string;
    status: 'pending' | 'approved' | 'denied';
  }[];
}

export interface PortBattle {
  id: string;
  port: string;
  meetupTimeUTC: Date;
  battleStartTimeUTC: Date;
  waterType: 'Deep Water' | 'Shallow Water';
  meetupLocation: string;
  
  // Fleet Management
  maxCaptains: number; // up to 100
  displayedRoles: number; // number of roles to show
  brLimit: number;
  currentBR: number;
  
  // Commanders
  pbCommander: string;
  secondInCommand: string;
  reqCommander: string;
  
  // Fleet Compositions (up to 3: main + 2 alternates)
  fleetCompositions: {
    id: string;
    name: string;
    isActive: boolean;
    roles: FleetRole[];
  }[];
  
  // Screening Fleets
  screeningFleets: ScreeningFleet[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'active' | 'completed';
}

export interface CreatePortBattleRequest {
  port: string;
  meetupTimeUTC: string;
  battleStartTimeUTC: string;
  waterType: 'Deep Water' | 'Shallow Water';
  meetupLocation: string;
  displayedRoles: number;
  brLimit: number;
  pbCommander: string;
  secondInCommand: string;
  reqCommander: string;
}

export interface SignUpRequest {
  portBattleId: string;
  roleId: string;
  ship: string;
  books: number;
  alternateShip: string;
  alternateBooks: number;
  willingToScreen: boolean;
  comments?: string;
}

export interface ScreeningSignUpRequest {
  screeningFleetId: string;
  clan: string;
}

// Available clans (to be populated from your actual clan list)
export const AVAILABLE_CLANS = [
  // You'll need to provide the actual clan names
  'Clan 1',
  'Clan 2',
  'Clan 3'
  // ... add all your clans
];

// Ship list with BR values
export const SHIPS: Ship[] = [
  { name: 'Santisima', br: 278 },
  { name: "L'Ocean", br: 239 },
  { name: 'Santa Ana', br: 225 },
  { name: 'Victory', br: 216 },
  { name: 'DLC Victory', br: 224 },
  { name: 'Christian VII', br: 164 },
  { name: 'Bucentaure', br: 161 },
  { name: 'Redoutable', br: 148 },
  { name: 'Implacable', br: 163 },
  { name: 'St. Pavel', br: 150 },
  { name: 'Bellona', br: 134 },
  { name: '3rd Rate (74)', br: 132 },
  { name: 'Wasa', br: 125 },
  { name: 'USS United States (previously Constitution)', br: 96 },
  { name: 'Constitution (previously classic)', br: 96 },
  { name: 'Rättvisan', br: 107 },
  { name: 'Agamemnon', br: 114 },
  { name: 'Leopard', br: 95 },
  { name: 'Indefatigable', br: 79 },
  { name: 'Ingermanland', br: 111 },
  { name: 'Wapen von Hamburg III', br: 120 },
  { name: 'Endymion', br: 85 },
  { name: 'Trincomalee', br: 87 },
  { name: 'Diana', br: 78 },
  { name: "L'Hermione", br: 72 },
  { name: 'Santa Cecilia', br: 72 },
  { name: 'Essex', br: 71 },
  { name: 'Pirate Frigate(Cherubim)', br: 67 },
  { name: 'Belle Poule', br: 65 },
  { name: 'Frigate (Cherubim)', br: 66 },
  { name: 'LGV Refit', br: 40 },
  { name: 'Indiaman', br: 37 },
  { name: 'Surprise', br: 64 },
  { name: 'Renommee', br: 38 },
  { name: 'Le Gros Ventre', br: 28 },
  { name: 'Hercules', br: 58 },
  { name: 'Rattlesnake Heavy', br: 32 },
  { name: 'Pandora', br: 65 },
  { name: 'Le Requin', br: 30 },
  { name: 'Cerberus', br: 33 },
  { name: 'Niagara', br: 25 },
  { name: 'Mortar Brig', br: 15 },
  { name: 'Prince de Neufchatel', br: 25 },
  { name: 'Snow (Ontario)', br: 27 },
  { name: 'Mercury', br: 25 },
  { name: 'Rattlesnake', br: 22 },
  { name: 'Navy Brig (Fair American)', br: 22 },
  { name: 'Trader Snow', br: 26 },
  { name: 'Brig (Fair American)', br: 20 },
  { name: 'Pickle', br: 15 },
  { name: 'Yacht', br: 15 },
  { name: 'Privateer', br: 15 },
  { name: 'Cutter (Alert)', br: 15 },
  { name: 'Trader Lynx', br: 13 },
  { name: 'Lynx', br: 13 },
  { name: 'ADR', br: 143 },
  { name: 'Duke Of Kent', br: 353 },
  { name: 'San Pedro', br: 164 }
];

export const SHIP_NAMES = SHIPS.map(ship => ship.name);

export const NATIONS = [
  'Great Britain',
  'United States of America (USA)',
  'France',
  'Pirates',
  'Russia',
  'Sweden'
] as const;

export const SHIP_RATES = [
  '1st Rate',
  '2nd Rate', 
  '3rd Rate',
  '4th Rate',
  '5th Rate',
  '6th Rate',
  '7th Rate'
] as const;
