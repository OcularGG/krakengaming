'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Application {
  id: string;
  applicantName: string;
  discordUsername: string;
  discordId: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  discordChannelId?: string;
  interviewChannelId?: string;

  // Application fields
  captainName: string;
  preferredNickname?: string;
  currentNation: string;
  timeZone: string;
  hoursInNavalAction: number;
  steamConnected: boolean;
  currentRank: string;
  previousCommands?: string;
  preferredRole: string;
  isPortBattleCommander: boolean;
  commanderExperience?: string;
  isCrafter: boolean;
  weeklyPlayTime: number;
  portBattleAvailability: string[];
  typicalSchedule: string;
  signature: string;

  vouches?: Vouch[];
}

interface Vouch {
  id: string;
  reviewerId: string;
  reviewerName: string;
  vouchType: 'positive' | 'negative';
  comments?: string;
  createdAt: string;
}

interface Cooldown {
  discordId: string;
  discordUsername: string;
  deniedAt: string;
  cooldownEndsAt: string;
  canReapplyAt?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function AdminApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [cooldowns, setCooldowns] = useState<Cooldown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchCooldowns();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications?admin=true');
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCooldowns = async () => {
    try {
      const response = await fetch('/api/applications/cooldowns');
      const data = await response.json();
      setCooldowns(data.cooldowns || []);
    } catch (error) {
      console.error('Failed to fetch cooldowns:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.status === selectedStatus;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 flex items-center justify-center">
        <div className="neo-brutal-box bg-sail-white p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brass mx-auto"></div>
          <p className="mt-4 text-xl text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20">
      {/* Header */}
      <div className="neo-brutal-box bg-sail-white mx-4 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                ⚓ Admiralty Applications
              </h1>
              <p className="mt-2 text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                Review and manage recruitment applications for His Majesty's Naval Service
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => fetchApplications()}
                className="neo-brutal-button bg-brass text-navy-dark px-4 py-2 font-semibold transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-sail-white mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="neo-brutal-input bg-sandstone-100 border border-navy-dark text-navy-dark px-3 py-2"
              style={{fontFamily: 'Crimson Text, serif'}}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neo-brutal-box bg-sandstone-200 p-4 text-center">
              <div className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {applications.length}
              </div>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>Total</div>
            </div>
            <div className="neo-brutal-box bg-brass/20 p-4 text-center">
              <div className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {applications.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>Pending</div>
            </div>
            <div className="neo-brutal-box bg-ocean-foam/30 p-4 text-center">
              <div className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {applications.filter(a => a.status === 'approved').length}
              </div>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>Approved</div>
            </div>
            <div className="neo-brutal-box bg-blood-red/20 p-4 text-center">
              <div className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {applications.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>Rejected</div>
            </div>
          </div>
        </div>

        {/* Cooldowns Section */}
        {cooldowns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🕒 Active Cooldowns</h2>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="space-y-2">
                {cooldowns.map((cooldown) => (
                  <div key={cooldown.discordId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <span className="font-semibold text-white">{cooldown.discordUsername}</span>
                      <span className="text-slate-400 ml-2">
                        Can reapply: {new Date(cooldown.canReapplyAt || cooldown.cooldownEndsAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOverrideCooldown(cooldown.discordId)}
                      className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Override
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
              <p className="text-slate-400">
                {applications.length === 0
                  ? "No applications have been submitted yet."
                  : "No applications match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewDetails={() => setSelectedApplication(application)}
                onAddVouch={() => {
                  setSelectedApplication(application);
                  setShowVouchModal(true);
                }}
                onReview={() => {
                  setSelectedApplication(application);
                  setShowReviewModal(true);
                }}
                onRefresh={fetchApplications}
              />
            ))
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && !showVouchModal && !showReviewModal && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Vouch Modal */}
      {showVouchModal && selectedApplication && (
        <VouchModal
          application={selectedApplication}
          onClose={() => {
            setShowVouchModal(false);
            setSelectedApplication(null);
          }}
          onSubmit={() => {
            setShowVouchModal(false);
            setSelectedApplication(null);
            fetchApplications();
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
          }}
          onSubmit={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
            fetchApplications();
            fetchCooldowns();
          }}
        />
      )}
    </div>
  );

  async function handleOverrideCooldown(discordId: string) {
    if (!confirm('Are you sure you want to override this cooldown? This will allow the user to reapply immediately.')) {
      return;
    }

    try {
      const response = await fetch('/api/applications/cooldowns/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discordId }),
      });

      if (response.ok) {
        fetchCooldowns();
        alert('Cooldown overridden successfully.');
      } else {
        alert('Failed to override cooldown.');
      }
    } catch (error) {
      console.error('Error overriding cooldown:', error);
      alert('Failed to override cooldown.');
    }
  }
}

// Application Card Component
function ApplicationCard({
  application,
  onViewDetails,
  onAddVouch,
  onReview,
  onRefresh
}: {
  application: Application;
  onViewDetails: () => void;
  onAddVouch: () => void;
  onReview: () => void;
  onRefresh: () => void;
}) {
  const positiveVouches = application.vouches?.filter(v => v.vouchType === 'positive').length || 0;
  const negativeVouches = application.vouches?.filter(v => v.vouchType === 'negative').length || 0;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{application.captainName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[application.status]}`}>
              {application.status.toUpperCase()}
            </span>
            {application.discordChannelId && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Discord Channel Created
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
            <div>
              <span className="text-slate-400">Discord:</span>
              <span className="text-white ml-1">{application.discordUsername}</span>
            </div>
            <div>
              <span className="text-slate-400">Nation:</span>
              <span className="text-white ml-1">{application.currentNation}</span>
            </div>
            <div>
              <span className="text-slate-400">Hours:</span>
              <span className="text-white ml-1">{application.hoursInNavalAction}</span>
            </div>
            <div>
              <span className="text-slate-400">Role:</span>
              <span className="text-white ml-1">{application.preferredRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
            {application.vouches && application.vouches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-green-400">👍 {positiveVouches}</span>
                <span className="text-red-400">👎 {negativeVouches}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onViewDetails}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
          >
            View Details
          </button>
          {application.status === 'pending' && (
            <>
              <button
                onClick={onAddVouch}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add Vouch
              </button>
              <button
                onClick={onReview}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Review
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Application Details Modal Component
function ApplicationDetailsModal({ application, onClose }: { application: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Application Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Captain Name:</span> <span className="text-white">{application.captainName}</span></div>
                <div><span className="text-slate-400">Preferred Nickname:</span> <span className="text-white">{application.preferredNickname || 'None'}</span></div>
                <div><span className="text-slate-400">Current Nation:</span> <span className="text-white">{application.currentNation}</span></div>
                <div><span className="text-slate-400">Time Zone:</span> <span className="text-white">{application.timeZone}</span></div>
                <div><span className="text-slate-400">Discord:</span> <span className="text-white">{application.discordUsername}</span></div>
                <div><span className="text-slate-400">Email:</span> <span className="text-white">{application.email || 'Not provided'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Naval Experience</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Hours in Naval Action:</span> <span className="text-white">{application.hoursInNavalAction}</span></div>
                <div><span className="text-slate-400">Steam Connected:</span> <span className="text-white">{application.steamConnected ? 'Yes' : 'No'}</span></div>
                <div><span className="text-slate-400">Current Rank:</span> <span className="text-white">{application.currentRank}</span></div>
                <div><span className="text-slate-400">Preferred Role:</span> <span className="text-white">{application.preferredRole}</span></div>
                <div><span className="text-slate-400">Port Battle Commander:</span> <span className="text-white">{application.isPortBattleCommander ? 'Yes' : 'No'}</span></div>
                <div><span className="text-slate-400">Is Crafter:</span> <span className="text-white">{application.isCrafter ? 'Yes' : 'No'}</span></div>
                <div><span className="text-slate-400">Weekly Play Time:</span> <span className="text-white">{application.weeklyPlayTime} hours</span></div>
              </div>
            </div>
          </div>

          {/* Long text fields */}
          {application.previousCommands && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Previous Commands</h3>
              <p className="text-slate-300 bg-slate-700 p-3 rounded">{application.previousCommands}</p>
            </div>
          )}

          {application.commanderExperience && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Commander Experience</h3>
              <p className="text-slate-300 bg-slate-700 p-3 rounded">{application.commanderExperience}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400">Port Battle Availability:</span>
                <ul className="text-white mt-1">
                  {application.portBattleAvailability.map((day, index) => (
                    <li key={index}>• {day}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400">Typical Schedule:</span>
                <p className="text-white mt-1 bg-slate-700 p-3 rounded">{application.typicalSchedule}</p>
              </div>
            </div>
          </div>

          {/* Vouches */}
          {application.vouches && application.vouches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Vouches</h3>
              <div className="space-y-2">
                {application.vouches.map((vouch) => (
                  <div key={vouch.id} className="bg-slate-700 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={vouch.vouchType === 'positive' ? 'text-green-400' : 'text-red-400'}>
                        {vouch.vouchType === 'positive' ? '👍' : '👎'}
                      </span>
                      <span className="text-white font-semibold">{vouch.reviewerName}</span>
                      <span className="text-slate-400 text-sm">{new Date(vouch.createdAt).toLocaleDateString()}</span>
                    </div>
                    {vouch.comments && (
                      <p className="text-slate-300 text-sm">{vouch.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Vouch Modal Component
function VouchModal({
  application,
  onClose,
  onSubmit
}: {
  application: Application;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [vouchType, setVouchType] = useState<'positive' | 'negative'>('positive');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications/vouch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          vouchType,
          comments,
        }),
      });

      if (response.ok) {
        onSubmit();
      } else {
        const error = await response.json();
        alert(`Failed to submit vouch: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to submit vouch. Please try again.');
      console.error('Error submitting vouch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Vouch</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-slate-300">
            Adding vouch for: <span className="font-semibold text-white">{application.captainName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vouch Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="positive"
                  checked={vouchType === 'positive'}
                  onChange={(e) => setVouchType(e.target.value as 'positive')}
                  className="mr-2"
                />
                <span className="text-green-400">👍 Positive</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="negative"
                  checked={vouchType === 'negative'}
                  onChange={(e) => setVouchType(e.target.value as 'negative')}
                  className="mr-2"
                />
                <span className="text-red-400">👎 Negative</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Comments (Optional)
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              placeholder="Additional comments about this applicant..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vouch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Review Modal Component
function ReviewModal({
  application,
  onClose,
  onSubmit
}: {
  application: Application;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [cooldownDays, setCooldownDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          decision,
          reviewNotes,
          cooldownDays: decision === 'rejected' ? cooldownDays : undefined,
        }),
      });

      if (response.ok) {
        onSubmit();
      } else {
        const error = await response.json();
        alert(`Failed to submit review: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to submit review. Please try again.');
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Review Application</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-slate-300">
            Reviewing application for: <span className="font-semibold text-white">{application.captainName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Decision
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value as 'approved')}
                  className="mr-2"
                />
                <span className="text-green-400">✅ Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value as 'rejected')}
                  className="mr-2"
                />
                <span className="text-red-400">❌ Reject</span>
              </label>
            </div>
          </div>

          {decision === 'rejected' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cooldown Period (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={cooldownDays}
                onChange={(e) => setCooldownDays(parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Review Notes
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              placeholder="Notes about this decision..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                decision === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Processing...' : `${decision === 'approved' ? 'Approve' : 'Reject'} Application`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
