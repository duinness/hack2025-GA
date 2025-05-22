import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LearningObjective {
  id: string;
  text: string;
  selected: boolean;
}

export interface Skill {
  id: string;
  name: string;
  selected: boolean;
}

export interface AssessmentPrompt {
  id: string;
  title: string;
  description: string;
  instructions: string;
  rubric: {
    criteria: string;
    excellent: string;
    proficient: string;
    developing: string;
  }[];
}

interface AssessmentContextType {
  // Uploaded documents
  documents: { type: string; name: string }[];
  addDocument: (type: string, name: string) => void;
  
  // Learning objectives
  objectives: LearningObjective[];
  toggleObjective: (id: string) => void;
  
  // Parameters
  timeRequirement: string;
  setTimeRequirement: (time: string) => void;
  complexityLevel: string;
  setComplexityLevel: (level: string) => void;
  assignmentType: string;
  setAssignmentType: (type: string) => void;
  
  // Skills
  skills: Skill[];
  toggleSkill: (id: string) => void;
  
  // Generated prompts
  generatedPrompts: AssessmentPrompt[];
  setGeneratedPrompts: (prompts: AssessmentPrompt[]) => void;
  
  // Selected prompt
  selectedPrompt: AssessmentPrompt | null;
  setSelectedPrompt: (prompt: AssessmentPrompt | null) => void;
  
  // User feedback
  userFeedback: string;
  setUserFeedback: (feedback: string) => void;
  
  // Current step tracking for progress bar
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};

interface AssessmentProviderProps {
  children: ReactNode;
}

export const AssessmentProvider = ({ children }: AssessmentProviderProps) => {
  // Documents state
  const [documents, setDocuments] = useState<{ type: string; name: string }[]>([]);
  
  // Learning objectives state with mock data
  const [objectives, setObjectives] = useState<LearningObjective[]>([
    { id: '1', text: 'Explain the structure and function of cellular organelles.', selected: false },
    { id: '2', text: 'Describe the processes of mitosis and meiosis and their roles in reproduction.', selected: false },
    { id: '3', text: 'Interpret and analyze genetic inheritance patterns.', selected: false },
    { id: '4', text: 'Apply the principles of evolution to explain biodiversity.', selected: false },
    { id: '5', text: 'Design and analyze simple experiments using the scientific method.', selected: false },
    { id: '6', text: 'Evaluate the impact of human activity on ecosystems.', selected: false },
    { id: '7', text: 'Compare the structure and function of prokaryotic and eukaryotic cells.', selected: false },
    { id: '8', text: 'Use biological terminology accurately in written and oral communication.', selected: false },
    { id: '9', text: 'Explain how energy flows through biological systems (e.g., photosynthesis, cellular respiration).', selected: false },
    { id: '10', text: 'Collaborate effectively in lab and group settings to solve biological problems.', selected: false },
  ]);
  
  // Assessment parameters
  const [timeRequirement, setTimeRequirement] = useState<string>('');
  const [complexityLevel, setComplexityLevel] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<string>('');
  
  // Skills to assess
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'Critical Thinking', selected: false },
    { id: '2', name: 'Research', selected: false },
    { id: '3', name: 'Communication', selected: false },
    { id: '4', name: 'Collaboration', selected: false },
    { id: '5', name: 'Problem Solving', selected: false },
    { id: '6', name: 'Creativity', selected: false },
    { id: '7', name: 'Quantitative Reasoning', selected: false },
    { id: '8', name: 'Digital Literacy', selected: false },
  ]);
  
  // Generated prompts
  const [generatedPrompts, setGeneratedPrompts] = useState<AssessmentPrompt[]>([]);
  
  // Selected prompt
  const [selectedPrompt, setSelectedPrompt] = useState<AssessmentPrompt | null>(null);
  
  // User feedback
  const [userFeedback, setUserFeedback] = useState<string>('');
  
  // Current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Functions to update state
  const addDocument = (type: string, name: string) => {
    setDocuments([...documents, { type, name }]);
  };
  
  const toggleObjective = (id: string) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, selected: !obj.selected } : obj
    ));
  };
  
  const toggleSkill = (id: string) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, selected: !skill.selected } : skill
    ));
  };
  
  const value = {
    documents,
    addDocument,
    objectives,
    toggleObjective,
    timeRequirement,
    setTimeRequirement,
    complexityLevel,
    setComplexityLevel,
    assignmentType,
    setAssignmentType,
    skills,
    toggleSkill,
    generatedPrompts,
    setGeneratedPrompts,
    selectedPrompt,
    setSelectedPrompt,
    userFeedback,
    setUserFeedback,
    currentStep,
    setCurrentStep,
  };
  
  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
};