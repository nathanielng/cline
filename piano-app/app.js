const piano = document.getElementById('piano');
const scoreCanvas = document.getElementById('score');
const scoreCtx = scoreCanvas.getContext('2d');
const playOdeButton = document.getElementById('play-ode');
const playTwinkleButton = document.getElementById('play-twinkle');
const pausePlayButton = document.getElementById('pause-play');
const noteDisplay = document.getElementById('note-display');
const fullLyricsDisplay = document.getElementById('full-lyrics');
const timeline = document.getElementById('timeline');
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const startOctave = 3; // Starting octave for the leftmost key

let audioContext;
let oscillator;
let currentSong = null;
let isPaused = false;
let startTime;
let pauseTime;
let currentNoteIndex = 0;

const odeToJoy = {
    notes: [
        {note: 'E4', duration: 500, lyric: 'Joy'},
        {note: 'E4', duration: 500, lyric: 'ful,'},
        {note: 'F4', duration: 500, lyric: 'joy'},
        {note: 'G4', duration: 500, lyric: 'ful,'},
        {note: 'G4', duration: 500, lyric: 'we'},
        {note: 'F4', duration: 500, lyric: 'a'},
        {note: 'E4', duration: 500, lyric: 'dore'},
        {note: 'D4', duration: 500, lyric: 'Thee,'},
        {note: 'C4', duration: 500, lyric: 'God'},
        {note: 'C4', duration: 500, lyric: 'of'},
        {note: 'D4', duration: 500, lyric: 'glo'},
        {note: 'E4', duration: 500, lyric: 'ry,'},
        {note: 'E4', duration: 750, lyric: 'Lord'},
        {note: 'D4', duration: 250, lyric: 'of'},
        {note: 'D4', duration: 1000, lyric: 'love!'}
    ],
    fullLyrics: "Joyful, joyful, we adore Thee, God of glory, Lord of love!"
};

const twinkleTwinkleLittleStar = {
    notes: [
        {note: 'C4', duration: 500, lyric: 'Twin'},
        {note: 'C4', duration: 500, lyric: 'kle,'},
        {note: 'G4', duration: 500, lyric: 'twin'},
        {note: 'G4', duration: 500, lyric: 'kle,'},
        {note: 'A4', duration: 500, lyric: 'lit'},
        {note: 'A4', duration: 500, lyric: 'tle'},
        {note: 'G4', duration: 1000, lyric: 'star,'},
        {note: 'F4', duration: 500, lyric: 'How'},
        {note: 'F4', duration: 500, lyric: 'I'},
        {note: 'E4', duration: 500, lyric: 'won'},
        {note: 'E4', duration: 500, lyric: 'der'},
        {note: 'D4', duration: 500, lyric: 'what'},
        {note: 'D4', duration: 500, lyric: 'you'},
        {note: 'C4', duration: 1000, lyric: 'are!'},
        {note: 'G4', duration: 500, lyric: 'Up'},
        {note: 'G4', duration: 500, lyric: 'a'},
        {note: 'F4', duration: 500, lyric: 'bove'},
        {note: 'F4', duration: 500, lyric: 'the'},
        {note: 'E4', duration: 500, lyric: 'world'},
        {note: 'E4', duration: 500, lyric: 'so'},
        {note: 'D4', duration: 1000, lyric: 'high,'},
        {note: 'G4', duration: 500, lyric: 'Like'},
        {note: 'G4', duration: 500, lyric: 'a'},
        {note: 'F4', duration: 500, lyric: 'dia'},
        {note: 'F4', duration: 500, lyric: 'mond'},
        {note: 'E4', duration: 500, lyric: 'in'},
        {note: 'E4', duration: 500, lyric: 'the'},
        {note: 'D4', duration: 1000, lyric: 'sky.'}
    ],
    fullLyrics: "Twinkle, twinkle, little star, How I wonder what you are! Up above the world so high, Like a diamond in the sky."
};

function createPiano() {
    for (let octave = startOctave; octave < startOctave + 3; octave++) {
        for (let i = 0; i < 12; i++) {
            const key = document.createElement('div');
            key.className = `key ${isBlackKey(i) ? 'black' : 'white'}`;
            key.dataset.note = `${notes[i]}${octave}`;
            key.addEventListener('mousedown', playNote);
            key.addEventListener('mouseup', stopNote);
            key.addEventListener('mouseleave', stopNote);
            piano.appendChild(key);
        }
    }
}

function isBlackKey(index) {
    return [1, 3, 6, 8, 10].includes(index);
}

function playNote(event) {
    const note = event.target.dataset.note;
    event.target.classList.add('active');
    updateScore(note);
    playSound(note);
    displayNote(note);
}

function stopNote(event) {
    event.target.classList.remove('active');
    stopSound();
}

function updateScore(currentNote) {
    drawScore();
    if (currentSong) {
        let xPosition = 50;
        currentSong.notes.forEach((note, index) => {
            drawNote(note.note, xPosition, index === currentNoteIndex);
            xPosition += (note.duration / 35); // Adjust this value to change spacing
        });
    } else {
        drawNote(currentNote, 60, true);
    }
}

function drawScore() {
    scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    
    // Draw staff lines
    for (let i = 0; i < 5; i++) {
        scoreCtx.beginPath();
        scoreCtx.moveTo(10, 30 + i * 10);
        scoreCtx.lineTo(scoreCanvas.width - 10, 30 + i * 10);
        scoreCtx.stroke();
    }
    
    // Draw treble clef
    scoreCtx.font = '85px serif';
    scoreCtx.fillText('𝄞', 10, 75);
}

function drawNote(note, x, highlight) {
    const notePositions = {
        'C': 70, 'D': 65, 'E': 60, 'F': 55, 'G': 50, 'A': 45, 'B': 40
    };
    
    const noteName = note.charAt(0);
    const y = notePositions[noteName];
    
    // Draw stem
    scoreCtx.beginPath();
    scoreCtx.moveTo(x + 3, y);
    scoreCtx.lineTo(x + 3, y - 30);
    scoreCtx.strokeStyle = highlight ? 'red' : 'black';
    scoreCtx.stroke();
    
    // Draw notehead
    scoreCtx.beginPath();
    scoreCtx.ellipse(x, y, 6, 4, Math.PI / 2, 0, 2 * Math.PI);
    scoreCtx.fillStyle = highlight ? 'blue' : 'black';
    scoreCtx.fill();
    
    scoreCtx.strokeStyle = 'black';
    scoreCtx.fillStyle = 'black';
}

function displayNote(note) {
    noteDisplay.textContent = note;
}

function displayFullLyrics(song) {
    fullLyricsDisplay.innerHTML = song.notes.map(note => `<span>${note.lyric}</span>`).join(' ');
}

function highlightLyric(index) {
    const lyricSpans = fullLyricsDisplay.querySelectorAll('span');
    lyricSpans.forEach(span => span.classList.remove('highlight'));
    if (index < lyricSpans.length) {
        lyricSpans[index].classList.add('highlight');
    }
}

function updateTimeline(progress) {
    timeline.style.width = `${progress * 100}%`;
}

function playSound(note) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const frequency = getFrequency(note);
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    oscillator.connect(audioContext.destination);
    oscillator.start();
}

function stopSound() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }
}

function getFrequency(note) {
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const noteIndex = notes.indexOf(noteName);
    const a4 = 440;
    return a4 * Math.pow(2, (noteIndex + (octave - 4) * 12) / 12);
}

function playSong(song) {
    currentSong = song;
    currentNoteIndex = 0;
    startTime = audioContext.currentTime;
    isPaused = false;
    pausePlayButton.textContent = '⏸';
    displayFullLyrics(song);
    updateScore();
    playNextNote();
}

function playNextNote() {
    if (isPaused || currentNoteIndex >= currentSong.notes.length) {
        if (currentNoteIndex >= currentSong.notes.length) {
            pausePlayButton.textContent = '▶';
            isPaused = true;
        }
        return;
    }

    const {note, duration, lyric} = currentSong.notes[currentNoteIndex];
    const key = piano.querySelector(`[data-note="${note}"]`);
    const noteStartTime = audioContext.currentTime;

    playSound(note);
    key.classList.add('active');
    updateScore(note);
    displayNote(note);
    highlightLyric(currentNoteIndex);

    setTimeout(() => {
        key.classList.remove('active');
        stopSound();
    }, duration);

    currentNoteIndex++;
    const progress = currentNoteIndex / currentSong.notes.length;
    updateTimeline(progress);

    setTimeout(playNextNote, duration);
}

function togglePausePlay() {
    if (!currentSong) return;

    if (isPaused) {
        isPaused = false;
        pausePlayButton.textContent = '⏸';
        startTime += audioContext.currentTime - pauseTime;
        playNextNote();
    } else {
        isPaused = true;
        pausePlayButton.textContent = '▶';
        pauseTime = audioContext.currentTime;
    }
}

createPiano();
drawScore();

playOdeButton.addEventListener('click', () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    playSong(odeToJoy);
});

playTwinkleButton.addEventListener('click', () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    playSong(twinkleTwinkleLittleStar);
});

pausePlayButton.addEventListener('click', togglePausePlay);

// Add click event listener to the document to initialize audio context
document.addEventListener('click', function() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}, { once: true });
