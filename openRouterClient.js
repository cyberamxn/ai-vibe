// OpenRouter API client for handling chat completions
class OpenRouterClient {
    constructor() {
        this.apiKey = CONFIG.OPEN_ROUTER_API_KEY;
        this.endpoint = CONFIG.OPEN_ROUTER_ENDPOINT;
        this.defaultModel = CONFIG.DEFAULT_MODEL;
    }

    /**
     * Validates the API configuration
     * @returns {boolean} True if configuration is valid
     */
    validateConfig() {
        if (!this.apiKey || this.apiKey === 'YOUR_OPEN_ROUTER_API_KEY_HERE') {
            console.error('OpenRouter API key is not configured');
            return false;
        }
        return true;
    }

    /**
     * Ensures system message is present at the beginning of messages array
     * @param {Array} messages - Array of message objects
     * @returns {Array} Messages array with system message
     */
    ensureSystemMessage(messages) {
        // Check if first message is already a system message
        if (messages.length > 0 && messages[0].role === 'system') {
            return messages;
        }

        // Add system message at the beginning
        return [
            { role: 'system', content: CONFIG.SYSTEM_MESSAGE },
            ...messages
        ];
    }

    /**
     * Sends a chat completion request to OpenRouter API
     * @param {Array} messages - Array of message objects with role and content
     * @param {Object} options - Optional parameters for the request
     * @returns {Promise<Object>} API response
     */
    async sendChatMessage(messages, options = {}) {
        // Validate configuration
        if (!this.validateConfig()) {
            throw new Error(CONFIG.ERROR_MESSAGES.API_KEY_MISSING);
        }

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages array is required and cannot be empty');
        }

        // Add system message if not already present
        const messagesWithSystem = this.ensureSystemMessage(messages);

        // Prepare request body
        const requestBody = {
            model: options.model || this.defaultModel,
            messages: messagesWithSystem,
            max_tokens: options.maxTokens || CONFIG.MAX_TOKENS,
            temperature: options.temperature || CONFIG.TEMPERATURE,
            stream: false
        };

        // Prepare request headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'GLM 4.5 Chatbot'
        };

        try {
            console.log('Sending request to OpenRouter API...', {
                model: requestBody.model,
                messageCount: messagesWithSystem.length
            });

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenRouter API key.');
                } else if (response.status === 402) {
                    throw new Error('Insufficient credits. Please add credits to your OpenRouter account to continue.');
                } else if (response.status === 403) {
                    throw new Error('Access forbidden. This may be due to insufficient credits or account limitations. Please check your OpenRouter account.');
                } else if (response.status === 429) {
                    throw new Error(CONFIG.ERROR_MESSAGES.RATE_LIMIT);
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    // Try to extract more specific error message from response
                    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                    if (errorMessage.toLowerCase().includes('credit') || errorMessage.toLowerCase().includes('balance')) {
                        throw new Error(`Credit Error: ${errorMessage}. Please add credits to your OpenRouter account.`);
                    }
                    throw new Error(errorMessage);
                }
            }

            const data = await response.json();

            // Validate response structure
            if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                throw new Error('Invalid response format from API');
            }

            if (!data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('No content in API response');
            }

            console.log('Received response from OpenRouter API', {
                model: data.model,
                usage: data.usage
            });

            return data;

        } catch (error) {
            console.error('Error communicating with OpenRouter API:', error);

            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
            }

            // Re-throw the error with original message if it's already a custom error
            throw error;
        }
    }

    /**
     * Extracts the assistant's message content from the API response
     * @param {Object} response - API response object
     * @returns {string} Assistant's message content
     */
    extractMessageContent(response) {
        try {
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error extracting message content:', error);
            throw new Error('Failed to extract message from API response');
        }
    }

    /**
     * Formats messages for the OpenRouter API
     * @param {Array} conversationHistory - Array of conversation messages
     * @returns {Array} Formatted messages array
     */
    formatMessages(conversationHistory) {
        return conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Gets available models (placeholder for future implementation)
     * @returns {Promise<Array>} Array of available models
     */
    async getAvailableModels() {
        // This would require a separate API call to get available models
        // For now, return a default set
        return [
            { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
            { id: 'openai/gpt-4o', name: 'GPT-4o' },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' }
        ];
    }
}

// Create a global instance
const openRouterClient = new OpenRouterClient();
