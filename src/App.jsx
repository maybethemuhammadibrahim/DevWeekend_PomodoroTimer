import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "pomodoro-history";
const TIMER_STATE_KEY = "pomodoro-timer-state";

function getTodayKey() {
  return new Date().toDateString();
}

function loadTodaySessions() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (data.date === getTodayKey()) {
      return data.sessions || [];
    }
    return [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), sessions })
  );
}

function loadTimerState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(TIMER_STATE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (data.date !== getTodayKey()) return null;

    return data.state || null;
  } catch {
    return null;
  }
}

function saveTimerState(state) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    TIMER_STATE_KEY,
    JSON.stringify({ date: getTodayKey(), state })
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatCompletionTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase().replace(' ', '');
}

// Y2K Decorative Components
function Sparkle({ className = "" }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function WindowControls() {
  return (
    <div className="flex gap-1.5">
      <div className="w-3 h-3 rounded-full bg-[#ff6b6b] border border-black" />
      <div className="w-3 h-3 rounded-full bg-[var(--y2k-yellow)] border border-black" />
      <div className="w-3 h-3 rounded-full bg-[#90ee90] border border-black" />
    </div>
  );
}

function RetroWindow({
  title,
  children,
  color = "white",
  className = "",
  contentClassName = "p-4",
}) {
  const bgColors = {
    white: "bg-white",
    pink: "bg-[var(--y2k-pink)]",
    blue: "bg-[var(--y2k-blue)]",
    yellow: "bg-[var(--y2k-yellow)]",
    lavender: "bg-[var(--y2k-lavender)]",
  };

  return (
    <div className={`y2k-window flex flex-col ${bgColors[color] || bgColors.white} ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-[var(--y2k-cream)] shrink-0 z-10">
        <WindowControls />
        <span className="text-sm tracking-wider uppercase">{title}</span>
        <div className="w-12" />
      </div>
      <div className={`flex-grow flex flex-col ${contentClassName}`}>{children}</div>
    </div>
  );
}

function ConfettiPiece({ className = "" }) {
  return <span className={`absolute rounded-sm ${className}`} />;
}

function SessionDoneOverlay() {
  const confettiPieces = [
    "left-[8%] top-[12%] w-3 h-8 bg-[var(--y2k-pink)] rotate-[-18deg]",
    "left-[16%] top-[26%] w-2 h-6 bg-[var(--y2k-yellow)] rotate-[25deg]",
    "left-[26%] top-[10%] w-3 h-7 bg-[var(--y2k-blue)] rotate-[10deg]",
    "right-[18%] top-[16%] w-3 h-8 bg-[var(--y2k-lavender)] rotate-[20deg]",
    "right-[10%] top-[32%] w-2 h-6 bg-[#ff8fb1] rotate-[-22deg]",
    "left-[12%] bottom-[18%] w-3 h-7 bg-[#90ee90] rotate-[18deg]",
    "left-[30%] bottom-[8%] w-2 h-6 bg-[var(--y2k-yellow)] rotate-[-14deg]",
    "right-[28%] bottom-[14%] w-3 h-8 bg-[var(--y2k-pink)] rotate-[30deg]",
    "right-[42%] top-[8%] w-2 h-6 bg-[#90ee90] rotate-[-8deg]",
    "left-[48%] top-[14%] w-3 h-7 bg-[var(--y2k-blue)] rotate-[16deg]",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] overlay-fade" />
      <div className="absolute inset-0 overflow-hidden">
        {confettiPieces.map((className, index) => (
          <ConfettiPiece key={index} className={`confetti-piece confetti-${(index % 5) + 1} ${className}`} />
        ))}
      </div>
      <div className="session-card relative pointer-events-auto w-full max-w-xl border-4 border-black bg-[var(--y2k-cream)] y2k-shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b-4 border-black bg-[var(--y2k-pink)] px-4 py-2">
          <span className="text-lg sm:text-xl font-bold tracking-[0.3em] uppercase">SESSION DONE</span>
          <span className="text-sm font-bold tracking-widest">01</span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="cuckoo-shell relative w-28 h-28 shrink-0">
              <div className="cuckoo-bird absolute inset-0 mx-auto my-auto w-20 h-16">
                <div className="bird-body" />
                <div className="bird-wing" />
                <div className="bird-head" />
                <div className="bird-beak" />
                <div className="bird-eye" />
                <div className="bird-tail" />
              </div>
              <div className="cuckoo-clock absolute left-1/2 -translate-x-1/2 bottom-[-12px] w-24 h-10 border-4 border-black bg-[var(--y2k-yellow)] rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-widest">CUCKOO!</div>
              <p className="text-xl sm:text-2xl font-bold leading-tight">
                Focus session complete.
                <br />
                Take a break and let the confetti fall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio hook using Web Audio API
function useAudio() {
  const audioContextRef = useRef(null);

  const playSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Create a pleasant chime sound
      const playNote = (frequency, startTime, duration) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Play a pleasant three-note chime
      playNote(523.25, now, 0.3); // C5
      playNote(659.25, now + 0.15, 0.3); // E5
      playNote(783.99, now + 0.3, 0.5); // G5
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  }, []);

  const playCalmSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const playNote = (frequency, startTime, duration) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      // Calm, deep ambient chord
      playNote(261.63, now, 2.5); // C4
      playNote(329.63, now, 2.5); // E4
      playNote(392.00, now, 2.5); // G4
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  }, []);

  const playClickSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Body: short noise burst for the "thock"
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Low-pass filter to make it sound woody/dampened, not hissy
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.06);

      // Sub-click: very short low tone for the tactile "click" layer
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.03);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

    } catch (e) { console.log("Audio playback failed:", e); }
  }, []);

  const playHoverSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.025;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3000;
      filter.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.025);

    } catch (e) { console.log("Audio playback failed:", e); }
  }, []);

  return { playSound, playCalmSound, playClickSound, playHoverSound };
}

export default function PomodoroTimer() {
  const savedTimerState = loadTimerState();
  const celebrationTimeoutRef = useRef(null);

  // Timer settings (in seconds)
  const [focusDuration, setFocusDuration] = useState(savedTimerState?.focusDuration ?? 25 * 60);
  const [breakDuration, setBreakDuration] = useState(savedTimerState?.breakDuration ?? 5 * 60);

  // Timer state
  const [mode, setMode] = useState(savedTimerState?.mode ?? "focus");
  const [timeLeft, setTimeLeft] = useState(
    savedTimerState?.timeLeft ?? (savedTimerState?.mode === "break" ? savedTimerState?.breakDuration ?? 5 * 60 : savedTimerState?.focusDuration ?? 25 * 60)
  );
  const [isRunning, setIsRunning] = useState(savedTimerState?.isRunning ?? false);
  const [sessions, setSessions] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Temp settings for the config panel
  const [tempFocusMin, setTempFocusMin] = useState(25);
  const [tempBreakMin, setTempBreakMin] = useState(5);

  const { playSound, playCalmSound, playClickSound, playHoverSound } = useAudio();

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSessions(loadTodaySessions());
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    saveTimerState({
      focusDuration,
      breakDuration,
      timeLeft,
      isRunning,
      mode,
    });
  }, [focusDuration, breakDuration, timeLeft, isRunning, mode]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completed
          playSound();

          if (mode === "focus") {
            setShowCelebration(true);
            if (celebrationTimeoutRef.current) {
              clearTimeout(celebrationTimeoutRef.current);
            }
            celebrationTimeoutRef.current = setTimeout(() => setShowCelebration(false), 2600);

            // Save completed focus session
            const newSession = {
              duration: focusDuration,
              completedAt: new Date().toISOString(),
              type: "focus",
            };
            const updatedSessions = [...sessions, newSession];
            setSessions(updatedSessions);
            saveSessions(updatedSessions);

            // Switch to break
            setMode("break");
            return breakDuration;
          } else {
            // Switch back to focus
            setMode("focus");
            return focusDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, focusDuration, breakDuration, sessions, playSound]);

  // Keep a paused countdown stable when settings change; only snap back when the timer is at the start.
  useEffect(() => {
    if (!isRunning && timeLeft === (mode === "focus" ? focusDuration : breakDuration)) {
      setTimeLeft(mode === "focus" ? focusDuration : breakDuration);
    }
  }, [focusDuration, breakDuration, mode, isRunning, timeLeft]);

  const handleStartPause = () => {
    playClickSound();
    if (!isRunning && mode === "focus") {
      playCalmSound();
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    playClickSound();
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? focusDuration : breakDuration);
  };

  const handleSkip = () => {
    playClickSound();
    setIsRunning(false);
    if (mode === "focus") {
      setMode("break");
      setTimeLeft(breakDuration);
    } else {
      setMode("focus");
      setTimeLeft(focusDuration);
    }
  };

  const applySettings = () => {
    const newFocus = Math.max(1, Math.min(120, tempFocusMin)) * 60;
    const newBreak = Math.max(1, Math.min(60, tempBreakMin)) * 60;
    setFocusDuration(newFocus);
    setBreakDuration(newBreak);
    setShowSettings(false);
    if (!isRunning) {
      setTimeLeft(mode === "focus" ? newFocus : newBreak);
    }
  };

  const totalDuration = mode === "focus" ? focusDuration : breakDuration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const windowColor = mode === "focus" ? "yellow" : "blue";
  const modeLabel = mode === "focus" ? "FOCUS TIME" : "BREAK TIME";
  const statusLabel = !isRunning && timeLeft === totalDuration
    ? "READY"
    : !isRunning
      ? "PAUSED"
      : mode === "focus"
        ? "FOCUSING..."
        : "RESTING...";

  const isFocusing = isRunning && mode === "focus";

  // Calculate cumulative focus time
  const totalFocusSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = Math.floor(totalFocusSeconds / 3600);
  const totalMins = Math.floor((totalFocusSeconds % 3600) / 60);
  const totalFocusStr = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  return (
    <main className="min-h-screen graph-paper flex flex-col items-center justify-center p-4 sm:p-12">
      {showCelebration && <SessionDoneOverlay />}



      <div className="w-full max-w-6xl space-y-12">
        {/* Header */}
        {/* <div className="text-center">
          <h1 className="text-5xl sm:text-7xl tracking-widest font-extrabold flex items-center justify-center gap-4 drop-shadow-sm">
            <Sparkle className="w-10 h-10 text-[var(--y2k-pink)]" />
            POMODORO
            <Sparkle className="w-10 h-10 text-[var(--y2k-blue)]" />
          </h1>
        </div> */}

        {/* Changed to items-stretch and lg:flex-row to allow 50/50 split on desktop */}
        <div className={`flex flex-col lg:flex-row items-stretch justify-center w-full transition-all duration-700 ${isFocusing ? "gap-0" : "gap-8"}`}>

          {/* Left Column - Main Timer Window */}
          <div className={`flex flex-col transition-all duration-700 ease-in-out ${isFocusing ? "w-full max-w-2xl mx-auto" : "w-full lg:w-1/2"}`}>
            <RetroWindow
              title={modeLabel}
              color={windowColor}
              className={`flex-grow ${showCelebration ? "celebrate" : ""}`}
              contentClassName="p-6 sm:p-8"
            >
              <div className="text-center space-y-8 flex flex-col h-full justify-center">
                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isRunning ? "bg-[#90ee90] progress-animate" : "bg-gray-300"
                      }`}
                  />
                  <span className="text-xl sm:text-2xl tracking-widest font-bold uppercase">{statusLabel}</span>
                </div>

                {/* Timer Display - Scaled up significantly */}
                <div className="py-6">
                  <div className="text-[8rem] sm:text-[10rem] tracking-wider font-extrabold timer-digit drop-shadow-[4px_4px_0px_rgba(0,0,0,0.15)] leading-none">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress Bar - Made thicker and rounded */}
                <div className="w-full h-8 bg-white border-4 border-black y2k-shadow-sm overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${mode === "focus" ? "bg-[var(--y2k-pink)]" : "bg-[var(--y2k-lavender)]"
                      } ${isRunning ? "progress-animate" : ""}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Buttons - Scaled up padding, text size, and added hover effects */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={handleStartPause}
                    onMouseEnter={playHoverSound}
                    className={`px-8 py-4 text-xl sm:text-2xl font-bold tracking-wider border-4 border-black rounded-xl y2k-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all ${isRunning
                      ? "bg-[var(--y2k-pink)]"
                      : "bg-[#90ee90]"
                      }`}
                  >
                    {isRunning ? "PAUSE" : timeLeft === totalDuration ? "START" : "RESUME"}
                  </button>

                  <button
                    onClick={handleReset}
                    onMouseEnter={playHoverSound}
                    className="px-8 py-4 text-xl sm:text-2xl font-bold tracking-wider border-4 border-black rounded-xl bg-white y2k-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    RESET
                  </button>

                  <button
                    onClick={handleSkip}
                    onMouseEnter={playHoverSound}
                    className="px-8 py-4 text-xl sm:text-2xl font-bold tracking-wider border-4 border-black rounded-xl bg-[var(--y2k-lavender)] y2k-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    SKIP
                  </button>
                </div>
              </div>
            </RetroWindow>
          </div>

          {/* Right Column - Settings Panel & Session History */}
          <div className={`flex flex-col transition-all duration-700 ease-in-out overflow-hidden origin-right ${isFocusing ? "w-0 opacity-0 scale-95 h-0 m-0 p-0 border-0" : "w-full lg:w-1/2 opacity-100 scale-100 space-y-8"}`}>

            {/* Settings Panel */}
            <RetroWindow title="SETTINGS" color="pink" contentClassName="p-6">
              {!showSettings ? (
                <div className="flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-bold space-y-2">
                    <p>Focus: {focusDuration / 60} min</p>
                    <p>Break: {breakDuration / 60} min</p>
                  </div>
                  <button
                    onClick={() => { playClickSound(); setShowSettings(true); }}
                    onMouseEnter={playHoverSound}
                    className="px-6 py-3 text-lg font-bold tracking-wider border-4 border-black rounded-xl bg-[var(--y2k-yellow)] y2k-shadow hover:-translate-y-1 transition-all"
                  >
                    EDIT
                  </button>
                </div>
              ) : (
                <div className="space-y-6 text-xl font-bold">
                  <div className="flex flex-col gap-2">
                    <label>Focus Duration (min)</label>
                    <input
                      type="number"
                      className="border-4 border-black p-3 rounded-xl y2k-shadow-sm font-sans"
                      defaultValue={focusDuration / 60}
                      onChange={(e) => setFocusDuration(e.target.value * 60)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Break Duration (min)</label>
                    <input
                      type="number"
                      className="border-4 border-black p-3 rounded-xl y2k-shadow-sm font-sans"
                      defaultValue={breakDuration / 60}
                      onChange={(e) => setBreakDuration(e.target.value * 60)}
                    />
                  </div>
                  <button
                    onClick={() => { playClickSound(); setShowSettings(false); }}
                    onMouseEnter={playHoverSound}
                    className="w-full px-6 py-3 text-xl font-bold tracking-wider border-4 border-black rounded-xl bg-[#90ee90] y2k-shadow hover:-translate-y-1 transition-all"
                  >
                    SAVE
                  </button>
                </div>
              )}
            </RetroWindow>

            {/* History Panel */}
            <RetroWindow title="HISTORY" color="blue" className="flex-grow min-h-[200px]" contentClassName="p-6 flex flex-col">
              <div className="flex justify-between items-center bg-[var(--y2k-cream)] border-4 border-black rounded-2xl px-4 py-3 mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black uppercase tracking-widest text-black">
                    Total Focus
                  </span>
                </div>
                <div className="bg-[#90ee90] border-2 border-black rounded-lg px-3 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-black">
                    {totalFocusStr}
                  </span>
                </div>
              </div>
              <ul className="space-y-4 max-h-[180px] overflow-y-auto pr-2 flex-grow">
                {sessions.length === 0 ? (
                  <li className="list-none text-center text-gray-500 font-bold text-lg pt-4">
                    No sessions yet!
                  </li>
                ) : (
                  sessions.map((session, index) => {
                    const mins = Math.floor(session.duration / 60);
                    const secs = session.duration % 60;
                    const durationStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

                    return (
                      <li key={index} className="history-item flex items-center gap-3">
                        <span aria-hidden="true" className="history-badge">✓</span>
                        <span className="history-label">{durationStr} focus</span>
                        <span className="history-time ml-auto">{formatCompletionTime(session.completedAt)}</span>
                      </li>
                    );
                  })
                )}

              </ul>
            </RetroWindow>
          </div>

        </div>
      </div>
    </main>
  );
}
