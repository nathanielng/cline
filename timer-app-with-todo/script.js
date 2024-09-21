let timer;
let timeLeft;
let isRunning = false;
let audioContext;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const pomodoroBtn = document.getElementById('pomodoroBtn');
const preset1MinBtn = document.getElementById('preset1Min');
const preset5MinBtn = document.getElementById('preset5Min');
const preset10MinBtn = document.getElementById('preset10Min');
const preset1HourBtn = document.getElementById('preset1Hour');
const testSoundBtn = document.getElementById('testSoundBtn');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const soundSelect = document.getElementById('sound-select');

// To-Do List elements
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroBtn.addEventListener('click', () => setPresetTime(25 * 60));
preset1MinBtn.addEventListener('click', () => setPresetTime(60));
preset5MinBtn.addEventListener('click', () => setPresetTime(5 * 60));
preset10MinBtn.addEventListener('click', () => setPresetTime(10 * 60));
preset1HourBtn.addEventListener('click', () => setPresetTime(60 * 60));
testSoundBtn.addEventListener('click', testSound);

hoursInput.addEventListener('input', updateTimeFromInput);
minutesInput.addEventListener('input', updateTimeFromInput);
secondsInput.addEventListener('input', updateTimeFromInput);

// To-Do List event listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function setPresetTime(seconds) {
    resetTimer();
    timeLeft = seconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = remainingSeconds;
    updateDisplay();
}

function updateTimeFromInput() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    timeLeft = hours * 3600 + minutes * 60 + seconds;
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timer);
        startBtn.innerHTML = '<i class="fas fa-play"></i>';
        isRunning = false;
    } else {
        startTimer();
    }
}

function startTimer() {
    if (timeLeft === undefined || timeLeft === 0) {
        updateTimeFromInput();
    }

    if (timeLeft > 0) {
        isRunning = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i>';
        timer = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
    } else {
        clearInterval(timer);
        isRunning = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i>';
        playSound();
    }
}

function updateDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 0;
    isRunning = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i>';
    hoursInput.value = '0';
    minutesInput.value = '0';
    secondsInput.value = '0';
    updateDisplay();
}

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound() {
    const selectedSound = soundSelect.value;
    if (selectedSound !== 'none') {
        initAudioContext();
        switch (selectedSound) {
            case 'beep':
                playBeep();
                break;
            case 'arpeggio':
                playArpeggio();
                break;
            case 'melody':
                playMelody();
                break;
            case 'chime':
                playChime();
                break;
        }
    }
}

function playBeep() {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playArpeggio() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
        oscillator.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + index * 0.2);
        oscillator.stop(audioContext.currentTime + index * 0.2 + 0.2);
    });
}

function playMelody() {
    const notes = [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99, 880.00];
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
        oscillator.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + index * 0.2);
        oscillator.stop(audioContext.currentTime + index * 0.2 + 0.2);
    });
}

function playChime() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
}

function testSound() {
    playSound();
}

// To-Do List functions
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${todoText}</span>
            <div class="todo-actions">
                <button class="move-up-btn"><i class="fas fa-arrow-up"></i></button>
                <button class="move-down-btn"><i class="fas fa-arrow-down"></i></button>
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(li);
        todoInput.value = '';

        li.querySelector('.move-up-btn').addEventListener('click', () => moveTodo(li, 'up'));
        li.querySelector('.move-down-btn').addEventListener('click', () => moveTodo(li, 'down'));
        li.querySelector('.edit-btn').addEventListener('click', () => editTodo(li));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(li));
    }
}

function editTodo(li) {
    const span = li.querySelector('span');
    const newText = prompt('Edit task:', span.textContent);
    if (newText !== null) {
        span.textContent = newText.trim();
    }
}

function deleteTodo(li) {
    if (confirm('Are you sure you want to delete this task?')) {
        todoList.removeChild(li);
    }
}

function moveTodo(li, direction) {
    if (direction === 'up' && li.previousElementSibling) {
        todoList.insertBefore(li, li.previousElementSibling);
    } else if (direction === 'down' && li.nextElementSibling) {
        todoList.insertBefore(li.nextElementSibling, li);
    }
}

// Initialize with all times set to zero
resetTimer();
