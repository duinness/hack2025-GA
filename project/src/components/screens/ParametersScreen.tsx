import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BarChart2, Users, CheckSquare } from 'lucide-react';
import Button from '../common/Button';
import { useAssessment } from '../../context/AssessmentContext';

const ParametersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    setTimeRequirement, 
    setComplexityLevel, 
    setAssignmentType,
    skills,
    toggleSkill,
    setCurrentStep,
    setGeneratedPrompts,
    objectives
  } = useAssessment();
  
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  const timeOptions = [
    'Under 1 hour',
    '1-2 hours',
    '2-5 hours',
    'One week',
    '2-3 weeks',
    'Semester-long project'
  ];
  
  const complexityOptions = [
    'Low - Basic application of concepts',
    'Medium - Application with some analysis',
    'High - Complex analysis and synthesis'
  ];
  
  const handleGenerateAssessment = async () => {
    // Save selections to context
    setTimeRequirement(selectedTime);
    setComplexityLevel(selectedComplexity);
    setAssignmentType(selectedType);
    
    try {
      // Get selected learning objectives
      const selectedObjectives = objectives
        .filter(obj => obj.selected)
        .map(obj => obj.text);

      // Combine all parameters into a single prompt for OpenAI
      const combinedPrompt = `As an educational assessment expert, generate 3 unique project ideas that meet these criteria:
      - Time requirement: ${selectedTime}
      - Complexity level: ${selectedComplexity}
      - Assignment type: ${selectedType}
      - Learning objectives to address:
        ${selectedObjectives.map(obj => `- ${obj}`).join('\n        ')}
      
      For each project, provide:
      1. A clear, engaging title
      2. A concise description (2-3 sentences) that outlines the main objectives and deliverables
      3. Detailed step-by-step instructions for students
      4. A rubric with 3-4 criteria, each with descriptions for Excellent, Proficient, and Developing levels
      
      Format the response as a JSON array with objects containing this exact structure:
      {
        "id": "unique identifier",
        "title": "project title",
        "description": "project description",
        "instructions": "detailed step-by-step instructions",
        "rubric": [
          {
            "criteria": "string describing the criterion",
            "excellent": "string describing excellent performance",
            "proficient": "string describing proficient performance",
            "developing": "string describing developing performance"
          }
        ]
      }`;

      console.log('Sending request to server with prompt:', combinedPrompt);

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { sender: 'system', text: "You are an authentic assessment designer." },
            { sender: 'system', text: 'You create relevant, skill-based assessment that is challenging, evokes reflection, encourages collaboration, and transfers to real-world contexts.' },
            { sender: 'user', text: combinedPrompt }
          ]
        })
      });

      const data = await response.json();
      console.log('Raw response from server:', data);

      if (!data.text) {
        throw new Error('Invalid response format: missing text field');
      }

      try {
        // Clean the response text by removing markdown code block syntax and any potential hidden characters
        const cleanText = data.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
          .trim();

        console.log('Cleaned text before parsing:', cleanText);
        
        // Try to parse the JSON with a more lenient approach
        let generatedPrompts;
        try {
          generatedPrompts = JSON.parse(cleanText);
        } catch {
          // If initial parse fails, try to fix common JSON formatting issues
          const fixedText = cleanText
            .replace(/\n\s+/g, ' ') // Replace newlines and multiple spaces with single space
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Ensure property names are quoted
            .replace(/(\w+)(\s*:)/g, '"$1"$2'); // Quote any remaining unquoted property names
          
          console.log('Attempting to parse fixed text:', fixedText);
          generatedPrompts = JSON.parse(fixedText);
        }

        console.log('Parsed prompts:', generatedPrompts);

        // Validate the structure of the parsed prompts
        if (!Array.isArray(generatedPrompts) || generatedPrompts.length === 0) {
          throw new Error('Invalid prompts format: expected non-empty array');
        }

        // Validate each prompt has the required structure
        generatedPrompts.forEach((prompt, index) => {
          if (!prompt.id || !prompt.title || !prompt.description || !prompt.instructions || !Array.isArray(prompt.rubric)) {
            throw new Error(`Invalid prompt structure at index ${index}`);
          }
        });

        // Set the generated prompts in context
        setGeneratedPrompts(generatedPrompts);
        setCurrentStep(5);
        navigate('/results');
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.log('Raw text that failed to parse:', data.text);
        throw new Error('Failed to parse response as JSON');
      }
    } catch (error) {
      console.error('Error generating assessment prompts:', error);
      // Fallback to mock prompts if API call fails
      const mockPrompts = [
        {
          id: '1',
          title: 'Cell Division Visualization Project',
          description: 'Create an interactive model that demonstrates the stages of mitosis and meiosis, highlighting their differences and significance in reproduction.',
          instructions: 'Detailed instructions for the cell division project...',
          rubric: [
            {
              criteria: 'Scientific Accuracy',
              excellent: 'All stages accurately represented with detailed explanations',
              proficient: 'Most stages accurately represented with basic explanations',
              developing: 'Some stages represented with limited accuracy'
            }
          ]
        },
        {
          id: '2',
          title: 'Energy Flow Case Study',
          description: 'Analyze a specific ecosystem to trace energy flow through photosynthesis and cellular respiration, documenting with visual aids and data analysis.',
          instructions: 'Detailed instructions for the energy flow case study...',
          rubric: [
            {
              criteria: 'Scientific Accuracy',
              excellent: 'All aspects of energy flow accurately analyzed',
              proficient: 'Most aspects of energy flow analyzed with basic explanations',
              developing: 'Some aspects of energy flow analyzed with limited accuracy'
            }
          ]
        },
        {
          id: '3',
          title: 'Scientific Method Laboratory Design',
          description: 'Design and propose an experiment investigating a specific aspect of cellular energy transfer using the scientific method.',
          instructions: 'Detailed instructions for designing a scientific method experiment...',
          rubric: [
            {
              criteria: 'Scientific Methodology',
              excellent: 'Experiment design adheres to scientific method principles',
              proficient: 'Experiment design adheres to scientific method principles with some deviations',
              developing: 'Experiment design deviates from scientific method principles'
            }
          ]
        }
      ];
      
      setGeneratedPrompts(mockPrompts);
      setCurrentStep(5);
      navigate('/results');
    }
  };
  
  const selectedSkillsCount = skills.filter(skill => skill.selected).length;
  const isFormComplete = selectedTime && selectedComplexity && selectedType && selectedSkillsCount > 0;
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-bold text-center mb-12">Assessment Parameters</h2>
      
      <div className="space-y-10 mb-12">
        {/* Time Requirement */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-[#00BFA5]" />
            <h3 className="text-lg font-medium">Time Requirement</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {timeOptions.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedTime === time 
                    ? 'border-[#00BFA5] bg-[#00BFA5]/10 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        {/* Complexity Level */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={20} className="text-[#00BFA5]" />
            <h3 className="text-lg font-medium">Complexity Level</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {complexityOptions.map(level => (
              <button
                key={level}
                onClick={() => setSelectedComplexity(level)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedComplexity === level 
                    ? 'border-[#00BFA5] bg-[#00BFA5]/10 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        {/* Assignment Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-[#00BFA5]" />
            <h3 className="text-lg font-medium">Assignment Type</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedType('Individual Assignment')}
              className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                selectedType === 'Individual Assignment' 
                  ? 'border-[#00BFA5] bg-[#00BFA5]/10 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <Users size={16} className="text-blue-700" />
              </span>
              <span>Individual Assignment</span>
            </button>
            
            <button
              onClick={() => setSelectedType('Group Assignment')}
              className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                selectedType === 'Group Assignment' 
                  ? 'border-[#00BFA5] bg-[#00BFA5]/10 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <Users size={16} className="text-blue-700" />
              </span>
              <span>Group Assignment</span>
            </button>
          </div>
        </div>
        
        {/* Skills to Assess */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare size={20} className="text-[#00BFA5]" />
            <h3 className="text-lg font-medium">Skills to Assess (Select at least one)</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`skill-${skill.id}`}
                  checked={skill.selected}
                  onChange={() => toggleSkill(skill.id)}
                  className="h-4 w-4 text-[#00BFA5] focus:ring-[#00BFA5] border-gray-300 rounded"
                />
                <label htmlFor={`skill-${skill.id}`} className="ml-2 text-sm text-gray-700">
                  {skill.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateAssessment}
          disabled={!isFormComplete}
        >
          Start Co-Creating!
        </Button>
      </div>
    </div>
  );
};

export default ParametersScreen;