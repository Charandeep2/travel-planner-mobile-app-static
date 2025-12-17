import React, { useState, useRef } from 'react';
import type { Itinerary } from '../types';
import MapView from './MapView';

interface ItineraryViewerProps {
  itinerary: Itinerary;
}

const ItineraryViewer: React.FC<ItineraryViewerProps> = ({ itinerary }) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('formatted');
  const dayRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  const scrollToDay = (dayNumber: number) => {
    dayRefs.current[dayNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const formatCurrency = (amount: number) => {
    return `${itinerary.meta.currency} ${amount.toFixed(2)}`;
  };

  const getTimeOfDayColor = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return { background: 'rgba(56, 189, 248, 0.2)', color: '#0c4a6e', border: 'rgba(56, 189, 248, 0.4)' };
      case 'afternoon': return { background: 'rgba(20, 184, 166, 0.2)', color: '#0f766e', border: 'rgba(20, 184, 166, 0.4)' };
      case 'evening': return { background: 'rgba(139, 92, 246, 0.2)', color: '#4c1d95', border: 'rgba(139, 92, 246, 0.4)' };
      default: return { background: 'rgba(156, 163, 175, 0.2)', color: '#1f2937', border: 'rgba(156, 163, 175, 0.4)' };
    }
  };

  // Safely render the map only if itinerary exists
  const renderMap = () => {
    try {
      if (itinerary && itinerary.days) {
        return <MapView itinerary={itinerary} />;
      }
      return null;
    } catch (error) {
      console.error('Error rendering map:', error);
      return null;
    }
  };

  return (
    <div className="panel">
      <div className="glow-effect"></div>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #0f766e)', padding: '1.5rem', borderRadius: '0.75rem' }} className="text-white mb-6">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <h2 className="text-2xl font-bold">{itinerary.destination}</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs font-bold text-white whitespace-nowrap">
            Powered by Gemini AI
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm mt-3">
          <span className="px-3 py-1 bg-blue-900/30 rounded-full">{itinerary.numDays} days</span>
          <span className="px-3 py-1 bg-teal-900/30 rounded-full">Budget: {itinerary.meta.budgetLevel}</span>
          <span className="px-3 py-1 bg-purple-900/30 rounded-full">Style: {itinerary.styleKeywords.join(', ')}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }} className="mb-6">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            className={`py-3 px-5 text-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
              viewMode === 'formatted'
                ? 'text-blue-400'
                : ''
            }`}
            style={{
              borderColor: viewMode === 'formatted' ? '#38bdf8' : 'transparent',
              color: viewMode === 'formatted' ? '#38bdf8' : '#94a3b8'
            }}
            onClick={() => setViewMode('formatted')}
          >
            Overview
          </button>
          <button
            className={`py-3 px-5 text-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
              viewMode === 'json'
                ? 'text-blue-400'
                : ''
            }`}
            style={{
              borderColor: viewMode === 'json' ? '#38bdf8' : 'transparent',
              color: viewMode === 'json' ? '#38bdf8' : '#94a3b8'
            }}
            onClick={() => setViewMode('json')}
          >
            Raw JSON
          </button>
        </nav>
      </div>

      <div className="p-2 sm:p-4">
        {viewMode === 'formatted' ? (
          <div>
            {/* Map View */}
            {renderMap()}

            {/* Mood Board */}
            {itinerary.imageMoodSummary && (
              <div className="mb-8">
                <h3 className="gradient-text-futuristic mb-3 text-xl">Mood Board</h3>
                <div className="relative rounded-xl overflow-hidden h-40">
                  <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #0f766e)', opacity: '0.9' }} className="absolute inset-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-white text-center text-base font-medium">
                      "{itinerary.imageMoodSummary}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Day Chips */}
            <div className="mb-6">
              <h3 className="gradient-text-futuristic mb-3 text-xl">Your Journey</h3>
              <div className="flex overflow-x-auto pb-3 gap-2">
                {itinerary.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => scrollToDay(day.dayNumber)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #0c4a6e, #0f766e)',
                      color: '#bae6fd',
                      border: '1px solid rgba(56, 189, 248, 0.5)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Plans */}
            <div>
              <h3 className="gradient-text-futuristic mb-4 text-xl">Daily Plan</h3>
              <div className="space-y-5">
                {itinerary.days.map((day) => (
                  <div 
                    key={day.dayNumber} 
                    ref={(el) => (dayRefs.current[day.dayNumber] = el)}
                    className="rounded-xl overflow-hidden transition-all duration-500"
                    style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(15, 15, 35, 0.6)' }}
                  >
                    <button
                      className="w-full flex justify-between items-center p-5 text-left transition-colors duration-300"
                      style={{ background: 'rgba(15, 15, 35, 0.8)' }}
                      onClick={() => toggleDay(day.dayNumber)}
                    >
                      <div>
                        <h4 className="font-bold gradient-text-futuristic text-lg">Day {day.dayNumber}: {day.theme}</h4>
                        <p className="mt-2 text-base" style={{ color: '#94a3b8' }}>{day.summary}</p>
                      </div>
                      <svg
                        className={`h-6 w-6 transform transition-transform duration-500 ${
                          expandedDays[day.dayNumber] ? 'rotate-180' : ''
                        }`}
                        style={{ color: '#94a3b8' }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {expandedDays[day.dayNumber] && (
                      <div className="px-5 pb-5">
                        <div className="space-y-4">
                          {day.activities.map((activity, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start p-4 rounded-xl" style={{ background: 'rgba(15, 15, 35, 0.4)' }}>
                              <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold border" style={getTimeOfDayColor(activity.timeOfDay)}>
                                  {activity.timeOfDay.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                  <h5 className="font-bold text-base gradient-text-futuristic">{activity.title}</h5>
                                  <span className="font-bold text-base mt-1 sm:mt-0">
                                    {formatCurrency(activity.estimatedCost)}
                                  </span>
                                </div>
                                <p className="mt-2 text-base" style={{ color: '#94a3b8' }}>{activity.description}</p>
                                <div className="flex flex-wrap items-center mt-3 gap-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#0c4a6e' }}>
                                    {activity.category}
                                  </span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#0f766e' }}>
                                    {activity.location}
                                  </span>
                                  {activity.bookingRequired && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#7f1d1d' }}>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                      Book ahead
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <pre className="p-4 rounded-xl overflow-x-auto text-sm" style={{ background: '#1a1a2e', color: '#bae6fd', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryViewer;