'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { signIn } from 'next-auth/react';

const NATIONS = [
  'Great Britain',
  'USA',
  'France',
  'The Pirates',
  'Russia',
  'Sweden'
];

const TIMEZONES = [
  // North America
  'HST (UTC-10) - Hawaii',
  'AKST (UTC-9) - Alaska',
  'PST (UTC-8) - Pacific',
  'MST (UTC-7) - Mountain',
  'CST (UTC-6) - Central',
  'EST (UTC-5) - Eastern',
  'AST (UTC-4) - Atlantic',
  'NST (UTC-3:30) - Newfoundland',

  // Europe
  'GMT (UTC+0) - Greenwich Mean Time',
  'CET (UTC+1) - Central European Time',
  'EET (UTC+2) - Eastern European Time',
  'MSK (UTC+3) - Moscow Time',

  // Asia
  'GST (UTC+4) - Gulf Standard Time',
  'IST (UTC+5:30) - India Standard Time',
  'CST (UTC+8) - China Standard Time',
  'JST (UTC+9) - Japan Standard Time',
  'AEST (UTC+10) - Australian Eastern Time'
];

const RANKS = [
  { name: 'Midshipman', crew: 120 },
  { name: 'Ensign', crew: 200 },
  { name: 'Second Lieutenant', crew: 270 },
  { name: 'First Lieutenant', crew: 370 },
  { name: 'Lieutenant Commander', crew: 420 },
  { name: 'Master and Commander', crew: 570 },
  { name: 'Post Captain', crew: 720 },
  { name: 'Flag Captain', crew: 870 },
  { name: 'Commodore', crew: 1020 },
  { name: 'Rear Admiral', crew: 1200 },
  { name: 'Vice-Admiral', crew: 1700 },
  { name: 'Admiral', crew: 2500 }
];

const PORT_BATTLE_ROLES = [
  'Commander',
  'Line of Battle',
  'Screener'
];

const PORT_BATTLE_AVAILABILITY = [
  'Weekdays',
  'Weekends',
  'Everyday'
];

export default function ApplicationPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [discordMembershipVerified, setDiscordMembershipVerified] = useState(false);
  const [verifyingMembership, setVerifyingMembership] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Particulars
    captainName: '',
    preferredNickname: '',
    currentNation: '',
    timeZone: '',

    // Naval Experience
    hoursInNavalAction: '',
    steamConnected: false,
    currentRank: '',
    previousCommands: '',
    preferredRole: '',
    isPortBattleCommander: false,
    commanderExperience: '',

    // Crafting Experience
    isCrafter: false,

    // Availability
    weeklyPlayTime: '',
    portBattleAvailability: [] as string[],
    typicalSchedule: '',

    // Declarations
    declarationAccuracy: false,
    declarationHonor: false,
    declarationRules: false,

    // Signature
    signature: '',
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check Discord membership on component mount
  useEffect(() => {
    if (session?.user?.discordId) {
      verifyDiscordMembership();
    }
  }, [session]);

  const verifyDiscordMembership = async () => {
    if (!session?.user?.discordId) return;

    setVerifyingMembership(true);
    try {
      const response = await fetch('/api/discord/verify-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: session.user.discordId })
      });

      if (response.ok) {
        const { isMember } = await response.json();
        setDiscordMembershipVerified(isMember);
        if (!isMember) {
          setSubmitError('You must be a member of our Discord server to apply. Please join our Discord first.');
        }
      }
    } catch (error) {
      console.error('Error verifying Discord membership:', error);
      setSubmitError('Unable to verify Discord membership. Please try again.');
    } finally {
      setVerifyingMembership(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (availability: string) => {
    setFormData(prev => ({
      ...prev,
      portBattleAvailability: prev.portBattleAvailability.includes(availability)
        ? prev.portBattleAvailability.filter(a => a !== availability)
        : [...prev.portBattleAvailability, availability]
    }));
  };

  const handleSteamAuth = async () => {
    // In a real implementation, this would integrate with Steam API
    // For now, we'll simulate it
    try {
      // Simulate Steam API call
      const mockSteamData = {
        steamId: '76561198000000000',
        navalActionHours: Math.floor(Math.random() * 1000) + 100
      };

      handleInputChange('steamConnected', true);
      handleInputChange('hoursInNavalAction', mockSteamData.navalActionHours.toString());

      alert(`Steam connected! Detected ${mockSteamData.navalActionHours} hours in Naval Action.`);
    } catch (error) {
      alert('Failed to connect to Steam. Please enter hours manually.');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.captainName && formData.preferredNickname && formData.currentNation && formData.timeZone);
      case 2:
        return !!(formData.hoursInNavalAction && formData.currentRank && formData.preferredRole);
      case 3:
        return true; // Crafting is optional
      case 4:
        return !!(formData.weeklyPlayTime && formData.portBattleAvailability.length > 0 && formData.typicalSchedule);
      case 5:
        return formData.declarationAccuracy && formData.declarationHonor && formData.declarationRules;
      case 6:
        return !!formData.signature;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      setSubmitError('Please complete all required fields and sign the application.');
      return;
    }

    try {
      const applicationData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        submittedBy: session?.user?.discordId || 'unknown',
        submitterName: session?.user?.name || 'Anonymous',
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setSubmitError('');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      setSubmitError('Failed to submit application. Please try again.');
      console.error('Application submission error:', error);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (submitSuccess) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-6xl mb-6">⚓</div>
            <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              Your application to join His Majesty's Naval Service has been received and is now under review by the Admiralty.
            </p>
            <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass mb-6">
              <p className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                A private Discord channel has been created for your application review.
                You will be contacted via Discord regarding the status of your application.
                In the meantime, feel free to explore our port facilities and observe ongoing operations.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="neo-brutal-button bg-brass text-navy-dark px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Return to Port
              </a>
              <a
                href="/gallery"
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                View Gallery
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Discord membership verification screen
  if (!session) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Discord Authentication Required
            </h1>
            <p className="text-xl text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              You must be logged in with Discord to submit an application.
            </p>
            <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass mb-6">
              <p className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                We require Discord authentication to verify your membership in our server and
                to create your personalized application review channel.
              </p>
            </div>
            <button
              onClick={() => signIn('discord')}
              className="neo-brutal-button bg-brass text-navy-dark px-8 py-3 font-semibold"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Login with Discord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verifyingMembership) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-6xl mb-6 animate-spin">⚓</div>
            <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Verifying Discord Membership
            </h1>
            <p className="text-xl text-navy-dark/80" style={{fontFamily: 'Crimson Text, serif'}}>
              Please wait while we verify your membership in our Discord server...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!discordMembershipVerified) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Discord Membership Required
            </h1>
            <p className="text-xl text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              You must be a member of our Discord server to submit an application.
            </p>
            <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass mb-6">
              <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
                Our application process requires Discord membership to enable:
              </p>
              <ul className="text-left text-navy-dark space-y-2" style={{fontFamily: 'Crimson Text, serif'}}>
                <li>• Private application review channel creation</li>
                <li>• Direct communication with recruiters</li>
                <li>• Interview scheduling and coordination</li>
                <li>• Access to member-only resources</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href="https://discord.gg/krakengaming"
                target="_blank"
                rel="noopener noreferrer"
                className="neo-brutal-button bg-indigo-600 text-white px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Join Our Discord
              </a>
              <button
                onClick={verifyDiscordMembership}
                className="neo-brutal-button bg-brass text-navy-dark px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Re-check Membership
              </button>
            </div>
            {submitError && (
              <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Officer Commission Application
          </h1>
          <p className="text-sail-white/80 text-xl" style={{fontFamily: 'Crimson Text, serif'}}>
            His Majesty's Naval Service • KRAKEN Squadron
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="neo-brutal-box bg-sail-white p-4 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === currentStep ? 'bg-brass text-navy-dark' :
                  step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
              Step {currentStep} of 6: {
                currentStep === 1 ? 'Personal Particulars' :
                currentStep === 2 ? 'Naval Experience' :
                currentStep === 3 ? 'Crafting Experience' :
                currentStep === 4 ? 'Availability & Commitment' :
                currentStep === 5 ? 'Declarations' : 'Signature'
              }
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="neo-brutal-box bg-sail-white p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Personal Particulars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Captain Name (In-Game) *
                  </label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange('captainName', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Your in-game captain name"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Preferred Nickname *
                  </label>
                  <input
                    type="text"
                    value={formData.preferredNickname}
                    onChange={(e) => handleInputChange('preferredNickname', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="How should we address you?"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Current Nation *
                  </label>
                  <select
                    value={formData.currentNation}
                    onChange={(e) => handleInputChange('currentNation', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your nation...</option>
                    {NATIONS.map(nation => (
                      <option key={nation} value={nation}>{nation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Time Zone *
                  </label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your timezone...</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Naval Experience
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Hours in Naval Action *
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={formData.hoursInNavalAction}
                      onChange={(e) => handleInputChange('hoursInNavalAction', e.target.value)}
                      className="flex-1 p-3 border-2 border-navy-dark rounded"
                      placeholder="Enter hours manually"
                      style={{fontFamily: 'Crimson Text, serif'}}
                      disabled={formData.steamConnected}
                    />
                    <button
                      type="button"
                      onClick={handleSteamAuth}
                      className={`neo-brutal-button px-6 py-3 font-semibold ${
                        formData.steamConnected
                          ? 'bg-green-500 text-white'
                          : 'bg-brass text-navy-dark'
                      }`}
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      {formData.steamConnected ? '✓ Steam Connected' : 'Connect Steam'}
                    </button>
                  </div>
                  {formData.steamConnected && (
                    <p className="text-green-600 text-sm mt-2">
                      ✅ Hours verified via Steam API
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Current Rank (In-Game) *
                  </label>
                  <select
                    value={formData.currentRank}
                    onChange={(e) => handleInputChange('currentRank', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your current rank...</option>
                    {RANKS.map(rank => (
                      <option key={rank.name} value={rank.name}>
                        {rank.name} ({rank.crew} crew)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Previous Naval Commands
                  </label>
                  <textarea
                    value={formData.previousCommands}
                    onChange={(e) => handleInputChange('previousCommands', e.target.value)}
                    rows={4}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Describe your previous commands, experience, and notable achievements..."
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Preferred Port Battle Role *
                  </label>
                  <select
                    value={formData.preferredRole}
                    onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select preferred role...</option>
                    {PORT_BATTLE_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPortBattleCommander}
                      onChange={(e) => handleInputChange('isPortBattleCommander', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
                      Are you a Port Battle Commander?
                    </span>
                  </label>
                  {formData.isPortBattleCommander && (
                    <textarea
                      value={formData.commanderExperience}
                      onChange={(e) => handleInputChange('commanderExperience', e.target.value)}
                      rows={4}
                      className="w-full p-3 border-2 border-navy-dark rounded mt-3"
                      placeholder="Describe your experience as a Port Battle Commander..."
                      style={{fontFamily: 'Crimson Text, serif'}}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Crafting Experience
              </h2>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isCrafter}
                    onChange={(e) => handleInputChange('isCrafter', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
                    Are you a crafter?
                  </span>
                </label>
                <p className="text-navy-dark/70 mt-4" style={{fontFamily: 'Crimson Text, serif'}}>
                  Crafting expertise is valuable for squadron logistics and ship production.
                  This information helps us organize crafting operations and resource management.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Availability and Commitment
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Weekly Play Time (hours) *
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyPlayTime}
                    onChange={(e) => handleInputChange('weeklyPlayTime', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="How many hours per week do you typically play?"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                    Port Battle Availability *
                  </label>
                  <div className="space-y-2">
                    {PORT_BATTLE_AVAILABILITY.map(availability => (
                      <label key={availability} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.portBattleAvailability.includes(availability)}
                          onChange={() => handleAvailabilityChange(availability)}
                          className="w-5 h-5"
                        />
                        <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                          {availability}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Typical Playing Schedule *
                  </label>
                  <textarea
                    value={formData.typicalSchedule}
                    onChange={(e) => handleInputChange('typicalSchedule', e.target.value)}
                    rows={4}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Describe your typical playing schedule (times, days, etc.)..."
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Declarations
              </h2>
              <div className="space-y-6">
                <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass">
                  <p className="text-navy-dark text-lg leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                    Please read and agree to the following declarations:
                  </p>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccuracy}
                    onChange={(e) => handleInputChange('declarationAccuracy', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I hereby declare that the information provided in this application is true and accurate to the best of my knowledge.
                    I understand that providing false information may result in the rejection of this application or termination of service.
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationHonor}
                    onChange={(e) => handleInputChange('declarationHonor', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I pledge to uphold the honor and traditions of His Majesty's Naval Service and the KRAKEN Squadron,
                    to conduct myself with integrity and professionalism, and to serve with distinction in all naval operations.
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationRules}
                    onChange={(e) => handleInputChange('declarationRules', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I understand that membership in KRAKEN requires adherence to squadron rules, regular participation in organized activities,
                    and maintaining the high standards expected of a Royal Navy officer.
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Officer's Signature
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Digital Signature *
                  </label>
                  <p className="text-navy-dark/70 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
                    Please sign your name in the field below. This serves as your digital signature for this application.
                  </p>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => handleInputChange('signature', e.target.value)}
                    className="w-full p-4 border-2 border-navy-dark rounded text-2xl"
                    placeholder="Sign your name here..."
                    style={{fontFamily: 'cursive'}}
                  />
                </div>

                <div className="bg-sandstone-100 p-6 rounded">
                  <div className="text-center">
                    <p className="text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Date of Application
                    </p>
                    <p className="text-xl text-navy-dark" style={{fontFamily: 'cursive'}}>
                      {getCurrentDate()}
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-navy-dark/20">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`neo-brutal-button px-6 py-3 font-semibold ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-cannon-smoke text-sail-white'
              }`}
              style={{fontFamily: 'Cinzel, serif'}}
            >
              ← Previous
            </button>

            {currentStep < 6 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`neo-brutal-button px-6 py-3 font-semibold ${
                  validateStep(currentStep)
                    ? 'bg-brass text-navy-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(6)}
                className={`neo-brutal-button px-8 py-3 font-semibold ${
                  validateStep(6)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚓ Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
