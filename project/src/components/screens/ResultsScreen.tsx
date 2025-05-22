import React, { useState } from 'react';
import { ChevronDown, Send, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import { useAssessment } from '../../context/AssessmentContext';

interface RubricCriterion {
  criteria: string;
  excellent: string;
  proficient: string;
  developing: string;
}

const ResultsScreen: React.FC = () => {
  const { 
    objectives, 
    timeRequirement, 
    complexityLevel, 
    assignmentType, 
    skills,
    generatedPrompts,
    setGeneratedPrompts,
    setUserFeedback
  } = useAssessment();
  
  const [userInput, setUserInput] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'system'}[]>([
    {
      text: "Hi again! Based on what you shared, I've put together three authentic assessment ideas for your course. Each one aligns with your selected learning objectives and emphasizes real-world application, reflection, and student agency. Take a look. Let me know what you think, you can move forward with one, ask for changes, or explore more options.",
      sender: 'system'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedPrompt, setLastUpdatedPrompt] = useState<string | null>(null);
  
  const selectedObjectives = objectives.filter(obj => obj.selected);
  const selectedSkills = skills.filter(skill => skill.selected);

  const handleMoreInfo = (promptId: string) => {
    setSelectedPrompt(promptId);
  };

  const updatePrompt = async (promptIndex: number, modificationRequest: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              sender: 'system',
              text: `You are an assessment designer. I will give you a prompt and a modification request. 
              Please provide the complete updated prompt in the same JSON format as the original.
              The response should be a single JSON object with the same structure as the original prompt.
              Do not include any explanations or additional text, just the JSON object.`
            },
            {
              sender: 'user',
              text: `Here is the current prompt:
              ${JSON.stringify(generatedPrompts[promptIndex], null, 2)}
              
              Please modify it according to this request: ${modificationRequest}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      try {
        // Clean and parse the response
        const cleanText = data.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const updatedPrompt = JSON.parse(cleanText);
        
        // Update the prompts array
        const newPrompts = [...generatedPrompts];
        newPrompts[promptIndex] = updatedPrompt;
        setGeneratedPrompts(newPrompts);
        setLastUpdatedPrompt(updatedPrompt.id);

        // Add a confirmation message with a link to view the prompt
        setMessages(prev => [...prev, {
          text: `I've updated Prompt ${promptIndex + 1} based on your request. The changes have been applied. [View updated prompt](#view-prompt-${updatedPrompt.id})`,
          sender: 'system'
        }]);

        // Clear the highlight after 5 seconds
        setTimeout(() => {
          setLastUpdatedPrompt(null);
        }, 5000);
      } catch (error) {
        console.error('Error parsing updated prompt:', error);
        setMessages(prev => [...prev, {
          text: "I apologize, but I couldn't properly update the prompt. Please try again with a different modification request.",
          sender: 'system'
        }]);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble updating the prompt. Please try again later.",
        sender: 'system'
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessage = { text: userInput, sender: 'user' as const };
    setMessages(prev => [...prev, newMessage]);
    setUserFeedback(userInput);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Check if the message is a prompt modification request
      const promptModRegex = /(?:modify|change|update|revise|try something different for|include.*in|add.*to).*prompt\s*(\d+)/i;
      const match = userInput.match(promptModRegex);
      
      if (match) {
        const promptIndex = parseInt(match[1]) - 1;
        if (promptIndex >= 0 && promptIndex < generatedPrompts.length) {
          await updatePrompt(promptIndex, userInput);
          setIsLoading(false);
          return;
        }
      }

      // If not a modification request, proceed with normal chat
      const contextMessage = {
        sender: 'system',
        text: `Here are the three assessment prompts I generated for you:

${generatedPrompts.map((prompt, index) => `
Prompt ${index + 1}:
Title: ${prompt.title}
Description: ${prompt.description}
Instructions: ${prompt.instructions}
Rubric:
${prompt.rubric.map(criterion => `- ${criterion.criteria}:
  * Excellent: ${criterion.excellent}
  * Proficient: ${criterion.proficient}
  * Developing: ${criterion.developing}`).join('\n')}
`).join('\n\n')}

Please use this information to answer any questions about these prompts. You can also help modify the prompts based on user feedback.`
      };

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            contextMessage,
            ...messages,
            newMessage
          ] 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        sender: 'system'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {selectedPrompt ? (
        <div className="min-h-screen">
          <button 
            onClick={() => setSelectedPrompt(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Conversation
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold">{generatedPrompts.find(p => p.id === selectedPrompt)?.title}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-gray-700">
                  {generatedPrompts.find(p => p.id === selectedPrompt)?.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="prose max-w-none">
                    {generatedPrompts.find(p => p.id === selectedPrompt)?.instructions}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Rubric</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    {generatedPrompts.find(p => p.id === selectedPrompt)?.rubric.map((criterion: RubricCriterion, index: number) => (
                      <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <h4 className="font-medium mb-2">{criterion.criteria}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="font-medium text-green-700">Excellent</p>
                            <p className="text-sm">{criterion.excellent}</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-700">Proficient</p>
                            <p className="text-sm">{criterion.proficient}</p>
                          </div>
                          <div>
                            <p className="font-medium text-orange-700">Developing</p>
                            <p className="text-sm">{criterion.developing}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
                Back
              </Button>
              <Button>
                Use This Prompt
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar - Assessment Info */}
          <div className="md:w-1/3 lg:w-1/4 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">BIO 101 - Project Name Here</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Learning Objectives:</h4>
              <div className="space-y-2">
                {selectedObjectives.map(objective => (
                  <p key={objective.id} className="text-sm">
                    {objective.text}
                  </p>
                ))}
              </div>
              <div className="text-right">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Assignment Parameters</h4>
              <div className="space-y-1 text-sm">
                <p>Time: <span className="text-gray-600">{timeRequirement}</span></p>
                <p>Complexity Level: <span className="text-gray-600">{complexityLevel.split(' - ')[0]}</span></p>
                <p>Assignment Type: <span className="text-gray-600">{assignmentType}</span></p>
                <p>Skills to Assess: <span className="text-gray-600">{selectedSkills.map(s => s.name).join(', ')}</span></p>
              </div>
              <div className="text-right">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content - Chat and Prompts */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Assessment Prompts */}
            <div className="mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map(prompt => (
                  <div 
                    key={prompt.id}
                    className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all ${
                      lastUpdatedPrompt === prompt.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-3">[ PROMPT #{prompt.id} ]</h3>
                    <p className="text-gray-700 mb-4">{prompt.description}</p>
                    <button 
                      onClick={() => handleMoreInfo(prompt.id)}
                      className="text-[#00BFA5] text-sm font-medium hover:text-[#00A896] flex items-center"
                    >
                      More Info
                      <ChevronDown size={16} className="ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              What do you think about these? Is there one you'd like to move forward with?
            </p>
            
            {/* Chat messages */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.sender === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
                >
                  <div 
                    className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-white border border-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: message.text.replace(
                        /\[View updated prompt\]\(#view-prompt-([^)]+)\)/g,
                        (_, promptId) => `<a href="#" class="text-blue-600 hover:text-blue-800 underline" data-prompt-id="${promptId}">View updated prompt</a>`
                      )
                    }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'A') {
                        e.preventDefault();
                        const promptId = target.getAttribute('data-prompt-id');
                        if (promptId) {
                          setSelectedPrompt(promptId);
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Chat input */}
            <div className="flex items-center gap-2 relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your thoughts or questions here..."
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;