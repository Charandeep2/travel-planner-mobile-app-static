import React, { useState } from 'react';
import type { TripRequest } from '../types';

interface TripFormProps {
  onSubmit: (data: TripRequest) => void;
  loading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, loading }) => {
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState<number | ''>('');
  const [budgetLevel, setBudgetLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tripTags, setTripTags] = useState<string[]>([]);
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const tripTypeOptions = [
    'Relaxing', 'Adventure', 'Luxury', 'Budget', 'Family', 'Romantic',
    'Cultural', 'Historical', 'Beach', 'Mountain', 'City', 'Nature'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInspirationImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    if (tripTags.includes(tag)) {
      setTripTags(tripTags.filter(t => t !== tag));
    } else {
      setTripTags([...tripTags, tag]);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!tripDescription.trim()) {
      newErrors.tripDescription = 'Trip description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert image to base64 if present
    let imageBase64: string | undefined;
    if (inspirationImage) {
      imageBase64 = await fileToBase64(inspirationImage);
    }
    
    const requestData: TripRequest = {
      trip_description: tripDescription,
      start_date: startDate || undefined,
      days: days || undefined,
      budget_level: budgetLevel,
      trip_tags: tripTags,
      inspiration_image: imageBase64
    };
    
    // Debug log to see what data is being sent
    console.log("📤 Sending trip request:", requestData);
    
    onSubmit(requestData);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const clearForm = () => {
    setTripDescription('');
    setStartDate('');
    setDays('');
    setBudgetLevel('Medium');
    setTripTags([]);
    setInspirationImage(null);
    setImagePreview(null);
    setErrors({});
  };

  return (
    <div className="panel">
      <div className="glow-effect"></div>
      <div>
        <h2 className="nav-title mb-6 text-2xl">Plan Your Trip</h2>
        
        {/* Image Upload - Moved to top center */}
        <div className="mb-8">
          <label className="form-label text-base">
            Inspiration Image
          </label>
          
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer relative overflow-hidden" style={{ borderColor: '#38bdf8' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-teal-900/20"></div>
              <div className="flex flex-col items-center justify-center pt-4 pb-5 relative z-10">
                <svg className="w-10 h-10 mb-3" style={{ color: '#38bdf8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-base font-medium mb-2">Add an inspiration image</p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Click to upload</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="relative w-full h-40 rounded-xl overflow-hidden group">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <button
                  type="button"
                  className="btn btn-secondary text-sm px-3 py-1.5"
                  onClick={() => document.getElementById('image-upload-input')?.click()}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Change
                </button>
              </div>
              <input 
                id="image-upload-input"
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
            </div>
          )}
          <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
            PNG or JPG (optional)
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tripDescription" className="form-label text-base">
              Describe your trip *
            </label>
            <textarea
              id="tripDescription"
              rows={5}
              className={`form-textarea text-base ${errors.tripDescription ? 'border-red-500' : ''}`}
              placeholder="Describe your dream vacation with futuristic destinations..."
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
            />
            {errors.tripDescription && (
              <p className="mt-2 text-sm" style={{ color: '#f87171' }}>{errors.tripDescription}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="startDate" className="form-label text-base">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-input text-base p-3"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="days" className="form-label text-base">
                Number of Days
              </label>
              <input
                type="number"
                id="days"
                min="1"
                max="30"
                className="form-input text-base p-3"
                placeholder="e.g., 5"
                value={days}
                onChange={(e) => setDays(e.target.value ? parseInt(e.target.value) : '')}
              />
            </div>
          </div>
          
          <div className="form-group mb-5">
            <label className="form-label text-base">
              Budget Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`btn ${budgetLevel === level ? 'btn-primary' : 'btn-secondary'} py-3`}
                  onClick={() => setBudgetLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group mb-8">
            <label className="form-label text-base">
              Trip Type
            </label>
            <div className="trip-type-grid">
              {tripTypeOptions.map((option) => (
                <div
                  key={option}
                  className={`trip-type-tag ${tripTags.includes(option) ? 'selected' : ''}`}
                  onClick={() => toggleTag(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 lg:static lg:bottom-auto lg:left-auto lg:right-auto">
            <div className="action-bar lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none">
              <div className="action-bar-content">
                <div className="action-summary">
                  {tripTags.length > 0 && (
                    <span>
                      Selected: {tripTags.join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="clear-form-link"
                    onClick={clearForm}
                  >
                    Clear form
                  </button>
                  <button
                    type="submit"
                    className="btn btn-futuristic px-6 py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate Itinerary'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;