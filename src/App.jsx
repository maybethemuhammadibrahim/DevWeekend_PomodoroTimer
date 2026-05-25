import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "pomodoro-history";

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
  // Timer settings (in seconds)
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus");
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

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completed
          playSound();
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 500);

          if (mode === "focus") {
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

  // Update timeLeft when settings change (only when timer is stopped)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === "focus" ? focusDuration : breakDuration);
    }
  }, [focusDuration, breakDuration, mode, isRunning]);

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
      {/* Decorative Sparkles */}
      <div className="fixed top-8 left-8 text-[var(--y2k-pink)] sparkle hidden sm:block">
        <Sparkle className="w-10 h-10" />
      </div>
      <div className="fixed top-16 right-12 text-[var(--y2k-yellow)] sparkle hidden sm:block" style={{ animationDelay: "0.5s" }}>
        <Sparkle className="w-8 h-8" />
      </div>
      <div className="fixed bottom-20 left-16 text-[var(--y2k-blue)] sparkle hidden sm:block" style={{ animationDelay: "1s" }}>
        <Sparkle className="w-10 h-10" />
      </div>
      <div className="fixed bottom-32 right-8 text-[var(--y2k-lavender)] sparkle hidden sm:block" style={{ animationDelay: "1.5s" }}>
        <Sparkle className="w-12 h-12" />
      </div>

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
                    className={`w-5 h-5 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                      isRunning ? "bg-[#90ee90] progress-animate" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-xl sm:text-2xl tracking-widest font-bold uppercase">{statusLabel}</span>
                </div>

                {/* Timer Display - Scaled up significantly */}
                <div className="py-6">
                  <div className="text-8xl sm:text-[9rem] tracking-wider font-extrabold timer-digit drop-shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress Bar - Made thicker and rounded */}
                <div className="w-full h-8 bg-white border-4 border-black y2k-shadow-sm overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      mode === "focus" ? "bg-[var(--y2k-pink)]" : "bg-[var(--y2k-lavender)]"
                    } ${isRunning ? "progress-animate" : ""}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Buttons - Scaled up padding, text size, and added hover effects */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={handleStartPause}
                    onMouseEnter={playHoverSound}
                    className={`px-8 py-4 text-xl sm:text-2xl font-bold tracking-wider border-4 border-black rounded-xl y2k-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all ${
                      isRunning
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
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-4">
                <span className="text-xl font-bold uppercase tracking-wider text-[var(--y2k-pink)] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  TOTAL FOCUS:
                </span>
                <span className="text-2xl font-extrabold tracking-widest text-[#90ee90] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  {totalFocusStr}
                </span>
              </div>
              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 flex-grow">
                {sessions.length === 0 ? (
                  <div className="text-center text-gray-500 font-bold text-lg pt-4">
                    No sessions yet!
                  </div>
                ) : (
                  sessions.map((session, index) => {
                    const mins = Math.floor(session.duration / 60);
                    const secs = session.duration % 60;
                    const durationStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    
                    return (
                      <div key={index} className="flex justify-between items-center border-b-4 border-black pb-3 text-lg sm:text-xl font-bold">
                        <span>[{durationStr} focus — {formatCompletionTime(session.completedAt)}]</span>
                        <span className="text-[#90ee90] text-2xl drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">✓</span>
                      </div>
                    );
                  })
                )}
            
              </div>
            </RetroWindow>
          </div>
          
        </div>
      </div>
    </main>
  );
}
