import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestOtp, verifyOtp } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simple email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      await requestOtp(email);
      setStep('otp');
      setSuccessMessage('We\'ve sent a 6-digit code to your email. It expires in 10 minutes.');
      setCountdown(600); // 10 minutes in seconds
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length === 6) {
      setOtp(digits);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }
    
    try {
      const response = await verifyOtp(email, otpString);
      login(email, response.token);
      navigate('/app');
    } catch (err) {
      setError('Invalid or expired OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await requestOtp(email);
      setSuccessMessage('We\'ve sent a new 6-digit code to your email.');
      setCountdown(600); // Reset countdown
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer effect
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0 && step === 'otp') {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="app-container">
      {/* Futuristic background elements */}
      <div className="futuristic-bg"></div>
      <div className="futuristic-bg"></div>
      <div className="futuristic-bg"></div>
      
      {/* Grid pattern background */}
      <div className="grid-pattern"></div>

      <div className="login-page-wrapper">
        <div className="panel login-centered-panel">
          <div className="glow-effect"></div>
          
          <div className="text-center mb-6">
            <h1 className="nav-title text-6xl mb-2">Agentic Travel Planner</h1>
            <p className="text-lg gradient-text-futuristic">Sign in to plan your next adventure</p>
          </div>
          
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="login-form">
              <div className="mb-5 w-full max-w-xs mx-auto">
                <label htmlFor="email" className="form-label text-base mb-2 text-center block">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input text-base p-2.5 w-full text-center"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="error-container mb-4 w-full max-w-xs mx-auto">
                  <div className="error-flex">
                    <div className="error-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="error-content">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-futuristic w-full max-w-xs py-2.5 text-base mx-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending code...
                  </span>
                ) : (
                  'Send login code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="otp-form">
              <div className="mb-5">
                <p className="text-center mb-3">
                  Enter the 6-digit code sent to <span className="font-bold">{email}</span>
                </p>
                
                {successMessage && (
                  <div className="success-container mb-4">
                    <div className="success-flex">
                      <div className="success-icon">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div className="success-content">
                        <p>{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="form-input text-lg font-bold text-center border-2 border-cyan-400 bg-slate-800 rounded-full"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      disabled={loading}
                      style={{ 
                        width: '1.5rem', 
                        height: '1.5rem', 
                        textAlign: 'center', 
                        borderRadius: '50%',
                        border: '2px solid #22d3ee',
                        backgroundColor: '#1e293b',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    />
                  ))}
                </div>
                
                {countdown > 0 && (
                  <p className="text-center text-sm mb-4">
                    Code expires in <span className="font-bold">{formatTime(countdown)}</span>
                  </p>
                )}
                
                {error && (
                  <div className="error-container mb-4">
                    <div className="error-flex">
                      <div className="error-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="error-content">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary py-2.5 text-base flex-1"
                    onClick={() => setStep('email')}
                    disabled={loading}
                  >
                    Change Email
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary py-2.5 text-base flex-1"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    {loading ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-futuristic w-full py-2.5 text-base"
                disabled={loading || otp.some(d => !d)}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;