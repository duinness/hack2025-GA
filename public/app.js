document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const streamToggle = document.getElementById('streamToggle');

    // Initialize messages array with system message
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
      }];

    function isAtBottom() {
        const threshold = 100; // pixels from bottom to consider "at bottom"
        return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight <= threshold;
    }

    function scrollToBottom() {
        if (isAtBottom()) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
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

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}); 