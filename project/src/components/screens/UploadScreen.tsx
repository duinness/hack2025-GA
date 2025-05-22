import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileUp } from 'lucide-react';
import Button from '../common/Button';
import { useAssessment } from '../../context/AssessmentContext';

const UploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, setCurrentStep } = useAssessment();
  const [syllabusUploaded, setSyllabusUploaded] = useState(false);
  const [otherUploaded, setOtherUploaded] = useState(false);
  
  const handleSyllabusUpload = () => {
    addDocument('syllabus', 'Course_Syllabus.pdf');
    setSyllabusUploaded(true);
  };
  
  const handleOtherUpload = () => {
    addDocument('other', 'Additional_Materials.pdf');
    setOtherUploaded(true);
  };
  
  const handleContinue = () => {
    setCurrentStep(3);
    navigate('/objectives');
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-bold text-center mb-12">Upload Documents</h2>
      
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${syllabusUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
          <h3 className="text-xl font-medium mb-4">Syllabus</h3>
          
          {syllabusUploaded ? (
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-full p-2 inline-flex items-center justify-center mb-4">
                <FileUp size={24} />
              </div>
              <p className="text-sm text-gray-600">Course_Syllabus.pdf</p>
            </div>
          ) : (
            <button 
              onClick={handleSyllabusUpload} 
              className="text-[#00BFA5] hover:text-[#00A896] transition-colors"
            >
              <PlusCircle size={40} />
            </button>
          )}
        </div>
        
        <div className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${otherUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
          <h3 className="text-xl font-medium mb-4">Anything else</h3>
          
          {otherUploaded ? (
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-full p-2 inline-flex items-center justify-center mb-4">
                <FileUp size={24} />
              </div>
              <p className="text-sm text-gray-600">Additional_Materials.pdf</p>
            </div>
          ) : (
            <button 
              onClick={handleOtherUpload} 
              className="text-[#00BFA5] hover:text-[#00A896] transition-colors"
            >
              <PlusCircle size={40} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue} 
          disabled={!syllabusUploaded && !otherUploaded}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UploadScreen;