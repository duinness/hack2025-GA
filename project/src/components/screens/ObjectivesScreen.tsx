import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { useAssessment } from '../../context/AssessmentContext';
import { CheckCircle2 } from 'lucide-react';

const ObjectivesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { objectives, toggleObjective, setCurrentStep } = useAssessment();
  
  const handleContinue = () => {
    setCurrentStep(4);
    navigate('/parameters');
  };
  
  const selectedCount = objectives.filter(obj => obj.selected).length;
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-bold text-center mb-4">Narrow Down Learning Objectives</h2>
      <p className="text-center text-gray-600 mb-12">
        Here are your learning objectives. Pick the ones you want this assessment to focus on.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {objectives.map(objective => (
          <div 
            key={objective.id}
            className={`bg-blue-50 p-4 rounded-lg flex items-start gap-4 cursor-pointer transition-colors ${
              objective.selected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleObjective(objective.id)}
          >
            <div className="mt-1">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                objective.selected 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-400'
              }`}>
                {objective.selected && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-gray-800">{objective.text}</p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue}
          disabled={selectedCount === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ObjectivesScreen;