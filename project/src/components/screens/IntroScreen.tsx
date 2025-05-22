import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Wand2 } from 'lucide-react';
import Button from '../common/Button';
import { useAssessment } from '../../context/AssessmentContext';

const IntroScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useAssessment();
  
  const handleGetStarted = () => {
    setCurrentStep(2);
    navigate('/upload');
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">Hi, I'm Modo <Crown className="inline-block mx-1" size={28} /><span className="text-2xl">👋</span></h2>
        <p className="text-lg mb-6">
          I'm here to help you design authentic, skill-based assessments that ask students to apply higher-order thinking skills: Not just remember information, but analyze, create, evaluate, and reflect.
        </p>
        <p className="text-lg mb-6">
          They encourage collaboration, promote metacognition, and are grounded in real-world relevance.
        </p>
      </div>
      
      <div className="mb-16">
        <h3 className="text-xl font-semibold mb-6">The strongest projects tend to do three things:</h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center mb-4">
              <span className="font-semibold">1</span>
            </div>
            <p className="text-gray-800">
              They ask students to create something that feels real, genuine, or useful beyond the classroom
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center mb-4">
              <span className="font-semibold">2</span>
            </div>
            <p className="text-gray-800">
              They're rooted in the work of the course: connected to what's actually happening in your class
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center mb-4">
              <span className="font-semibold">3</span>
            </div>
            <p className="text-gray-800">
              And they give students agency: letting them make choices, reflect, and take ownership
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-8 rounded-lg mb-12">
        <h3 className="text-xl font-semibold mb-6">How Modo Works</h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <h4 className="font-medium mb-2">Input Your Context</h4>
            <p className="text-sm text-gray-600">Upload your syllabus and any other course materials.</p>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-2">Set Parameters</h4>
            <p className="text-sm text-gray-600">Define time commitments, skills focus, and output formats.</p>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-2">Generate & Review</h4>
            <p className="text-sm text-gray-600">Modo drafts assessments for you to explore.</p>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-2">Edit & Finalize</h4>
            <p className="text-sm text-gray-600">Make final adjustments & export your assessment!</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={handleGetStarted} className="flex items-center">
          <span>Let's Get Started!</span>
          <Wand2 className="ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default IntroScreen;