document.addEventListener('DOMContentLoaded', () => {
    let timerId = null;
    let currentMode = 'pomodoro';
    let timeLeft = 25 * 60;

    const minutesDisplay = document.getElementById('timer-minutes');
    const secondsDisplay = document.getElementById('timer-seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const timerDisplay = document.querySelector('.timer-display');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    const inputPomodoro = document.getElementById('input-pomodoro');
    const inputShort = document.getElementById('input-short');
    const inputLong = document.getElementById('input-long');

    let modes = {
        pomodoro: 25 * 60,
        short: 5 * 60,
        long: 15 * 60
    };

    function init() {
        timeLeft = modes[currentMode];
        updateDisplay();
    }

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - PPOMOMO`;
    }

    function startTimer() {
        if (timerId !== null) return;
        
        timerDisplay.classList.add('running');
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'block';

        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                timerDisplay.classList.remove('running');
                
                playAlarm();
                triggerBurst();
                
                setTimeout(() => {
                    alert('Time is up!'); 
                    resetTimer();
                }, 100);
            }
        }, 1000);
    }

    function playAlarm() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    function triggerBurst() {
        const container = document.querySelector('.timer-wrapper');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'juice-particle animate';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            const colors = ['#FF8A8A', '#FFCAB0', '#FF7F50', '#FFF5F1'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const size = 10 + Math.random() * 20;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    function pauseTimer() {
        clearInterval(timerId);
        timerId = null;
        timerDisplay.classList.remove('running');
        startBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = modes[currentMode];
        updateDisplay();
    }

    function switchMode(e) {
        const newMode = e.target.dataset.mode;
        if (newMode === currentMode) return;

        modeBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentMode = newMode;
        resetTimer();
    }

    function toggleModal() {
        settingsModal.classList.toggle('active');
    }

    function saveSettings() {
        modes.pomodoro = parseInt(inputPomodoro.value) * 60;
        modes.short = parseInt(inputShort.value) * 60;
        modes.long = parseInt(inputLong.value) * 60;
        
        resetTimer();
        toggleModal();
    }

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    modeBtns.forEach(btn => btn.addEventListener('click', switchMode));
    settingsBtn.addEventListener('click', toggleModal);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) toggleModal();
    });

    init();
});
