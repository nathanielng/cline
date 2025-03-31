document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const credentialsTextarea = document.getElementById('credentials');
    const pasteBtn = document.getElementById('pasteBtn');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusElement = document.getElementById('status');
    const credentialsDisplay = document.getElementById('credentialsDisplay');
    const accessKeyDisplay = document.getElementById('accessKeyDisplay');
    const secretKeyDisplay = document.getElementById('secretKeyDisplay');
    const sessionTokenDisplay = document.getElementById('sessionTokenDisplay');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');

    // Load credentials from local storage on page load
    loadCredentials();

    // Event Listeners
    pasteBtn.addEventListener('click', pasteFromClipboard);
    saveBtn.addEventListener('click', saveCredentials);
    clearBtn.addEventListener('click', clearAll);
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            copyToClipboard(key);
        });
    });

    // Function to parse AWS credentials from text
    function parseCredentials(text) {
        const credentials = {};
        
        // Regular expressions to match AWS credential export statements
        const accessKeyRegex = /export\s+AWS_ACCESS_KEY_ID=([^\s]+)/;
        const secretKeyRegex = /export\s+AWS_SECRET_ACCESS_KEY=([^\s]+)/;
        const sessionTokenRegex = /export\s+AWS_SESSION_TOKEN=([^\s]+)/;
        
        // Extract credentials using regex
        const accessKeyMatch = text.match(accessKeyRegex);
        const secretKeyMatch = text.match(secretKeyRegex);
        const sessionTokenMatch = text.match(sessionTokenRegex);
        
        if (accessKeyMatch) credentials.AWS_ACCESS_KEY_ID = accessKeyMatch[1];
        if (secretKeyMatch) credentials.AWS_SECRET_ACCESS_KEY = secretKeyMatch[1];
        if (sessionTokenMatch) credentials.AWS_SESSION_TOKEN = sessionTokenMatch[1];
        
        return credentials;
    }

    // Function to save credentials to local storage
    function saveCredentials() {
        const text = credentialsTextarea.value.trim();
        
        if (!text) {
            showToast('Please enter AWS credentials');
            return;
        }
        
        const credentials = parseCredentials(text);
        
        // Validate that we have at least some credentials
        if (!credentials.AWS_ACCESS_KEY_ID && !credentials.AWS_SECRET_ACCESS_KEY && !credentials.AWS_SESSION_TOKEN) {
            showToast('No valid AWS credentials found');
            return;
        }
        
        // Save each credential to local storage if present
        if (credentials.AWS_ACCESS_KEY_ID) {
            localStorage.setItem('AWS_ACCESS_KEY_ID', credentials.AWS_ACCESS_KEY_ID);
        }
        
        if (credentials.AWS_SECRET_ACCESS_KEY) {
            localStorage.setItem('AWS_SECRET_ACCESS_KEY', credentials.AWS_SECRET_ACCESS_KEY);
        }
        
        if (credentials.AWS_SESSION_TOKEN) {
            localStorage.setItem('AWS_SESSION_TOKEN', credentials.AWS_SESSION_TOKEN);
        }
        
        // Update the UI
        loadCredentials();
        showToast('Credentials saved successfully');
    }

    // Function to load credentials from local storage
    function loadCredentials() {
        const accessKey = localStorage.getItem('AWS_ACCESS_KEY_ID');
        const secretKey = localStorage.getItem('AWS_SECRET_ACCESS_KEY');
        const sessionToken = localStorage.getItem('AWS_SESSION_TOKEN');
        
        if (accessKey || secretKey || sessionToken) {
            // Mask the credentials - show only first 4 characters followed by asterisks
            accessKeyDisplay.textContent = accessKey || '-';
            secretKeyDisplay.textContent = secretKey ? `${secretKey.slice(0, 30)}${'*'.repeat(10)}` : '-';
            sessionTokenDisplay.textContent = sessionToken ? `${sessionToken.slice(0, 30)}${'*'.repeat(80)}` : '-';
            
            credentialsDisplay.classList.remove('hidden');
            statusElement.textContent = 'Credentials loaded from local storage';
            statusElement.classList.remove('text-gray-400');
            statusElement.classList.add('text-green-400');
        } else {
            credentialsDisplay.classList.add('hidden');
            statusElement.textContent = 'No credentials stored yet';
            statusElement.classList.remove('text-green-400');
            statusElement.classList.add('text-gray-400');
        }
    }

    // Function to paste from clipboard
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            credentialsTextarea.value = text;
            // Automatically save credentials after pasting
            saveCredentials();
            showToast('Credentials pasted and saved');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            showToast('Failed to read clipboard. Please paste manually.');
        }
    }

    // Function to copy credential to clipboard
    async function copyToClipboard(key) {
        const value = localStorage.getItem(key);
        
        if (!value) {
            showToast(`No ${key} found`);
            return;
        }
        
        try {
            await navigator.clipboard.writeText(value);
            showToast(`${key} copied to clipboard`);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy to clipboard');
        }
    }

    // Function to clear all credentials
    function clearAll() {
        // Clear textarea
        credentialsTextarea.value = '';
        
        // Clear local storage
        localStorage.removeItem('AWS_ACCESS_KEY_ID');
        localStorage.removeItem('AWS_SECRET_ACCESS_KEY');
        localStorage.removeItem('AWS_SESSION_TOKEN');
        
        // Update UI
        loadCredentials();
        showToast('All credentials cleared');
    }

    // Function to show toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
