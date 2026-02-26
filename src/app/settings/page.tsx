'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import type { Nusach, TransliterationMode, DisplaySettings, GuideLevel } from '@/types';

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const updateEmail = useAuthStore((s) => s.updateEmail);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const displaySettings = useUserStore((s) => s.displaySettings);
  const updateDisplaySettings = useUserStore((s) => s.updateDisplaySettings);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Account
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [newEmail, setNewEmail] = useState('');
  const [accountMsg, setAccountMsg] = useState('');

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Nusach
  const [nusachNote, setNusachNote] = useState('');

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Auto-focus password tab if redirected from recovery
  const tab = searchParams.get('tab');
  useEffect(() => {
    if (tab === 'password') {
      document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tab]);

  const handleSaveName = () => {
    updateProfile({ displayName });
    setAccountMsg('Name updated');
    setTimeout(() => setAccountMsg(''), 2000);
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return;
    const { error } = await updateEmail(newEmail);
    if (error) {
      setAccountMsg(error);
    } else {
      setAccountMsg('Verification email sent to ' + newEmail);
      setNewEmail('');
    }
    setTimeout(() => setAccountMsg(''), 4000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordMsg('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    }
    setTimeout(() => { setPasswordMsg(''); setPasswordError(''); }, 3000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    if (error) {
      setDeleting(false);
      alert('Failed to delete account: ' + error);
    } else {
      router.replace('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-primary-light text-sm hover:text-white transition-colors">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold mt-2">Settings</h1>
          {user && <p className="text-primary-light text-sm mt-1">{user.email}</p>}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Account & Security — only when signed in */}
        {user && (
          <>
            <SettingsSection title="Account">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      placeholder="Your name"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-[#163d55] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Change Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      placeholder="new@email.com"
                    />
                    <button
                      onClick={handleChangeEmail}
                      disabled={!newEmail}
                      className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-[#163d55] transition-colors disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {accountMsg && (
                  <p className="text-sm text-success">{accountMsg}</p>
                )}
              </div>
            </SettingsSection>

            <SettingsSection title="Security" id="password-section">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={!newPassword}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-[#163d55] transition-colors disabled:opacity-50"
                >
                  Update Password
                </button>
                {passwordError && <p className="text-sm text-error">{passwordError}</p>}
                {passwordMsg && <p className="text-sm text-success">{passwordMsg}</p>}
              </div>
            </SettingsSection>
          </>
        )}

        {/* Learning Preferences */}
        <SettingsSection title="Learning Preferences">
          <div className="space-y-5">
            {/* Nusach */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nusach (Pronunciation)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ashkenaz', 'sefard', 'edot'] as Nusach[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      if (n !== 'ashkenaz') {
                        setNusachNote('Currently the app only supports Ashkenaz nusach. Sefard and Edot HaMizrach are coming soon!');
                        setTimeout(() => setNusachNote(''), 4000);
                      } else {
                        setNusachNote('');
                        updateProfile({ nusach: n });
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      profile.nusach === n
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {n === 'ashkenaz' ? 'Ashkenaz' : n === 'sefard' ? 'Sefard' : 'Edot'}
                  </button>
                ))}
              </div>
              {nusachNote && (
                <p className="text-sm text-warning mt-2">{nusachNote}</p>
              )}
            </div>

            {/* Voice Gender */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'male' as const, label: 'Male' },
                  { value: 'female' as const, label: 'Female' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateProfile({ voiceGender: opt.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      (profile.voiceGender || 'male') === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Content Level */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Guide Detail Level
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Controls how much detail the Jewish Living guides show
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'beginner' as GuideLevel, label: 'Just Starting', desc: 'Simple essentials' },
                  { value: 'intermediate' as GuideLevel, label: 'Practicing', desc: 'Traditional methods' },
                  { value: 'advanced' as GuideLevel, label: 'Full Detail', desc: 'Complete halachic guide' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateProfile({ guideContentLevel: opt.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors text-center ${
                      (profile.guideContentLevel || 'beginner') === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block">{opt.label}</span>
                    <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Daily Goal
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => updateProfile({ dailyGoalMinutes: mins })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      profile.dailyGoalMinutes === mins
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Transliteration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transliteration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'full' as const, label: 'Full' },
                  { value: 'faded' as const, label: 'Faded' },
                  { value: 'tap' as const, label: 'Tap to Show' },
                  { value: 'off' as const, label: 'Off' },
                ] as { value: TransliterationMode; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateProfile({ transliterationMode: opt.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      profile.transliterationMode === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Speed */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Audio Speed: {profile.audioSpeed}x
              </label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.25}
                value={profile.audioSpeed}
                onChange={(e) => updateProfile({ audioSpeed: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Display Preferences */}
        <SettingsSection title="Display Preferences">
          <p className="text-xs text-gray-400 -mt-2 mb-1">
            Toggle layers on or off as you gain confidence
          </p>
          <div className="space-y-3">
            {([
              { key: 'showTransliteration' as keyof DisplaySettings, label: 'Transliteration', desc: 'Romanized pronunciation below Hebrew' },
              { key: 'showTranslation' as keyof DisplaySettings, label: 'Translation', desc: 'English translation of prayers' },
              { key: 'showInstructions' as keyof DisplaySettings, label: 'Instructions', desc: 'Physical actions, tips, and notes' },
              { key: 'showAmudCues' as keyof DisplaySettings, label: 'Amud Cues', desc: 'Who says what (leader vs. congregation)' },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => updateDisplaySettings({ [key]: !displaySettings[key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    displaySettings[key] ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      displaySettings[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Sign Out & Danger Zone — only when signed in */}
        {user && (
          <>
            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Sign Out
            </button>

            <SettingsSection title="Danger Zone" danger>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all your progress data. This cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2.5 rounded-xl border-2 border-error text-error text-sm font-medium hover:bg-error/5 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3 bg-error/5 rounded-xl p-4">
                  <p className="text-sm font-medium text-error">
                    Type <strong>DELETE</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-error/30 focus:border-error outline-none text-sm"
                    placeholder="DELETE"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== 'DELETE' || deleting}
                      className="px-6 py-2.5 rounded-xl bg-error text-white text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {deleting ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                      className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </SettingsSection>
          </>
        )}

        {/* Sign in prompt for guests */}
        {!user && (
          <Link
            href="/auth"
            className="block w-full py-3 rounded-xl border-2 border-primary text-primary font-medium text-center hover:bg-primary/5 transition-colors"
          >
            Sign in to sync your progress
          </Link>
        )}

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1B4965]/[0.05] to-[#5FA8D3]/[0.07] rounded-2xl border border-[#1B4965]/10 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1B4965]/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B4965" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-foreground">Questions or Feedback?</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Reach out directly to Rabbi Chaim Gelber — we&apos;d love to hear from you.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href="https://wa.me/13476620889"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4965] text-white text-sm font-semibold hover:bg-[#163d55] active:scale-[0.98] transition-all"
                >
                  {/* WhatsApp icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <span className="text-sm text-gray-500 select-all">+1 347-662-0889</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function SettingsSection({
  title,
  danger = false,
  id,
  children,
}: {
  title: string;
  danger?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${
        danger ? 'border-error/30' : 'border-gray-100'
      } p-6 space-y-4`}
    >
      <h2
        className={`text-lg font-bold ${
          danger ? 'text-error' : 'text-foreground'
        }`}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}
