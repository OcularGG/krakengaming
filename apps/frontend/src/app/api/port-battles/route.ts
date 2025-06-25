import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { 
  PortBattle, 
  FleetComposition, 
  SignUp, 
  ScreeningFleet, 
  StandbySignUp,
  CreatePortBattleRequest,
  CreateSignUpRequest,
  CreateStandbySignUpRequest,
  CreateScreeningFleetRequest,
  FleetRole
} from '@/types/pb-types';
import { ADMIN_DISCORD_IDS, SHIP_NAMES_WITH_BR } from '@/data/pb-constants';

// In-memory storage for port battles (replace with database in production)
let portBattles: PortBattle[] = [];
let fleetCompositions: FleetComposition[] = [];
let standbySignUps: StandbySignUp[] = [];
let nextPortBattleId = 1;
let nextSignUpId = 1;
let nextStandbyId = 1;
let nextScreeningId = 1;
let nextRoleId = 1;
let nextFleetId = 1;

// Initialize with sample data
const initializeSampleData = () => {
  if (portBattles.length === 0) {
    // Create sample port battles
    const pb1: PortBattle = {
      id: "pb-1",
      portName: "Havana",
      serverMeetupTime: "2025-06-30T18:00:00.000Z",
      serverBattleStartTime: "2025-06-30T19:00:00.000Z",
      waterType: "Deep Water",
      meetupLocation: "Havana Port",
      pbCommanderName: "Admiral Nelson",
      secondICCommanderName: "Captain Hardy",
      reqCommanderName: "Captain Pellew",
      totalBRLimit: 2500,
      createdBy: "1207434980855259206",
      activeFleetId: "fleet-main-1",
      status: "active",
      createdAt: "2025-06-24T10:00:00.000Z"
    };

    const pb2: PortBattle = {
      id: "pb-2",
      portName: "Cartagena",
      serverMeetupTime: "2025-07-02T17:30:00.000Z",
      serverBattleStartTime: "2025-07-02T18:30:00.000Z",
      waterType: "Shallow Water",
      meetupLocation: "Cartagena Port",
      pbCommanderName: "Admiral Collingwood",
      secondICCommanderName: "Captain Troubridge",
      reqCommanderName: "Captain Fremantle",
      totalBRLimit: 2000,
      createdBy: "1207434980855259206",
      activeFleetId: "fleet-main-2",
      status: "active",
      createdAt: "2025-06-26T10:00:00.000Z"
    };

    portBattles = [pb1, pb2];

    // Create sample fleet compositions
    const mainFleet1: FleetComposition = {
      id: "fleet-main-1",
      portBattleId: "pb-1",
      name: "Main Fleet",
      type: "main",
      roles: [
        { 
          id: "role-1", 
          fleetId: "fleet-main-1", 
          name: "Main Line DPS", 
          expectedShip: "Victory", 
          position: 1,
          signUp: {
            id: "signup-1",
            roleId: "role-1",
            userId: "player-1",
            userName: "Captain Smith",
            clan: "CLAN1",
            captainName: "Captain Smith",
            comments: "Ready for battle!",
            ship: "Victory",
            books: 5,
            alternateShip: "Bellona",
            alternateBooks: 4,
            willingToScreen: true,
            status: "approved",
            submittedAt: "2025-06-25T10:00:00.000Z",
            approvedAt: "2025-06-25T11:00:00.000Z",
            approvedBy: "1207434980855259206"
          }
        },
        { 
          id: "role-2", 
          fleetId: "fleet-main-1", 
          name: "Support Line", 
          expectedShip: "Bellona", 
          position: 2 
        },
        { 
          id: "role-3", 
          fleetId: "fleet-main-1", 
          name: "Escort Frigate", 
          expectedShip: "Endymion", 
          position: 3 
        },
        { 
          id: "role-4", 
          fleetId: "fleet-main-1", 
          name: "Scout", 
          expectedShip: "Diana", 
          position: 4 
        },
        { 
          id: "role-5", 
          fleetId: "fleet-main-1", 
          name: "Reserve Line", 
          expectedShip: "3rd Rate (74)", 
          position: 5 
        }
      ],
      createdAt: "2025-06-24T10:00:00.000Z"
    };

    const altFleet1: FleetComposition = {
      id: "fleet-alt1-1",
      portBattleId: "pb-1",
      name: "Alternate Fleet 1",
      type: "alternate1",
      roles: [
        { 
          id: "role-alt1-1", 
          fleetId: "fleet-alt1-1", 
          name: "Heavy Line", 
          expectedShip: "Santisima", 
          position: 1 
        },
        { 
          id: "role-alt1-2", 
          fleetId: "fleet-alt1-1", 
          name: "Support", 
          expectedShip: "Bucentaure", 
          position: 2 
        },
        { 
          id: "role-alt1-3", 
          fleetId: "fleet-alt1-1", 
          name: "Frigate Screen", 
          expectedShip: "Trincomalee", 
          position: 3 
        }
      ],
      createdAt: "2025-06-24T10:00:00.000Z"
    };

    const mainFleet2: FleetComposition = {
      id: "fleet-main-2",
      portBattleId: "pb-2",
      name: "Main Fleet",
      type: "main",
      roles: [
        { 
          id: "role-2-1", 
          fleetId: "fleet-main-2", 
          name: "Line Ship", 
          expectedShip: "Christian VII", 
          position: 1 
        },
        { 
          id: "role-2-2", 
          fleetId: "fleet-main-2", 
          name: "Support", 
          expectedShip: "Wasa", 
          position: 2 
        },
        { 
          id: "role-2-3", 
          fleetId: "fleet-main-2", 
          name: "Frigate", 
          expectedShip: "L'Hermione", 
          position: 3 
        },
        { 
          id: "role-2-4", 
          fleetId: "fleet-main-2", 
          name: "Fast Scout", 
          expectedShip: "Mercury", 
          position: 4 
        }
      ],
      createdAt: "2025-06-26T10:00:00.000Z"
    };

    fleetCompositions = [mainFleet1, altFleet1, mainFleet2];

    // Create sample standby sign-ups
    standbySignUps = [
      {
        id: "standby-1",
        portBattleId: "pb-1",
        userId: "player-3",
        userName: "Captain Brown",
        clan: "CLAN3",
        captainName: "Captain Brown",
        comments: "Happy to help if needed",
        ship: "Agamemnon",
        books: 4,
        alternateShip: "Bellona",
        alternateBooks: 3,
        willingToScreen: true,
        submittedAt: "2025-06-25T12:00:00.000Z"
      }
    ];
  }
};

// Helper functions
const isAdmin = (userId: string | undefined) => {
  return userId && ADMIN_DISCORD_IDS.includes(userId as any);
};

const generateId = (type: string) => {
  switch (type) {
    case 'pb': return `pb-${nextPortBattleId++}`;
    case 'signup': return `signup-${nextSignUpId++}`;
    case 'standby': return `standby-${nextStandbyId++}`;
    case 'screening': return `screening-${nextScreeningId++}`;
    case 'role': return `role-${nextRoleId++}`;
    case 'fleet': return `fleet-${nextFleetId++}`;
    default: return `${type}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// GET - Fetch port battles and related data
export async function GET(request: NextRequest) {
  try {
    initializeSampleData();
    
    const { searchParams } = new URL(request.url);
    const pbId = searchParams.get('pbId');
    const includeFleets = searchParams.get('includeFleets') === 'true';
    const includeStandby = searchParams.get('includeStandby') === 'true';
    
    if (pbId) {
      const portBattle = portBattles.find(pb => pb.id === pbId);
      if (!portBattle) {
        return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
      }
      
      let response: any = { ...portBattle };
      
      if (includeFleets) {
        response.fleetCompositions = fleetCompositions.filter(fc => fc.portBattleId === pbId);
      }
      
      if (includeStandby) {
        response.standbySignUps = standbySignUps.filter(su => su.portBattleId === pbId);
      }
      
      return NextResponse.json(response);
    }
    
    // Return all port battles
    let response: any = {
      portBattles
    };
    
    if (includeFleets) {
      response.fleetCompositions = fleetCompositions;
    }
    
    if (includeStandby) {
      response.standbySignUps = standbySignUps;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching port battles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new port battle or sign up
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, ...data } = body;
    
    initializeSampleData();
    
    switch (action) {
      case 'create_port_battle': {
        if (!isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const pbData = data as CreatePortBattleRequest;
        const newPortBattle: PortBattle = {
          id: generateId('pb'),
          ...pbData,
          createdBy: session.user.id,
          activeFleetId: '', // Will be set after creating fleet
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        portBattles.push(newPortBattle);
        
        // Create main fleet composition
        const mainFleet: FleetComposition = {
          id: generateId('fleet'),
          portBattleId: newPortBattle.id,
          name: "Main Fleet",
          type: "main",
          roles: pbData.mainFleetRoles.map((role, index) => ({
            id: generateId('role'),
            fleetId: generateId('fleet'),
            name: role.name,
            expectedShip: role.expectedShip,
            position: index + 1
          })),
          createdAt: new Date().toISOString()
        };
        
        fleetCompositions.push(mainFleet);
        newPortBattle.activeFleetId = mainFleet.id;
        
        return NextResponse.json({ portBattle: newPortBattle, fleetComposition: mainFleet }, { status: 201 });
      }
      
      case 'sign_up': {
        const signUpData = data as CreateSignUpRequest;
        const role = fleetCompositions
          .flatMap(fc => fc.roles)
          .find(r => r.id === signUpData.roleId);
        
        if (!role) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }
        
        if (role.signUp) {
          return NextResponse.json({ error: 'Role already filled' }, { status: 400 });
        }
        
        const newSignUp: SignUp = {
          id: generateId('signup'),
          ...signUpData,
          userId: session.user.id,
          userName: session.user.name || 'Unknown',
          status: 'pending',
          submittedAt: new Date().toISOString()
        };
        
        role.signUp = newSignUp;
        return NextResponse.json(newSignUp, { status: 201 });
      }
      
      case 'standby_sign_up': {
        const standbyData = data as CreateStandbySignUpRequest;
        const portBattle = portBattles.find(pb => pb.id === standbyData.portBattleId);
        
        if (!portBattle) {
          return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
        }
        
        const newStandbySignUp: StandbySignUp = {
          id: generateId('standby'),
          ...standbyData,
          userId: session.user.id,
          userName: session.user.name || 'Unknown',
          submittedAt: new Date().toISOString()
        };
        
        standbySignUps.push(newStandbySignUp);
        return NextResponse.json(newStandbySignUp, { status: 201 });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing data (approve/reject sign-ups, assign roles, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, ...data } = body;
    
    initializeSampleData();
    
    switch (action) {
      case 'approve_signup': {
        if (!isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { roleId, status } = data;
        const role = fleetCompositions
          .flatMap(fc => fc.roles)
          .find(r => r.id === roleId);
        
        if (!role || !role.signUp) {
          return NextResponse.json({ error: 'Sign up not found' }, { status: 404 });
        }
        
        role.signUp.status = status;
        if (status === 'approved') {
          role.signUp.approvedAt = new Date().toISOString();
          role.signUp.approvedBy = session.user.id;
        }
        
        return NextResponse.json({ message: 'Sign up updated successfully' });
      }
      
      case 'assign_role': {
        if (!isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { fromRoleId, toRoleId } = data;
        const fromRole = fleetCompositions
          .flatMap(fc => fc.roles)
          .find(r => r.id === fromRoleId);
        const toRole = fleetCompositions
          .flatMap(fc => fc.roles)
          .find(r => r.id === toRoleId);
        
        if (!fromRole || !toRole || !fromRole.signUp) {
          return NextResponse.json({ error: 'Invalid role assignment' }, { status: 400 });
        }
        
        if (toRole.signUp) {
          return NextResponse.json({ error: 'Target role already filled' }, { status: 400 });
        }
        
        // Move sign-up to new role
        toRole.signUp = { ...fromRole.signUp, roleId: toRoleId };
        fromRole.signUp = undefined;
        
        return NextResponse.json({ message: 'Role reassigned successfully' });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete port battles, sign-ups, etc.
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    
    initializeSampleData();
    
    switch (action) {
      case 'delete_port_battle': {
        if (!isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const pbIndex = portBattles.findIndex(pb => pb.id === id);
        if (pbIndex === -1) {
          return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
        }
        
        portBattles.splice(pbIndex, 1);
        fleetCompositions = fleetCompositions.filter(fc => fc.portBattleId !== id);
        standbySignUps = standbySignUps.filter(su => su.portBattleId !== id);
        
        return NextResponse.json({ message: 'Port battle deleted successfully' });
      }
      
      case 'delete_signup': {
        const roleId = searchParams.get('roleId');
        const role = fleetCompositions
          .flatMap(fc => fc.roles)
          .find(r => r.id === roleId);
        
        if (!role || !role.signUp) {
          return NextResponse.json({ error: 'Sign up not found' }, { status: 404 });
        }
        
        // Check if user can delete (own sign-up or admin)
        if (role.signUp.userId !== session.user.id && !isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        
        role.signUp = undefined;
        return NextResponse.json({ message: 'Sign up deleted successfully' });
      }
      
      case 'delete_standby': {
        const standbyIndex = standbySignUps.findIndex(su => su.id === id);
        if (standbyIndex === -1) {
          return NextResponse.json({ error: 'Standby sign up not found' }, { status: 404 });
        }
        
        const standby = standbySignUps[standbyIndex];
        
        // Check if user can delete (own standby or admin)
        if (standby.userId !== session.user.id && !isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        
        standbySignUps.splice(standbyIndex, 1);
        return NextResponse.json({ message: 'Standby sign up deleted successfully' });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
