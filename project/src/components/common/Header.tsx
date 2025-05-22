import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { currentStep } = useAssessment();
  
  // Define the steps and their corresponding routes
  const steps = [
    { number: 1, path: '/' },
    { number: 2, path: '/upload' },
    { number: 3, path: '/objectives' },
    { number: 4, path: '/parameters' },
    { number: 5, path: '/results' },
  ];

  return (
    <header className="bg-[#4267B2] text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">MODO</h1>
        {location.pathname !== '/' && (
          <div className="flex justify-center space-x-2 mt-4">
            {steps.slice(1).map((step, index) => (
              <div 
                key={step.number} 
                className={`h-2 w-full max-w-[120px] rounded-full transition-colors duration-300 ${
                  currentStep >= step.number ? 'bg-[#D4E157]' : 'bg-[#D4E15760]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;