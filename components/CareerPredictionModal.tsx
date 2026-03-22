"use client";

import { useEffect, useState } from 'react';

// Types
interface PredictionData {
  currentMatch: number;
  futureMatch: number;
  skillGaps: string[];
  recommendations: {
    course: string;
    platform: string;
    reason: string;
  }[];
  timeline: {
    year: number;
    matchPercentage: number;
    keyMilestone: string;
  }[];
}

interface CareerPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobRequirements: {
    skills: string[];
    qualifications: string[];
  };
  userProfile: {
    skills: string[];
    year: string;
    certifications?: string[];
    currentMatchScore?: number;  // Added this
  };
}

export default function CareerPredictionModal({
  isOpen,
  onClose,
  jobTitle,
  jobRequirements,
  userProfile
}: CareerPredictionModalProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch prediction when modal opens
  useEffect(() => {
    if (isOpen && !prediction && !loading) {
      fetchPrediction();
    }
  }, [isOpen]);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/predict-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          jobRequirements,
          userProfile
        })
      });

      if (!response.ok) throw new Error('Failed to fetch prediction');
      
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Unable to generate prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPrediction(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid #333'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>
            Career Trajectory Prediction
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '24px',
              lineHeight: '24px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', color: 'white' }}>
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px',
            background: '#0a0a0a',
            borderRadius: '8px'
          }}>
            <strong>{jobTitle}</strong>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <div style={{ marginBottom: '12px' }}>🔮</div>
              Analyzing your career trajectory...
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              background: '#331111',
              border: '1px solid #661111',
              borderRadius: '8px',
              color: '#ff6b6b',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {prediction && (
            <>
              {/* Current vs Future Match */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '16px',
                  background: '#0a3d0a',
                  border: '1px solid #0d5c0d',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6fbf6f', marginBottom: '8px' }}>
                    CURRENT MATCH
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4ade80' }}>
                    {prediction.currentMatch}%
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: prediction.futureMatch < 50 ? '#3d0a0a' : '#0a3d0a',
                  border: `1px solid ${prediction.futureMatch < 50 ? '#5c0d0d' : '#0d5c0d'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: prediction.futureMatch < 50 ? '#bf6f6f' : '#6fbf6f', 
                    marginBottom: '8px' 
                  }}>
                    5-YEAR PROJECTION
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: prediction.futureMatch < 50 ? '#f87171' : '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {prediction.futureMatch}%
                    {prediction.futureMatch < prediction.currentMatch ? '📉' : '📈'}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#ddd' }}>
                  Career Timeline
                </h3>
                <div style={{ position: 'relative', paddingLeft: '30px' }}>
                  {prediction.timeline.map((point, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: '16px' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-30px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: point.matchPercentage >= 50 ? '#4ade80' : '#f87171',
                        border: '2px solid #1a1a1a'
                      }} />
                      {idx < prediction.timeline.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '16px',
                          width: '2px',
                          height: '100%',
                          background: '#333'
                        }} />
                      )}
                      <div style={{
                        background: '#0a0a0a',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}>
                          <strong>Year {point.year}</strong>
                          <span style={{ 
                            color: point.matchPercentage >= 50 ? '#4ade80' : '#f87171'
                          }}>
                            {point.matchPercentage}%
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#999' }}>
                          {point.keyMilestone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {prediction.skillGaps.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#ddd' }}>
                    Skills to Develop
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {prediction.skillGaps.map((skill, idx) => (
                      <span key={idx} style={{
                        padding: '6px 12px',
                        background: '#0a0a0a',
                        border: '1px solid #444',
                        borderRadius: '16px',
                        fontSize: '14px',
                        color: '#fbbf24'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 style={{ 
                  fontSize: '16px', 
                  marginBottom: '12px', 
                  color: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📚 Recommended Learning Path
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {prediction.recommendations.map((rec, idx) => (
                    <div key={idx} style={{
                      padding: '14px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '4px',
                        color: '#60a5fa'
                      }}>
                        {rec.course}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999', marginBottom: '6px' }}>
                        Platform: {rec.platform}
                      </div>
                      <div style={{ fontSize: '14px', color: '#ccc' }}>
                        {rec.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}