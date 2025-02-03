document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const highlightColorPicker = document.getElementById('highlightColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');
    const fontSelector = document.getElementById('fontSelector');
    const fontSizeSelector = document.getElementById('fontSizeSelector');
    const fontStyleSelector = document.getElementById('fontStyleSelector');
    const speedControl = document.getElementById('speedControl');
    const speedValue = document.getElementById('speedValue');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const animationDisplay = document.getElementById('animationDisplay');

    let animationInterval;
    let currentWordIndex = 0;
    let words = [];

    // Update speed value display
    speedControl.addEventListener('input', () => {
        speedValue.textContent = `${speedControl.value}ms`;
    });

    // Start animation
    startButton.addEventListener('click', () => {
        // Reset any existing animation
        clearInterval(animationInterval);
        animationDisplay.innerHTML = '';
        currentWordIndex = 0;
        
        // Apply selected font properties to the animation display
        animationDisplay.style.fontFamily = fontSelector.value;
        animationDisplay.style.fontSize = fontSizeSelector.value;
        
        // Parse font style selection
        const style = fontStyleSelector.value;
        animationDisplay.style.fontWeight = style.includes('bold') ? 'bold' : 'normal';
        animationDisplay.style.fontStyle = style.includes('italic') ? 'italic' : 'normal';

        // Get words from input, preserving newlines
        const text = textInput.value.trim();
        if (!text) return;

        // Split text into lines first, then words, preserving line breaks
        words = text.split('\n').map(line => line.split(/\s+/)).flat();
        // Add special marker for line breaks
        words = words.reduce((acc, word, i, arr) => {
            acc.push(word);
            // If this word is the last in its line (followed by a newline in original text)
            if (text.slice(text.indexOf(word) + word.length).match(/^\s*\n/)) {
                acc.push('\n');
            }
            return acc;
        }, []);
        startButton.disabled = true;
        textInput.disabled = true;

        // Start the typing animation
        animationInterval = setInterval(() => {
            if (currentWordIndex < words.length) {
                if (words[currentWordIndex] === '\n') {
                    // Add line break
                    animationDisplay.appendChild(document.createElement('br'));
                    currentWordIndex++;
                } else {
                    // Create a span for the current word with the selected color
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = words[currentWordIndex] + ' ';
                    wordSpan.classList.add('current-word');
                    // Set the color for the current word
                    wordSpan.style.color = highlightColorPicker.value;
                
                    // Update all existing words to text color before adding the new one
                    const existingWords = animationDisplay.getElementsByClassName('current-word');
                    Array.from(existingWords).forEach(word => {
                        word.style.color = textColorPicker.value;
                    });
                    
                    animationDisplay.appendChild(wordSpan);
                    currentWordIndex++;

                    // Scroll to the bottom of the display
                    animationDisplay.scrollTop = animationDisplay.scrollHeight;
                }
            } else {
                clearInterval(animationInterval);
                startButton.disabled = false;
                textInput.disabled = false;
            }
        }, parseInt(speedControl.value));
    });

    // Reset animation
    resetButton.addEventListener('click', () => {
        clearInterval(animationInterval);
        animationDisplay.innerHTML = '';
        currentWordIndex = 0;
        startButton.disabled = false;
        textInput.disabled = false;
    });
});
