
Built by cyberamxn

---

# AI Vibe

AI Vibe is a web-based chat application that allows users to interact with a conversation agent using various input methods. The application utilizes the OpenRouter API to generate responses based on user input, providing an interactive and engaging experience.

## Project Overview

AI Vibe is a simple yet effective chat interface that supports features like voice input, attaching files, and managing chat history. Users can toggle between light and dark themes, making the user experience customizable.

## Installation

To run AI Vibe locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-vibe.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd ai-vibe
   ```

3. **Open `index.html` in your preferred web browser.**

> Note: Be sure to configure your API keys in `config.js` for the application to function properly.

## Usage

1. Upon opening the application, you can start a new chat by clicking the "+ New chat" button.
2. Type your message in the input field and press Enter or click the "Send" button to send a message.
3. Use the buttons for attaching files, voice input, or search functionalities.
4. Toggle the theme between light and dark by clicking the theme toggle icon.

## Features

- **Chat History Management:** Display chats from today, yesterday, and the last 7 days.
- **Voice Input Support:** Speak your messages instead of typing.
- **File Attachment:** Attach files to your messages.
- **Dynamic Theme Switching:** Toggle between light and dark themes.
- **Easy Navigation:** Sidebar for quick access to chat history.

## Dependencies

The project relies on features provided by the OpenRouter API. The configuration is located in `config.js`. Here’s a snippet of the configuration settings:

```javascript
// OpenRouter API configuration
    OPEN_ROUTER_API_KEY: 'your_api_key',
    OPEN_ROUTER_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions',
    DEFAULT_MODEL: 'openai/gpt-4o',
    MAX_TOKENS: 2000,
    DEFAULT_MODEL: __DEFAULT_MODEL__,
    TEMPERATURE: 0.7,
    // ... other settings
}
```

## Project Structure

The project is structured as follows:

```
/ai-vibe
├── index.html         # The main HTML file
├── style.css          # The stylesheet
├── config.js          # Configuration settings for API
├── openRouterClient.js # Client for handling chat completions via OpenRouter
├── script.js          # Main application logic and interaction
```

### File Descriptions

- **`index.html`:** The main HTML file that contains the app structure.
- **`style.css`:** The CSS file for styling the application, supporting responsive design and theme switching.
- **`config.js`:** Contains API keys and configuration settings for the OpenRouter API.
- **`openRouterClient.js`:** Implements the client-side logic for interacting with the OpenRouter API.
- **`script.js`:** The main JavaScript file that handles the application logic, user interactions, and chat handling.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or raise an issue if you find a bug or have a suggestion for improvement.

---

For any inquiries, please contact tg @AMANlSHERE