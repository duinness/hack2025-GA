document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const streamToggle = document.getElementById('streamToggle');
    const systemPromptInput = document.getElementById('systemPromptInput');
    const addSystemPromptButton = document.getElementById('addSystemPrompt');
    const systemPromptsList = document.getElementById('systemPromptsList');
    const pdfDropZone = document.getElementById('pdfDropZone');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const assessmentOptions = document.getElementById('assessmentOptions');

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Initialize messages array with system messages
    let messages = [
      {
        role: 'system',
        content: `You are going to help design tests for a class. You will ask 3 questions to the user to help design the tests
          1. What are the course themes?
          2. What are the learning goals?
          3. What are the topics to cover?`
      },
      {
        role: 'system',
        content: `You will generate tailored project prompts, inclusive rubrics, and iterative feedback guidance for the user to design tests for a class.`
      },
      {
        role: 'system',
        content: 'Our definitions LSR definition: Relevant, skill-based assessment that is challenging, evokes reflection, encourages collaboration, and transfers to real-world contexts. Core components Application of critical thinking skills Relevant and/or real-world context (could also be seen as metacognitive practice) Higher order thinking skills associated with upper levels of Blooms taxonomy and/or depth of knowledge (DOK) taxonomies Incorporates metacognitive skills - especially reflection - such as reflecting to stimulate deeper levels of knowledge and to build evaluative judgment skills Collaboration (in group context) Somewhere I would write the 3 components that I have found work well - students create something "real" or "genuine" or found in the real world; projects are grounded in what is being done in class/connected in some specific way to class; and projects allow for student agency.'
      },
      {
        role: 'system',
        content: 'be concise and to the point'
      }
    ];

    // Display initial system prompts in the UI
    messages.forEach(message => {
        if (message.role === 'system') {
            addSystemPrompt(message.content);
        }
    });

    function isAtBottom() {
        const threshold = 100; // pixels from bottom to consider "at bottom"
        return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight <= threshold;
    }

    function scrollToBottom() {
        if (isAtBottom()) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function parseAssessmentOptions(content) {
        // Look for numbered options in the content
        const optionRegex = /(?:Option|Assessment)\s*(\d+)[:.]\s*([\s\S]*?)(?=(?:Option|Assessment)\s*\d+[:.]|$)/gi;
        const options = [];
        let match;

        while ((match = optionRegex.exec(content)) !== null) {
            options.push({
                number: match[1],
                content: match[2].trim()
            });
        }

        return options;
    }

    function displayAssessmentOptions(options) {
        assessmentOptions.innerHTML = '';
        assessmentOptions.classList.add('visible');

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'assessment-option';
            optionDiv.innerHTML = `
                <h4>Option ${option.number}</h4>
                <p>${option.content}</p>
                <button class="select-button">Select this option</button>
            `;

            optionDiv.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.assessment-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                // Add selected class to clicked option
                optionDiv.classList.add('selected');
            });

            assessmentOptions.appendChild(optionDiv);
        });

        // Scroll chat messages to bottom after adding options
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    function addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        
        // If this is an assistant message, check for assessment options
        if (role === 'assistant') {
            const options = parseAssessmentOptions(content);
            if (options.length >= 3) {
                displayAssessmentOptions(options);
            } else {
                scrollToBottom();
            }
        } else {
            scrollToBottom();
        }
    }

    function addSystemPrompt(prompt) {
        // Add to messages array
        messages.push({
            role: 'system',
            content: prompt
        });

        // Add to UI
        const promptItem = document.createElement('div');
        promptItem.className = 'system-prompt-item';
        
        const promptText = document.createElement('div');
        promptText.textContent = prompt;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-prompt';
        removeButton.textContent = '×';
        removeButton.onclick = () => {
            // Remove from messages array
            const index = messages.findIndex(m => m.role === 'system' && m.content === prompt);
            if (index !== -1) {
                messages.splice(index, 1);
            }
            // Remove from UI
            promptItem.remove();
        };

        promptItem.appendChild(promptText);
        promptItem.appendChild(removeButton);
        systemPromptsList.appendChild(promptItem);
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typingIndicator';
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async function sendMessage() {
        const content = userInput.value.trim();
        if (!content) return;

        // Disable input while processing
        userInput.disabled = true;
        sendButton.disabled = true;

        // Add user message
        addMessage(content, 'user');
        messages.push({ role: 'user', content });

        // Add typing indicator
        addTypingIndicator();

        try {
            if (streamToggle.checked) {
                await handleStreamingResponse();
            } else {
                await handleRegularResponse();
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was an error processing your request.', 'assistant');
        } finally {
            // Re-enable input
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.value = '';
            userInput.focus();
            removeTypingIndicator();
        }
    }

    async function handleStreamingResponse() {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let messageDiv = null;

        // Create initial message div
        messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        chatMessages.appendChild(messageDiv);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            console.log('Received chunk:', chunk);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        console.log('Parsed chunk:', parsed);

                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            assistantMessage += content;
                            messageDiv.textContent = assistantMessage;
                            scrollToBottom();
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e, 'Raw data:', data);
                    }
                }
            }
        }

        messages.push({ role: 'assistant', content: assistantMessage });
        
        // Check for assessment options after streaming is complete
        const options = parseAssessmentOptions(assistantMessage);
        if (options.length >= 3) {
            displayAssessmentOptions(options);
        }
    }

    async function handleRegularResponse() {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Received response:', data);
        
        addMessage(data.content, 'assistant');
        messages.push({ role: 'assistant', content: data.content });
    }

    async function extractTextFromPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            return fullText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw error;
        }
    }

    async function handlePDFFile(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        try {
            const text = await extractTextFromPDF(file);
            addSystemPrompt(`PDF Content: ${text}`);
        } catch (error) {
            console.error('Error processing PDF:', error);
            alert('Error processing PDF file');
        }
    }

    // PDF Drop Zone Event Listeners
    pdfDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfDropZone.classList.add('dragover');
    });

    pdfDropZone.addEventListener('dragleave', () => {
        pdfDropZone.classList.remove('dragover');
    });

    pdfDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfDropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handlePDFFile(file);
        }
    });

    pdfDropZone.addEventListener('click', () => {
        pdfFileInput.click();
    });

    pdfFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handlePDFFile(file);
        }
    });

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    addSystemPromptButton.addEventListener('click', () => {
        const prompt = systemPromptInput.value.trim();
        if (prompt) {
            addSystemPrompt(prompt);
            systemPromptInput.value = '';
        }
    });

    systemPromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addSystemPromptButton.click();
        }
    });
}); 