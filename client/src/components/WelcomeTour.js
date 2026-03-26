import { useState, useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { X, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

/**
 * Tour steps configuration
 */
const tourSteps = [
  {
    selector: '#project-name-input',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Start with Your Project Name
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Give your API a unique name. This will be used for your project folder and package name. 
          Use lowercase letters, numbers, and hyphens.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Click here and type a project name like "my-blog-api"
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '#framework-selector',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Choose Your Framework
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Express is simpler and great for beginners. NestJS is more structured and better for complex applications.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Click on Express or NestJS to select your preferred framework
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '#database-selector',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Pick Your Database
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          MongoDB is flexible and document-based. PostgreSQL is structured and great for complex relationships.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Choose the database that fits your needs
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '#add-entity-button',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Add Your First Entity
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Entities are the main "things" in your app. For a blog, you might have User, Post, and Comment entities.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Click this button to create your first entity
        </div>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '.entity-card',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Configure Your Entity
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Give your entity a name (like "User" or "Product"). Each entity becomes a database table with its own API endpoints.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Type an entity name in the input field
        </div>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '.field-row',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Add Fields to Your Entity
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Fields are the properties your entity has. For a User, you might have email, password, and name fields.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Configure the field name and type
        </div>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '#add-field-button',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#5b6af0', fontSize: '1.1rem' }}>
          Add More Fields
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Click here to add more fields to your entity. Most entities need 3-5 fields to be useful.
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(91, 106, 240, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#5b6af0',
          fontWeight: '500'
        }}>
          👆 Add additional fields as needed
        </div>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '#generate-button',
    content: (
      <div style={{ color: '#e8e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#22c55e', fontSize: '1.1rem' }}>
          Generate Your API
        </h3>
        <p style={{ margin: '0 0 0.75rem' }}>
          Once you're happy with your setup, click here to generate and download your complete API!
        </p>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#22c55e',
          fontWeight: '500'
        }}>
          👆 Click to generate your production-ready API
        </div>
      </div>
    ),
    position: 'top',
  },
];

/**
 * Custom tour controls component
 */
const TourControls = () => {
  const { currentStep, steps, setCurrentStep, setIsOpen } = useTour();
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsOpen(false);
  };

  const restartTour = () => {
    setCurrentStep(0);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: currentStep === 0 ? '#4a4a70' : '#e8e8f0',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem'
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={restartTour}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#e8e8f0',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          <RotateCcw size={14} />
          Restart
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={skipTour}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#7070a0',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          Skip Tour
        </button>

        <button
          onClick={nextStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: currentStep === steps.length - 1 ? '#22c55e' : '#5b6af0',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

/**
 * Interactive tour wrapper component
 */
const InteractiveTour = ({ isActive, onComplete, onSkip }) => {
  if (!isActive) return null;

  return (
    <TourProvider
      steps={tourSteps}
      isOpen={isActive}
      onRequestClose={() => {
        onComplete();
      }}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': '#5b6af0',
          borderRadius: '12px',
          backgroundColor: '#1a1a2a',
          border: '1px solid rgba(91, 106, 240, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          color: '#e8e8f0',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          maxWidth: '400px',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: '#5b6af0',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: '600',
        }),
        controls: (base) => ({
          ...base,
          marginTop: '1rem',
        }),
        close: (base) => ({
          ...base,
          color: '#7070a0',
          right: '1rem',
          top: '1rem',
        }),
      }}
      showBadge={true}
      showCloseButton={true}
      showNavigation={false} // We'll use custom controls
      maskClassName="tour-mask"
      className="tour-popover"
      afterOpen={(target) => {
        // Scroll element into view
        if (target) {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }
      }}
    >
      <div>
        <TourControls />
      </div>
    </TourProvider>
  );
};

export default InteractiveTour;