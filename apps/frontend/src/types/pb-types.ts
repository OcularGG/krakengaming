// Port Battle Types

export interface PortBattle {
  id: string;
  portName: string;
  serverMeetupTime: string; // ISO string
  serverBattleStartTime: string; // ISO string
  waterType: 'Deep Water' | 'Shallow Water';
  meetupLocation: string;
  pbCommanderName: string;
  secondICCommanderName: string;
  reqCommanderName: string;
  totalBRLimit: number;
  createdBy: string; // User ID
  createdAt: string;
  activeFleetId: string; // Which fleet composition is currently active
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface FleetComposition {
  id: string;
  portBattleId: string;
  name: string; // "Main Fleet", "Alternate Fleet 1", "Alternate Fleet 2"
  type: 'main' | 'alternate1' | 'alternate2';
  roles: FleetRole[];
  createdAt: string;
}

export interface FleetRole {
  id: string;
  fleetId: string;
  name: string; // e.g., "Main Line DPS", "Escort"
  expectedShip?: string; // Optional expected ship
  position: number; // Order in the fleet
  signUp?: SignUp; // Current sign-up for this role
}

export interface SignUp {
  id: string;
  roleId: string;
  userId: string;
  userName: string;
  clan: string;
  captainName: string;
  comments: string;
  ship: string;
  books: number; // 1-5
  alternateShip: string;
  alternateBooks: number; // 1-5
  willingToScreen: boolean;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ScreeningFleet {
  id: string;
  portBattleId: string;
  screeningType: 'Offensive' | 'Defensive';
  observation: string;
  shipsRequired: string[]; // Specific ships
  ratesRequired: string[]; // Rate categories
  nation: string;
  commanderName: string;
  signUps: ScreeningSignUp[];
  createdAt: string;
}

export interface ScreeningSignUp {
  id: string;
  screeningFleetId: string;
  userId: string;
  userName: string;
  clan: string;
  captainName: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
}

export interface StandbySignUp {
  id: string;
  portBattleId: string;
  userId: string;
  userName: string;
  clan: string;
  captainName: string;
  comments: string;
  ship: string;
  books: number;
  alternateShip: string;
  alternateBooks: number;
  willingToScreen: boolean;
  submittedAt: string;
}

export interface User {
  id: string;
  discordId: string;
  userName: string;
  isAdmin: boolean;
  permissions: {
    canCreatePortBattles: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
}

export interface CreatePortBattleRequest {
  portName: string;
  serverMeetupTime: string;
  serverBattleStartTime: string;
  waterType: 'Deep Water' | 'Shallow Water';
  meetupLocation: string;
  pbCommanderName: string;
  secondICCommanderName: string;
  reqCommanderName: string;
  totalBRLimit: number;
  mainFleetRoles: { name: string; expectedShip?: string }[];
  alternateFleet1Roles?: { name: string; expectedShip?: string }[];
  alternateFleet2Roles?: { name: string; expectedShip?: string }[];
}

export interface CreateSignUpRequest {
  roleId: string;
  clan: string;
  captainName: string;
  comments: string;
  ship: string;
  books: number;
  alternateShip: string;
  alternateBooks: number;
  willingToScreen: boolean;
}

export interface CreateStandbySignUpRequest {
  portBattleId: string;
  clan: string;
  captainName: string;
  comments: string;
  ship: string;
  books: number;
  alternateShip: string;
  alternateBooks: number;
  willingToScreen: boolean;
}

export interface CreateScreeningFleetRequest {
  portBattleId: string;
  screeningType: 'Offensive' | 'Defensive';
  observation: string;
  shipsRequired: string[];
  ratesRequired: string[];
  nation: string;
  commanderName: string;
}
