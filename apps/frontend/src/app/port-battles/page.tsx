'use client';

import { useState, useEffect } from 'react';
import { 
  PortBattle, 
  FleetRole, 
  Captain, 
  ScreeningFleet, 
  SHIPS, 
  SHIP_NAMES, 
  NATIONS, 
  SHIP_RATES,
  AVAILABLE_CLANS,
  SignUpRequest
} from '@/types/port-battle-types';

// Available clans - you'll need to update this with your actual clan list
const CLANS = [
  'CLAN1', 'CLAN2', 'CLAN3', 'CLAN4', 'CLAN5',
  'CLAN6', 'CLAN7', 'CLAN8', 'CLAN9', 'CLAN10'
];

interface SignUpModalProps {
  role: FleetRole;
  portBattleId: string;
  onClose: () => void;
  onSignUp: (data: SignUpRequest) => void;
}

function SignUpModal({ role, portBattleId, onClose, onSignUp }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    ship: '',
    books: 1,
    alternateShip: '',
    alternateBooks: 1,
    willingToScreen: false,
    comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp({
      portBattleId,
      roleId: role.id,
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Sign Up for Role #{role.position}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Ship</label>
            <select
              value={formData.ship}
              onChange={(e) => setFormData(prev => ({ ...prev, ship: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a ship...</option>
              {SHIP_NAMES.map(ship => (
                <option key={ship} value={ship}>{ship}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Primary Books (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.books}
              onChange={(e) => setFormData(prev => ({ ...prev, books: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alternate Ship</label>
            <select
              value={formData.alternateShip}
              onChange={(e) => setFormData(prev => ({ ...prev, alternateShip: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select alternate ship...</option>
              {SHIP_NAMES.map(ship => (
                <option key={ship} value={ship}>{ship}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alternate Books (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.alternateBooks}
              onChange={(e) => setFormData(prev => ({ ...prev, alternateBooks: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="willingToScreen"
              checked={formData.willingToScreen}
              onChange={(e) => setFormData(prev => ({ ...prev, willingToScreen: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="willingToScreen" className="text-sm">Willing to screen?</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comments (optional)</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Any additional comments..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getShipBR(shipName: string): number {
  const ship = SHIPS.find(s => s.name === shipName);
  return ship?.br || 0;
}

export default function PortBattlesPage() {
  const [portBattles, setPortBattles] = useState<PortBattle[]>([]);
  const [selectedPB, setSelectedPB] = useState<PortBattle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignUpModal, setShowSignUpModal] = useState<FleetRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // This should come from auth

  useEffect(() => {
    fetchPortBattles();
  }, []);

  const fetchPortBattles = async () => {
    try {
      const response = await fetch('/api/port-battles');
      const data = await response.json();
      setPortBattles(data);
      if (data.length > 0) {
        setSelectedPB(data[0]);
      }
    } catch (error) {
      console.error('Error fetching port battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (signUpData: SignUpRequest) => {
    try {
      const response = await fetch('/api/port-battles?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      if (response.ok) {
        // Refresh the port battle data
        if (selectedPB) {
          const updatedResponse = await fetch(`/api/port-battles?id=${selectedPB.id}`);
          const updatedPB = await updatedResponse.json();
          setSelectedPB(updatedPB);
          
          // Update in the list
          setPortBattles(prev => prev.map(pb => pb.id === updatedPB.id ? updatedPB : pb));
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to sign up');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to sign up');
    }
  };

  const handleApproval = async (roleId: string, approved: boolean) => {
    if (!selectedPB) return;

    try {
      const response = await fetch(`/api/port-battles?id=${selectedPB.id}&action=approve-captain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, approved })
      });

      if (response.ok) {
        // Refresh the port battle data
        const updatedResponse = await fetch(`/api/port-battles?id=${selectedPB.id}`);
        const updatedPB = await updatedResponse.json();
        setSelectedPB(updatedPB);
      }
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-64">Loading...</div>;
  }

  if (!selectedPB) {
    return <div className="text-center py-8">No port battles available</div>;
  }

  const activeFleet = selectedPB.fleetCompositions.find(fc => fc.isActive);
  const remainingBR = selectedPB.brLimit - selectedPB.currentBR;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Port Battles</h1>
        
        {/* Port Battle Selection */}
        {portBattles.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Port Battle:</label>
            <select
              value={selectedPB.id}
              onChange={(e) => {
                const pb = portBattles.find(p => p.id === e.target.value);
                setSelectedPB(pb || null);
              }}
              className="p-2 border rounded-md"
            >
              {portBattles.map(pb => (
                <option key={pb.id} value={pb.id}>
                  {pb.port} - {new Date(pb.battleStartTimeUTC).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Port Battle Info */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{selectedPB.port} Port Battle</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Meetup Time (UTC):</strong><br />
            {new Date(selectedPB.meetupTimeUTC).toLocaleString()}
          </div>
          <div>
            <strong>Battle Start (UTC):</strong><br />
            {new Date(selectedPB.battleStartTimeUTC).toLocaleString()}
          </div>
          <div>
            <strong>Water Type:</strong><br />
            {selectedPB.waterType}
          </div>
          <div>
            <strong>Meetup Location:</strong><br />
            {selectedPB.meetupLocation}
          </div>
          <div>
            <strong>PB Commander:</strong><br />
            {selectedPB.pbCommander}
          </div>
          <div>
            <strong>2IC Commander:</strong><br />
            {selectedPB.secondInCommand}
          </div>
          <div>
            <strong>REQ Commander:</strong><br />
            {selectedPB.reqCommander}
          </div>
          <div>
            <strong>BR Limit:</strong><br />
            {selectedPB.brLimit}
          </div>
          <div>
            <strong>Current BR:</strong><br />
            <span className={remainingBR < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
              {selectedPB.currentBR} / {selectedPB.brLimit}
            </span>
          </div>
          <div>
            <strong>Remaining BR:</strong><br />
            <span className={remainingBR < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
              {remainingBR}
            </span>
          </div>
        </div>
      </div>

      {/* Fleet Composition Tabs */}
      {selectedPB.fleetCompositions.length > 1 && (
        <div className="mb-6">
          <div className="flex border-b">
            {selectedPB.fleetCompositions.map(fleet => (
              <button
                key={fleet.id}
                onClick={() => {
                  // TODO: Implement fleet switching
                }}
                className={`px-4 py-2 border-b-2 ${
                  fleet.isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {fleet.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fleet Roster Table */}
      {activeFleet && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">{activeFleet.name} - Sign Up Sheet</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Captain
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ship
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Books
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alt Ship
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alt Books
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screen?
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeFleet.roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.position}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.clan || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.name || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.ship || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.ship ? getShipBR(role.captain.ship) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.books || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.alternateShip || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.alternateBooks || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.captain?.willingToScreen ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {role.captain?.comments || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {role.captain && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          role.captain.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : role.captain.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {role.captain.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {!role.captain ? (
                        <button
                          onClick={() => setShowSignUpModal(role)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Sign Up
                        </button>
                      ) : isAdmin && role.captain.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApproval(role.id, true)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleApproval(role.id, false)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          >
                            ✗
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screening Fleets */}
      {selectedPB.screeningFleets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Screening Fleets</h3>
          {selectedPB.screeningFleets.map((fleet, index) => (
            <div key={fleet.id} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h4 className="text-lg font-medium">
                  Screening Fleet #{index + 1} - {fleet.type} ({fleet.nation})
                </h4>
                <p className="text-sm text-gray-600">Commander: {fleet.commander}</p>
                <p className="text-sm text-gray-600">Observation: {fleet.observation}</p>
                <p className="text-sm text-gray-600">
                  Requirements: {fleet.shipRequirements.join(', ')}
                </p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {fleet.captains.map((captain, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="font-medium">{captain.name}</div>
                      <div className="text-sm text-gray-600">{captain.clan}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        captain.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : captain.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {captain.status}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign Up for Screening
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <SignUpModal
          role={showSignUpModal}
          portBattleId={selectedPB.id}
          onClose={() => setShowSignUpModal(null)}
          onSignUp={handleSignUp}
        />
      )}
    </div>
  );
}
