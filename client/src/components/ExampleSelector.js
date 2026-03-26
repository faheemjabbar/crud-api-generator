import React, { useState } from 'react';
import { X, Zap, Users, Clock, ArrowRight } from 'lucide-react';
import { getAllExamples } from '../data/examples';

/**
 * Component for selecting and loading example projects
 */
const ExampleSelector = ({ onSelectExample, onClose }) => {
  const [selectedExample, setSelectedExample] = useState(null);
  const examples = getAllExamples();

  const difficultyColors = {
    'Beginner': '#22c55e',
    'Intermediate': '#f59e0b', 
    'Advanced': '#ef4444'
  };

  const handleLoadExample = () => {
    if (selectedExample) {
      onSelectExample(selectedExample.schema);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: '#13131f',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#e8e8f0', fontSize: '1.5rem' }}>
              Choose an Example Project
            </h2>
            <p style={{ margin: 0, color: '#7070a0', fontSize: '0.9rem' }}>
              Start with a pre-built template and customize it to your needs
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#7070a0',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Examples Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {examples.map((example, index) => (
            <div
              key={index}
              onClick={() => setSelectedExample(example)}
              style={{
                background: selectedExample === example ? 'rgba(91,106,240,0.1)' : 'rgba(0,0,0,0.2)',
                border: selectedExample === example ? '1px solid #5b6af0' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (selectedExample !== example) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedExample !== example) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              {/* Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{example.icon}</span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', color: '#e8e8f0', fontSize: '1.1rem' }}>
                    {example.name}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    background: `${difficultyColors[example.difficulty]}22`,
                    color: difficultyColors[example.difficulty],
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {example.difficulty}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ 
                margin: '0 0 1rem', 
                color: '#a0a0c0', 
                fontSize: '0.85rem',
                lineHeight: '1.5'
              }}>
                {example.description}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#7070a0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={12} />
                  {example.schema.entities.length} entities
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={12} />
                  {example.schema.framework}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  {example.schema.database}
                </div>
              </div>

              {/* Selection indicator */}
              {selectedExample === example && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '20px',
                  height: '20px',
                  background: '#5b6af0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#fff',
                    borderRadius: '50%'
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Example Details */}
        {selectedExample && (
          <div style={{
            background: 'rgba(91,106,240,0.05)',
            border: '1px solid rgba(91,106,240,0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#5b6af0', fontSize: '1rem' }}>
              What's included in {selectedExample.name}:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {selectedExample.schema.entities.map((entity, index) => (
                <div key={index} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.75rem', 
                  borderRadius: '8px' 
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#e8e8f0', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {entity.name}
                    {entity.auth && <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>🔐</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a0a0c0' }}>
                    {entity.fields.length} fields
                    {entity.relations && entity.relations.length > 0 && (
                      <span>, {entity.relations.length} relations</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#e8e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Start from Scratch
          </button>

          <button
            onClick={handleLoadExample}
            disabled={!selectedExample}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: selectedExample ? '#5b6af0' : '#2a2a40',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: selectedExample ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: '600',
              opacity: selectedExample ? 1 : 0.5
            }}
          >
            Load Example
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExampleSelector;