'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    username: string;
    email?: string;
  };
}

const severityColors = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function BugsPage() {
  const { data: session } = useSession();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium' as const,
    reporterDiscordUsername: '',
    browser: '',
    reporterEmail: '',
  });

  useEffect(() => {
    fetchBugReports();
  }, [selectedSeverity, selectedStatus]);

  const fetchBugReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/bug-reports?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch bug reports');

      const data = await response.json();
      setBugReports(data.bugReports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bug reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit bug report');
      }

      // Reset form and refresh list
      setFormData({
        title: '',
        description: '',
        severity: 'Medium',
        reporterDiscordUsername: '',
        browser: '',
        reporterEmail: '',
      });
      setShowSubmitForm(false);
      fetchBugReports();

      alert('Bug report submitted successfully!');
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to submit bug report'}`);
    }
  };

  const updateBugStatus = async (bugId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bugId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update bug status');

      fetchBugReports();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to update bug status'}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="neo-brutal-box bg-sail-white p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                🐛 Bug Reports
              </h1>
              <p className="text-navy-dark/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Track and report issues with the KrakenGaming platform
              </p>
            </div>
            {session && (
              <button
                onClick={() => setShowSubmitForm(!showSubmitForm)}
                className="neo-brutal-button bg-brass text-navy-dark px-4 py-2 font-semibold transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                {showSubmitForm ? 'Cancel' : 'Submit Bug Report'}
              </button>
            )}
          </div>
        </div>

        {/* Submit Form */}
        {showSubmitForm && (
          <div className="neo-brutal-box bg-sail-white p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
              Submit Bug Report
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                  style={{fontFamily: 'Crimson Text, serif'}}
                  placeholder="Brief description of the bug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                  style={{fontFamily: 'Crimson Text, serif'}}
                  placeholder="Detailed description of the issue, steps to reproduce, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Discord Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reporterDiscordUsername}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterDiscordUsername: e.target.value }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                    style={{fontFamily: 'Crimson Text, serif'}}
                    placeholder="Your Discord username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Browser/Environment
                  </label>
                  <input
                    type="text"
                    value={formData.browser}
                    onChange={(e) => setFormData(prev => ({ ...prev, browser: e.target.value }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                    style={{fontFamily: 'Crimson Text, serif'}}
                    placeholder="Chrome 120, Firefox 115, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                    style={{fontFamily: 'Crimson Text, serif'}}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="neo-brutal-button bg-brass text-navy-dark px-6 py-2 font-semibold transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Submit Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="neo-brutal-button bg-cannon-smoke text-sail-white px-6 py-2 font-semibold transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="neo-brutal-box bg-sail-white p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Filter by Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bug Reports List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bug Reports ({bugReports.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bug reports...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>Error: {error}</p>
              <button
                onClick={fetchBugReports}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          ) : bugReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No bug reports found.</p>
              {session && (
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Submit the first bug report
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bugReports.map((bug) => (
                <div key={bug.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {bug.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[bug.severity]}`}>
                          {bug.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[bug.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {bug.status}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{bug.description}</p>

                      <div className="text-sm text-gray-500">
                        <p>
                          Reported by: {bug.reporter?.username || 'Anonymous'} •
                          Created: {new Date(bug.createdAt).toLocaleDateString()} •
                          Updated: {new Date(bug.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {session && (
                      <div className="ml-4">
                        <select
                          value={bug.status}
                          onChange={(e) => updateBugStatus(bug.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
