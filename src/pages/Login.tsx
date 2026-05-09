import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Phone, MessageCircle, Lock, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithOtp, requestPasswordReset, checkStoredSession, getRedirectPath, setRememberMe, isAccountLocked, getLockoutTimeRemaining, normalizeMobile, isIdentifierEmail } = useAuthStore();
  const { addToast } = useUIStore();

  const [screen, setScreen] = useState<'login' | 'otp' | 'forgot' | 'reset'>('login');
  const [tab, setTab] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setLocalRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'sent' | 'form'>('request');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (checkStoredSession()) {
      const user = useAuthStore.getState().user;
      if (user) navigate(getRedirectPath(user.role));
    }
  }, []);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpSent, resendTimer]);

  const s = !newPass ? 0 : [newPass.length >= 8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[!@#$%^&*]/.test(newPass)].filter(Boolean).length;
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const detected = !identifier ? null : isIdentifierEmail(identifier.trim()) ? 'email' : normalizeMobile(identifier.trim()).match(/^\+91\d{10}$/) ? 'mobile' : null;

  const lockoutRemaining = identifier ? Math.ceil(getLockoutTimeRemaining(identifier.trim()) / 60000) : 0;
  const isLocked = identifier ? isAccountLocked(identifier.trim()) : false;

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim()) { setError('Enter your email or mobile number'); return; }
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(identifier.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error || 'Login failed'); return; }
    setRememberMe(rememberMe);
    addToast({ type: 'success', message: `Welcome, ${result.user?.name}!` });
    if (result.requiresPasswordChange) { setScreen('reset'); return; }
    navigate(result.user ? getRedirectPath(result.user.role) : '/dashboard');
  };

  const handleSendOtp = async () => {
    setError('');
    if (!identifier.trim()) { setError('Enter your email or mobile number'); return; }
    setLoading(true); await new Promise((r) => setTimeout(r, 600)); setLoading(false);
    const user = useAuthStore.getState().getUserForIdentifier(identifier.trim());
    if (!user) { setError('Invalid login details or account not active.'); return; }
    if (!user.loginMethods.whatsappOtp) { setError('WhatsApp OTP login is not enabled.'); return; }
    setOtpSent(true); setResendTimer(30); setOtp(['', '', '', '', '', '']);
    addToast({ type: 'success', message: `OTP sent to ${user.phone}` });
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  };

  const handleOtpVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); await new Promise((r) => setTimeout(r, 800));
    const result = loginWithOtp(identifier.trim(), code);
    setLoading(false);
    if (!result.success) { setError(result.error || 'Invalid OTP'); return; }
    addToast({ type: 'success', message: `Welcome, ${result.user?.name}!` });
    navigate(result.user ? getRedirectPath(result.user.role) : '/dashboard');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next); setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d) && next.join('').length === 6) setTimeout(() => handleOtpVerify(), 200);
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); setTimeout(() => handleOtpVerify(), 200); }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!forgotIdentifier.trim()) { setError('Enter your email or mobile number'); return; }
    setLoading(true); await new Promise((r) => setTimeout(r, 600));
    const result = requestPasswordReset(forgotIdentifier.trim());
    setLoading(false);
    if (!result.success) { setError(result.error || 'Failed to send reset'); return; }
    setResetStep('sent');
    addToast({ type: 'success', message: result.message || 'Reset link sent' });
  };

  const handleResetPassword = async () => {
    setError('');
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPass)) { setError('Password must contain an uppercase letter'); return; }
    if (!/[0-9]/.test(newPass)) { setError('Password must contain a number'); return; }
    if (!/[!@#$%^&*]/.test(newPass)) { setError('Password must contain a special character'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    addToast({ type: 'success', message: 'Password reset successfully! Please login.' });
    setScreen('login'); setTab('password'); setNewPass(''); setConfirmPass(''); setResetStep('request'); setForgotIdentifier(''); setIdentifier(''); setPassword('');
  };

  return (
    <div className="min-h-screen bg-p13-black flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(251,189,8,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="relative w-full max-w-[420px]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <img src="/logo-main.png" alt="Property1313" className="h-24 w-auto mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">Secure Login</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ========== LOGIN SCREEN ========== */}
          {screen === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Tabs */}
              <div className="flex bg-white/5 rounded-lg p-1 mb-6 border border-white/[0.06]">
                {[
                  { key: 'password' as const, label: 'Password', icon: Lock },
                  { key: 'otp' as const, label: 'WhatsApp OTP', icon: MessageCircle },
                ].map((t) => (
                  <button key={t.key} onClick={() => { setTab(t.key); setError(''); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-xs font-medium transition-all', tab === t.key ? 'bg-p13-yellow text-p13-black' : 'text-neutral-400 hover:text-white')}>
                    <t.icon size={13} />{t.label}
                  </button>
                ))}
              </div>

              <div className="bg-p13-black border border-white/[0.06] rounded-xl p-6 shadow-dark">
                {/* Identifier Input */}
                <div className="mb-4">
                  <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Email or Mobile Number</label>
                  <div className="relative">
                    {detected === 'email' ? <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /> :
                     detected === 'mobile' ? <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /> :
                     <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />}
                    <input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }} placeholder="Enter email or mobile"
                      className={cn('w-full h-11 pl-10 pr-3 rounded-lg bg-white/5 border text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-p13-yellow/20 transition-all',
                        detected === 'email' ? 'border-blue-500/30' : detected === 'mobile' ? 'border-green-500/30' : 'border-white/10', 'focus:border-p13-yellow')} />
                  </div>
                  {detected === 'mobile' && <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Mobile detected: {normalizeMobile(identifier)}</p>}
                  {detected === 'email' && <p className="text-[10px] text-blue-500 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Email detected</p>}
                </div>

                <AnimatePresence mode="wait">
                  {/* Password Tab */}
                  {tab === 'password' && (
                    <motion.div key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="mb-4">
                        <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Enter password"
                            className="w-full h-11 pl-10 pr-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center justify-between mb-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={rememberMe} onChange={(e) => setLocalRememberMe(e.target.checked)}
                            className="w-4 h-4 accent-p13-yellow rounded" />
                          <span className="text-xs text-neutral-400">Remember me for 30 days</span>
                        </label>
                        <button onClick={() => { setScreen('forgot'); setForgotIdentifier(identifier); setError(''); setResetStep('request'); }}
                          className="text-xs text-p13-yellow hover:underline">Forgot password?</button>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                            <p className="text-xs text-red-400">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Lockout warning */}
                      {isLocked && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                          <Clock size={14} className="text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-400">Account locked. Try again in {lockoutRemaining} minutes.</p>
                        </div>
                      )}

                      <button onClick={handleLogin} disabled={loading || isLocked}
                        className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                        {loading ? <span className="w-4 h-4 border-2 border-p13-black/30 border-t-p13-black rounded-full animate-spin" /> : <Lock size={14} />}
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>
                    </motion.div>
                  )}

                  {/* OTP Tab */}
                  {tab === 'otp' && (
                    <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {!otpSent ? (
                        <div>
                          <p className="text-xs text-neutral-400 mb-4">We will send a 6-digit OTP to your registered WhatsApp number.</p>
                          {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"><AlertCircle size={14} className="text-red-400" /><p className="text-xs text-red-400">{error}</p></div>}
                          <button onClick={handleSendOtp} disabled={loading}
                            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <span className="w-4 h-4 border-2 border-p13-black/30 border-t-p13-black rounded-full animate-spin" /> : <MessageCircle size={14} />}
                            {loading ? 'Sending...' : 'Send OTP'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-neutral-400 mb-3">Enter the 6-digit code sent to your WhatsApp</p>
                          <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                              <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                                className="w-11 h-12 bg-white/5 border border-white/10 rounded-lg text-center text-lg font-semibold text-white focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 focus:bg-p13-yellow/5 outline-none transition-all" />
                            ))}
                          </div>
                          {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3"><AlertCircle size={14} className="text-red-400" /><p className="text-xs text-red-400">{error}</p></div>}
                          <button onClick={handleOtpVerify} disabled={loading}
                            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 disabled:opacity-50 flex items-center justify-center gap-2 mb-3">
                            {loading ? <span className="w-4 h-4 border-2 border-p13-black/30 border-t-p13-black rounded-full animate-spin" /> : null}
                            {loading ? 'Verifying...' : 'Verify & Login'}
                          </button>
                          <div className="text-center">
                            {resendTimer > 0 ? (
                              <p className="text-xs text-neutral-500">Resend OTP in {resendTimer}s</p>
                            ) : (
                              <button onClick={handleSendOtp} className="text-xs text-p13-yellow font-medium hover:underline">Resend OTP</button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Demo credentials */}
              <div className="mt-4 text-center">
                <p className="text-[11px] text-neutral-600">Demo: <span className="text-neutral-400">amit@property1313.com</span> / <span className="text-neutral-400">Amit@1313</span> <span className="text-neutral-500">(or Priya/Priya@1313)</span></p>
              </div>
            </motion.div>
          )}

          {/* ========== FORGOT PASSWORD ========== */}
          {screen === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-p13-black border border-white/[0.06] rounded-xl p-6 shadow-dark">
                <button onClick={() => setScreen('login')} className="flex items-center gap-1 text-neutral-400 hover:text-white text-xs mb-4">
                  <ArrowLeft size={14} /> Back to login
                </button>

                <AnimatePresence mode="wait">
                  {resetStep === 'request' && (
                    <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="text-center mb-5">
                        <div className="w-12 h-12 bg-p13-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Lock size={20} className="text-p13-yellow" />
                        </div>
                        <h2 className="text-white text-lg font-semibold">Reset Password</h2>
                        <p className="text-neutral-400 text-xs mt-1">Enter your email or mobile to receive a reset link</p>
                      </div>
                      <div className="mb-4">
                        <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Email or Mobile Number</label>
                        <div className="relative">
                          {isIdentifierEmail(forgotIdentifier) ? <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /> :
                           <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />}
                          <input value={forgotIdentifier} onChange={(e) => { setForgotIdentifier(e.target.value); setError(''); }} placeholder="Enter email or mobile"
                            className="w-full h-11 pl-10 pr-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                        </div>
                      </div>
                      {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"><AlertCircle size={14} className="text-red-400" /><p className="text-xs text-red-400">{error}</p></div>}
                      <button onClick={handleForgotPassword} disabled={loading}
                        className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <span className="w-4 h-4 border-2 border-p13-black/30 border-t-p13-black rounded-full animate-spin" /> : null}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </motion.div>
                  )}

                  {resetStep === 'sent' && (
                    <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={24} className="text-green-500" />
                      </div>
                      <h3 className="text-white text-base font-semibold mb-1">Check your inbox</h3>
                      <p className="text-neutral-400 text-xs mb-5">
                        {isIdentifierEmail(forgotIdentifier) ? 'Password reset link sent to your email.' : 'Password reset OTP sent to your WhatsApp.'}
                      </p>
                      <button onClick={() => setResetStep('form')} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 mb-2">
                        Set New Password
                      </button>
                      <button onClick={() => { setScreen('login'); setResetStep('request'); }} className="text-xs text-neutral-400 hover:text-white mt-2">
                        Back to login
                      </button>
                    </motion.div>
                  )}

                  {resetStep === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 className="text-white text-lg font-semibold mb-1">Set New Password</h2>
                      <p className="text-neutral-400 text-xs mb-4">Create a strong password for your account</p>

                      <div className="mb-3">
                        <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">New Password</label>
                        <div className="relative">
                          <input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => { setNewPass(e.target.value); setError(''); }} placeholder="Min 8 chars, uppercase, number, special"
                            className="w-full h-11 pl-3 pr-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                          <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {newPass && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">{[1, 2, 3, 4].map(i => <div key={i} className={cn('h-1 flex-1 rounded-full', i <= s ? strengthColors[s - 1] : 'bg-neutral-700')} />)}</div>
                            <p className="text-[10px] text-neutral-500">{strengthLabels[s - 1]}</p>
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          {[{ label: '8+ characters', valid: newPass.length >= 8 }, { label: 'One uppercase letter', valid: /[A-Z]/.test(newPass) }, { label: 'One number', valid: /[0-9]/.test(newPass) }, { label: 'One special character', valid: /[!@#$%^&*]/.test(newPass) }].map((req) => (
                            <div key={req.label} className="flex items-center gap-1.5">
                              <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center', req.valid ? 'bg-green-500' : 'bg-neutral-700')}>
                                {req.valid && <CheckCircle size={8} className="text-white" />}
                              </div>
                              <span className={cn('text-[11px]', req.valid ? 'text-green-400' : 'text-neutral-500')}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                          <input type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={(e) => { setConfirmPass(e.target.value); setError(''); }} placeholder="Confirm your password"
                            className="w-full h-11 pl-3 pr-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                          <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {confirmPass && newPass !== confirmPass && <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>}
                      </div>

                      {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"><AlertCircle size={14} className="text-red-400" /><p className="text-xs text-red-400">{error}</p></div>}

                      <button onClick={handleResetPassword} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">
                        Reset Password
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ========== FORCE PASSWORD CHANGE ========== */}
          {screen === 'reset' && (
            <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-p13-black border border-white/[0.06] rounded-xl p-6 shadow-dark text-center">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-yellow-400" />
                </div>
                <h2 className="text-white text-lg font-semibold mb-1">Password Change Required</h2>
                <p className="text-neutral-400 text-xs mb-5">Your account requires a password update before you can continue.</p>
                <div className="text-left space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">New Password</label>
                    <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 8 chars, uppercase, number, special"
                      className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Confirm Password</label>
                    <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm password"
                      className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                  </div>
                  {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3"><AlertCircle size={14} className="text-red-400" /><p className="text-xs text-red-400">{error}</p></div>}
                  <button onClick={handleResetPassword} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">
                    Update Password & Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] text-neutral-700 mt-8">2026 Property1313. All rights reserved.</p>
      </div>
    </div>
  );
}
