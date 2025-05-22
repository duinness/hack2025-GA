export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  description: string;
  createdAt: string;
  isCustom?: boolean;
}

// Load prompts from localStorage or use default
const loadPrompts = (): SystemPrompt[] => {
  const storedPrompts = localStorage.getItem('systemPrompts');
  if (storedPrompts) {
    return JSON.parse(storedPrompts);
  }
  return [
    {
      id: 'default',
      name: 'Default Assistant',
      content: 'You will assist a teacher in creating authentic assessments for a class.',
      description: 'The default system prompt for general assistance',
      createdAt: new Date().toISOString(),
      isCustom: false
    },
    {
      id: 'default',
      name: 'Default Assistant',
      content: 'Be concise and to the point. Do not include any additional information or commentary.',
      description: 'The default system prompt for general assistance',
      createdAt: new Date().toISOString(),
      isCustom: false
    }
  ];
};

export let systemPrompts: SystemPrompt[] = loadPrompts();

// Helper function to get a prompt by ID
export const getSystemPrompt = (id: string): SystemPrompt | undefined => {
  return systemPrompts.find(prompt => prompt.id === id);
};

// Helper function to get all prompts
export const getAllSystemPrompts = (): SystemPrompt[] => {
  return systemPrompts;
};

// Add a new custom prompt
export const addSystemPrompt = (prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'isCustom'>): SystemPrompt => {
  const newPrompt: SystemPrompt = {
    ...prompt,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isCustom: true
  };
  
  systemPrompts = [...systemPrompts, newPrompt];
  localStorage.setItem('systemPrompts', JSON.stringify(systemPrompts));
  return newPrompt;
};

// Update an existing prompt
export const updateSystemPrompt = (id: string, updates: Partial<Omit<SystemPrompt, 'id' | 'createdAt' | 'isCustom'>>): SystemPrompt | undefined => {
  const promptIndex = systemPrompts.findIndex(p => p.id === id);
  if (promptIndex === -1) return undefined;

  const updatedPrompt = {
    ...systemPrompts[promptIndex],
    ...updates
  };

  systemPrompts = [
    ...systemPrompts.slice(0, promptIndex),
    updatedPrompt,
    ...systemPrompts.slice(promptIndex + 1)
  ];

  localStorage.setItem('systemPrompts', JSON.stringify(systemPrompts));
  return updatedPrompt;
};

// Delete a custom prompt
export const deleteSystemPrompt = (id: string): boolean => {
  const prompt = systemPrompts.find(p => p.id === id);
  if (!prompt || !prompt.isCustom) return false;

  systemPrompts = systemPrompts.filter(p => p.id !== id);
  localStorage.setItem('systemPrompts', JSON.stringify(systemPrompts));
  return true;
};

// Get only custom prompts
export const getCustomPrompts = (): SystemPrompt[] => {
  return systemPrompts.filter(prompt => prompt.isCustom);
};

// Add a new prompt
const newPrompt = addSystemPrompt({
  name: "Assessment Generator",
  content: "You are an AI specialized in generating educational assessments...",
  description: "Used for generating educational assessments"
});

// Update a prompt
updateSystemPrompt(newPrompt.id, {
  content: "Updated content..."
});

// Delete a prompt
deleteSystemPrompt(newPrompt.id);

// Get all custom prompts
const customPrompts = getCustomPrompts(); 