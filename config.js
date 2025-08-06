// Configuration settings for the ChatGPT clone
const CONFIG = {
    // OpenRouter API configuration
    // In production with Vite, these will be replaced by build-time variables
    OPEN_ROUTER_API_KEY: typeof __OPENROUTER_API_KEY__ !== 'undefined'
        ? __OPENROUTER_API_KEY__
        : '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', // Fallback for development
    OPEN_ROUTER_ENDPOINT: typeof __OPENROUTER_ENDPOINT__ !== 'undefined'
        ? __OPENROUTER_ENDPOINT__
        : 'https://openrouter.ai/api/v1/chat/completions',
    DEFAULT_MODEL: typeof __DEFAULT_MODEL__ !== 'undefined'
        ? __DEFAULT_MODEL__
        : 'openai/gpt-3.5-turbo',

    // Application settings
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,

    // System message configuration
    SYSTEM_MESSAGE: "You are GLM 4.5, a helpful AI assistant.",

    // UI settings
    MAX_MESSAGE_LENGTH: 4000,
    TYPING_DELAY: 50, // milliseconds between each character when typing effect is enabled

    // Error messages
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'API key is not configured. Please check your configuration.',
        NETWORK_ERROR: 'Network error. Please check your connection and try again.',
        API_ERROR: 'Sorry, something went wrong. Please try again.',
        EMPTY_MESSAGE: 'Please enter a message.',
        MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 4000 characters.',
        RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
        CREDIT_ERROR: 'Insufficient credits. Please add credits to your OpenRouter account to continue using the service.',
        ACCOUNT_ERROR: 'Account access issue. Please check your OpenRouter account status and billing information.'
    }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
