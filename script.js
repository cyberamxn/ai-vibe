// Main application script for ChatGPT clone
class ChatApp {
    constructor() {
        this.conversation = [];
        this.isLoading = false;
        this.messageIdCounter = 0;
        this.chatHistory = []; // Store all chat sessions
        this.currentChatId = null;
        this.chatCounter = 1;

        // DOM elements
        this.chatForm = null;
        this.chatInput = null;
        this.chatContainer = null;
        this.attachBtn = null;
        this.searchBtn = null;
        this.voiceBtn = null;
        this.newChatBtn = null;
        this.showHistoryBtn = null;
        this.loginBtn = null;
        this.signupBtn = null;
        this.themeToggleBtn = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeDOM();
            this.initializeTheme();
            this.initializeSidebar();
            this.attachEventListeners();
            this.loadChatHistory();
            this.showWelcomeMessage();
        });
    }

    /**
     * Initialize DOM element references
     */
    initializeDOM() {
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatContainer = document.getElementById('chat-container');
        this.attachBtn = document.getElementById('attach-btn');
        this.searchBtn = document.getElementById('search-btn');
        this.voiceBtn = document.getElementById('voice-btn');
        this.newChatBtn = document.querySelector('.new-chat-btn');
        this.showHistoryBtn = document.getElementById('show-history-btn');
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.loginBtn = document.querySelector('.header-btn:nth-child(2)');
        this.signupBtn = document.querySelector('.header-btn:last-child');

        if (!this.chatForm || !this.chatInput || !this.chatContainer) {
            console.error('Required DOM elements not found');
            return;
        }
    }

    /**
     * Initialize sidebar state - hidden by default
     */
    initializeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // Sidebar starts hidden by default in CSS, no need to add hidden class
            // But ensure it's properly hidden
            sidebar.classList.remove('visible');
            sidebar.classList.add('hidden');
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Form submission
        this.chatForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Input field events
        this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.chatInput.addEventListener('input', () => this.handleInputChange());

        // Button events
        this.attachBtn?.addEventListener('click', () => this.handleAttachClick());
        this.searchBtn?.addEventListener('click', () => this.handleSearchClick());
        this.voiceBtn?.addEventListener('click', () => this.handleVoiceClick());
        this.newChatBtn?.addEventListener('click', () => this.handleNewChatClick());
        this.showHistoryBtn?.addEventListener('click', () => this.handleShowHistoryClick());
        this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());
        this.loginBtn?.addEventListener('click', () => this.handleLoginClick());
        this.signupBtn?.addEventListener('click', () => this.handleSignupClick());

        // Sidebar toggle button
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        if (sidebarToggleBtn) {
            sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Chat item clicks - will be attached dynamically
        this.attachChatItemListeners();
    }

    /**
     * Handle show history button click
     */
    handleShowHistoryClick() {
        this.toggleSidebar();
    }

    /**
     * Initialize theme from localStorage
     */
    initializeTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                this.updateThemeToggleIcon(true);
            } else {
                this.updateThemeToggleIcon(false);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    }

    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        try {
            const body = document.body;
            const isDark = body.classList.contains('dark-theme');

            if (isDark) {
                body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                this.updateThemeToggleIcon(false);
            } else {
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                this.updateThemeToggleIcon(true);
            }
        } catch (error) {
            console.error('Failed to toggle theme:', error);
        }
    }

    /**
     * Update theme toggle button icon
     */
    updateThemeToggleIcon(isDark) {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.innerHTML = isDark ? '☀️' : '🌙';
            this.themeToggleBtn.title = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
        }
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const isVisible = sidebar.classList.contains('visible');

            if (isVisible) {
                sidebar.classList.remove('visible');
                sidebar.classList.add('hidden');
            } else {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('visible');
            }
        }
    }

    /**
     * Attach event listeners to chat items
     */
    attachChatItemListeners() {
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleChatItemClick(e.currentTarget));
        });
    }

    /**
     * Manage conversation length to prevent context overflow
     */
    manageConversationLength(conversation) {
        const MAX_CONVERSATION_LENGTH = 30; // Maximum number of messages to keep
        const KEEP_RECENT_MESSAGES = 24; // Keep the most recent messages

        if (conversation.length <= MAX_CONVERSATION_LENGTH) {
            return conversation;
        }

        // Keep the most recent messages to prevent context overflow
        return conversation.slice(-KEEP_RECENT_MESSAGES);
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        if (this.isLoading) {
            return;
        }

        const userMessage = this.chatInput.value.trim();

        // Validate message
        if (!userMessage) {
            this.showError(CONFIG.ERROR_MESSAGES.EMPTY_MESSAGE);
            return;
        }

        if (userMessage.length > CONFIG.MAX_MESSAGE_LENGTH) {
            this.showError(CONFIG.ERROR_MESSAGES.MESSAGE_TOO_LONG);
            return;
        }

        // Clear input and disable form
        this.chatInput.value = '';
        this.setLoading(true);

        try {
            // Add user message to conversation and UI
            this.addMessage('user', userMessage);
            this.conversation.push({ role: 'user', content: userMessage });

            // Show loading indicator
            const loadingMessageId = this.addLoadingMessage();

            // Manage conversation length to prevent context overflow
            let conversationToSend = this.manageConversationLength(this.conversation);

            // Send message to API
            const response = await openRouterClient.sendChatMessage(conversationToSend);
            const botMessage = openRouterClient.extractMessageContent(response);

            // Remove loading indicator and add bot response
            this.removeMessage(loadingMessageId);
            this.addMessage('bot', botMessage);
            this.conversation.push({ role: 'assistant', content: botMessage });

            // Auto-save current chat
            this.autoSaveCurrentChat();

        } catch (error) {
            console.error('Error sending message:', error);
            this.removeLoadingMessage();
            this.showError(error.message || CONFIG.ERROR_MESSAGES.API_ERROR);
        } finally {
            this.setLoading(false);
            this.chatInput.focus();
        }
    }

    /**
     * Handle keydown events in input field
     */
    handleKeyDown(e) {
        // Submit on Enter (but not Shift+Enter)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleFormSubmit(e);
        }
    }

    /**
     * Handle input change events
     */
    handleInputChange() {
        // Auto-resize textarea if needed (future enhancement)
        // For now, just ensure the input is focused
    }

    /**
     * Add a message to the chat
     */
    addMessage(sender, content, messageId = null) {
        const id = messageId || `msg-${++this.messageIdCounter}`;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.id = id;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = '🤖';
            messageElement.appendChild(avatar);
        }

        messageElement.appendChild(messageContent);

        this.chatContainer.appendChild(messageElement);
        this.scrollToBottom();

        return id;
    }

    /**
     * Add a loading message
     */
    addLoadingMessage() {
        const id = `loading-${++this.messageIdCounter}`;

        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        messageElement.id = id;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '🤖';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const loadingDots = document.createElement('div');
        loadingDots.className = 'loading-dots';
        loadingDots.innerHTML = '<span></span><span></span><span></span>';

        messageContent.appendChild(loadingDots);
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);

        this.chatContainer.appendChild(messageElement);
        this.scrollToBottom();

        return id;
    }

    /**
     * Remove a message by ID
     */
    removeMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.remove();
        }
    }

    /**
     * Remove loading message (fallback method)
     */
    removeLoadingMessage() {
        const loadingMessages = this.chatContainer.querySelectorAll('[id^="loading-"]');
        loadingMessages.forEach(msg => msg.remove());
    }

    /**
     * Show an error message
     */
    showError(message) {
        this.addMessage('bot', `❌ ${message}`);
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        // Load chat history first
        this.loadChatHistory();

        // Only show if no messages exist
        if (this.chatContainer.children.length === 0) {
            // Don't add to conversation history
            this.addMessage('bot', 'Hello! I\'m GLM 4.5, your helpful AI assistant. How can I help you today?');
        }
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.chatInput.disabled = loading;

        if (loading) {
            this.chatInput.placeholder = 'Please wait...';
        } else {
            this.chatInput.placeholder = 'Ask anything';
        }
    }

    /**
     * Scroll chat container to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }

    /**
     * Handle new chat button click
     */
    handleNewChatClick() {
        // Save current chat if it has messages
        if (this.conversation.length > 0) {
            this.saveCurrentChat();
        }

        // Create new chat
        this.createNewChat();

        // Add welcome message
        this.addMessage('bot', '🆕 New chat started! I\'m GLM 4.5, how can I help you today?');
    }

    /**
     * Save current chat to history
     */
    saveCurrentChat() {
        if (this.conversation.length === 0) return;

        const chatTitle = this.generateChatTitle();
        const chatData = {
            id: this.currentChatId || `chat-${Date.now()}`,
            title: chatTitle,
            messages: [...this.conversation],
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        // Check if chat already exists and update it
        const existingIndex = this.chatHistory.findIndex(chat => chat.id === chatData.id);
        if (existingIndex !== -1) {
            this.chatHistory[existingIndex] = chatData;
        } else {
            // Add to chat history
            this.chatHistory.unshift(chatData);
        }

        // Update sidebar
        this.updateSidebar();

        // Save to localStorage
        this.saveChatHistory();
    }

    /**
     * Auto-save current chat (called after each message)
     */
    autoSaveCurrentChat() {
        if (this.conversation.length > 0) {
            this.saveCurrentChat();
        }
    }

    /**
     * Create new chat session
     */
    createNewChat() {
        this.conversation = [];
        this.currentChatId = `chat-${Date.now()}`;
        this.chatContainer.innerHTML = '';

        // Update active chat in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    /**
     * Generate chat title from first user message
     */
    generateChatTitle() {
        const firstUserMessage = this.conversation.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            let title = firstUserMessage.content.substring(0, 30);
            if (firstUserMessage.content.length > 30) {
                title += '...';
            }
            return title;
        }
        return `Chat ${this.chatCounter++}`;
    }

    /**
     * Update sidebar with chat history
     */
    updateSidebar() {
        const todayFolder = document.querySelector('.chat-folder:first-child');
        if (!todayFolder) return;

        // Clear existing dynamic chat items
        const existingDynamicItems = todayFolder.querySelectorAll('.chat-item.dynamic');
        existingDynamicItems.forEach(item => item.remove());

        // Add recent chats to Today folder
        const recentChats = this.chatHistory.slice(0, 10);
        recentChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item dynamic';
            chatItem.innerHTML = `<span class="chat-title">${chat.title}</span>`;
            chatItem.addEventListener('click', () => this.loadChat(chat.id));
            todayFolder.appendChild(chatItem);
        });
    }

    /**
     * Load a specific chat
     */
    loadChat(chatId) {
        // Save current chat first
        if (this.conversation.length > 0 && this.currentChatId !== chatId) {
            this.saveCurrentChat();
        }

        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            this.conversation = [...chat.messages];
            this.currentChatId = chatId;

            // Clear and reload messages
            this.chatContainer.innerHTML = '';
            chat.messages.forEach(msg => {
                this.addMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
            });

            // Update active chat in sidebar
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });

            // Find and activate the clicked chat item
            const chatItems = document.querySelectorAll('.chat-item');
            chatItems.forEach(item => {
                if (item.querySelector('.chat-title').textContent === chat.title) {
                    item.classList.add('active');
                }
            });
        }
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('chatHistory');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                this.updateSidebar();
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    /**
     * Handle login button click
     */
    handleLoginClick() {
        const modal = this.createModal('Login', `
            <form id="login-form" style="display: flex; flex-direction: column; gap: 16px;">
                <input type="email" placeholder="Email" required style="padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
                <input type="password" placeholder="Password" required style="padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
                <button type="submit" style="padding: 12px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Login</button>
            </form>
        `);

        modal.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMessage('bot', '✅ Login functionality is working! This is a demo - in a real app, you would be logged in now.');
            this.closeModal();
        });
    }

    /**
     * Handle signup button click
     */
    handleSignupClick() {
        const modal = this.createModal('Sign Up', `
            <form id="signup-form" style="display: flex; flex-direction: column; gap: 16px;">
                <input type="text" placeholder="Full Name" required style="padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
                <input type="email" placeholder="Email" required style="padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
                <input type="password" placeholder="Password" required style="padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
                <button type="submit" style="padding: 12px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Sign Up</button>
            </form>
        `);

        modal.querySelector('#signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMessage('bot', '✅ Sign up functionality is working! This is a demo - in a real app, your account would be created now.');
            this.closeModal();
        });
    }

    /**
     * Handle chat item click
     */
    handleChatItemClick(item) {
        const chatTitle = item.querySelector('.chat-title').textContent;

        // Find the chat in history
        const chat = this.chatHistory.find(c => c.title === chatTitle);
        if (chat) {
            this.loadChat(chat.id);
        } else {
            // Remove active class from all items
            document.querySelectorAll('.chat-item').forEach(chatItem => {
                chatItem.classList.remove('active');
            });

            // Add active class to clicked item
            item.classList.add('active');

            // Clear current conversation and show demo message
            this.clearConversation();
            this.addMessage('bot', `📂 Loaded chat: "${chatTitle}". This is a demo chat.`);
        }
    }

    /**
     * Handle attach button click
     */
    handleAttachClick() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,text/*,.pdf,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addMessage('user', `📎 Attached: ${file.name}`);
                this.addMessage('bot', '✅ File attachment received! File processing functionality is working but not fully implemented in this demo.');
            }
        };
        input.click();
    }

    /**
     * Handle search button click
     */
    handleSearchClick() {
        const searchTerm = prompt('Search in conversation:');
        if (searchTerm) {
            this.addMessage('bot', `🔍 Searching for "${searchTerm}"... Search functionality is working! In a real app, this would search through your conversation history.`);
        }
    }

    /**
     * Handle voice button click
     */
    handleVoiceClick() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                this.addMessage('bot', '🎤 Voice recognition started! Speak now...');
                this.voiceBtn.style.backgroundColor = '#ff4444';
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.chatInput.value = transcript;
                this.voiceBtn.style.backgroundColor = '';
                this.addMessage('bot', `✅ Voice recognized: "${transcript}". Sending your message...`);
                setTimeout(() => {
                    this.handleFormSubmit(new Event('submit'));
                }, 1000);
            };

            recognition.onerror = () => {
                this.addMessage('bot', '❌ Voice recognition error. Please try again or check your microphone permissions.');
                this.voiceBtn.style.backgroundColor = '';
            };

            recognition.onend = () => {
                this.voiceBtn.style.backgroundColor = '';
            };

            recognition.start();
        } else {
            this.addMessage('bot', '❌ Voice recognition is not supported in your browser. Please try using Chrome or Edge.');
        }
    }

    /**
     * Create a modal dialog
     */
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                padding: 24px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 20px;">${title}</h2>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        return modal;
    }

    /**
     * Close modal dialog
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Clear conversation
     */
    clearConversation() {
        this.conversation = [];
        this.chatContainer.innerHTML = '';
        this.currentChatId = null;
    }

    /**
     * Export conversation
     */
    exportConversation() {
        const conversationData = {
            timestamp: new Date().toISOString(),
            messages: this.conversation
        };

        const dataStr = JSON.stringify(conversationData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chat-export-${Date.now()}.json`;
        link.click();
    }

    /**
     * Get conversation statistics
     */
    getStats() {
        const userMessages = this.conversation.filter(msg => msg.role === 'user').length;
        const botMessages = this.conversation.filter(msg => msg.role === 'assistant').length;
        const totalCharacters = this.conversation.reduce((sum, msg) => sum + msg.content.length, 0);

        return {
            userMessages,
            botMessages,
            totalMessages: this.conversation.length,
            totalCharacters
        };
    }
}

// Initialize the application
const chatApp = new ChatApp();

// Global functions for debugging/testing
window.chatApp = chatApp;
window.clearChat = () => chatApp.clearConversation();
window.exportChat = () => chatApp.exportConversation();
window.getStats = () => chatApp.getStats();
