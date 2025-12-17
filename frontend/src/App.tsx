import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { TripRequest, Itinerary } from './types';
import { generateItinerary } from './services/api';
import { useAuth } from './contexts/AuthContext';
import TripForm from './components/TripForm';
import ItineraryViewer from './components/ItineraryViewer';
import LoginPage from './components/LoginPage';
import './style.css';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Main app component
const AppContent: React.FC = () => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGenerateItinerary = async (requestData: TripRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateItinerary(requestData);
      setItinerary(result);
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setItinerary(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="app-container">
      {/* Futuristic background elements */}
      <div className="futuristic-bg"></div>
      <div className="futuristic-bg"></div>
      <div className="futuristic-bg"></div>
      
      {/* Grid pattern background */}
      <div className="grid-pattern"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-flex">
            <div className="w-full">
              <div className="nav-title-container">
                <h1 className="nav-title">
                  <span className="nav-highlight">Agentic</span> Travel Planner
                </h1>
              </div>
              <p className="nav-subtitle hidden md:block">
                AI-Powered Travel Planning for the Future
              </p>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm px-3 py-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-flex">
          {/* Left Panel - Trip Input Form */}
          <div className="panel" style={{ flex: '1 1 45%' }}>
            <div className="glow-effect"></div>
            {!itinerary ? (
              <TripForm onSubmit={handleGenerateItinerary} loading={loading} />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="nav-title text-2xl">Trip Generated!</h2>
                  <button
                    onClick={handleRegenerate}
                    className="btn btn-secondary"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-center mb-6 text-lg">
                  Your itinerary for <span className="nav-highlight">{itinerary.destination}</span> has been generated successfully.
                </p>
                <div className="success-container">
                  <div className="success-flex">
                    <div className="success-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="success-content">
                      <h3 className="gradient-text-futuristic">Ready for your journey</h3>
                      <div>
                        <p>You're all set to explore {itinerary.destination} for {itinerary.numDays} days!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Itinerary Viewer */}
          <div className="panel" style={{ flex: '1 1 55%' }}>
            <div className="glow-effect"></div>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner-circle"></div>
                  <div className="spinner-ring"></div>
                </div>
                <p className="loading-title">Generating your personalized itinerary</p>
                <p className="loading-text">Our AI is crafting the perfect travel experience for you using advanced algorithms and neural networks...</p>
                <div className="progress-container">
                  <div className="progress-flex">
                    <span>Step 3 of 3</span>
                    <span>Finalizing</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div>
                <div className="error-container">
                  <div className="error-flex">
                    <div className="error-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="error-content">
                      <h3 className="gradient-text-futuristic">Error generating itinerary</h3>
                      <div>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="btn btn-futuristic mt-6"
                >
                  Try Again
                </button>
              </div>
            ) : itinerary ? (
              <ItineraryViewer itinerary={itinerary} />
            ) : (
              <div className="empty-container">
                <div className="empty-icon-container">
                  <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="empty-title">Your Personalized Itinerary Awaits</h3>
                <p className="empty-text">
                  Fill out the trip form to generate your personalized travel itinerary powered by cutting-edge AI technology.<br />
                  Add an inspiration image to make it even more tailored to your taste.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App component with routes
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/app/*" element={
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

export default App;