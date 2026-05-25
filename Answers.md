1.How to Run

```
git clone 
cd DevWeekend_PomodoroTimer
npm install
npm run dev
npm run build
```

Deployed Website:
https://dev-weekend-pomodoro-timer.vercel.app/

2. Stack & Design Choices

Tech Stack: React + Vite.

I chose React bundled with Vite using standard JavaScript for execution speed and a clean lightweight environment. 
Using Tailwind CSS v4 allowed me to drop the traditional tailwind.config.js and use native @theme directives for styling.

Design Philosophy: The app features a "Y2K Kawaii Retro" aesthetic. I focused on high-contrast color schemes (black and white with pastel accents like pink and yellow) and monospace typography (VT323) to give it a distinct, playful, retro-tech feel.

Two Specific Decisions
1. I made the settings and history panel disappear whenever the focus mode starts in order to provide a clear visual cue that the user is now in focus mode.
2. I choose to use big bulky buttons so that the design feels intuitive on especially on mobile.


3. Responsive Behavior & Accessibility

Responsive Behavior:

Mobile (360px): The layout transitions to a single-column view. The large timer remains prominent, while settings and history stack vertically below it.

Desktop (1440px): The layout splits into two columns. Timer on the left, Settings and History on the right for efficient use of space. If I used the vertical stack pattern here that wouldn't have made sense.

Accessibility Considerations:

Color Contrast: high contrast between text and backgrounds. (eg: black text on light/white backgrounds).

Keyboard Navigation: all buttons and interactive elements are focusable (tabbable) and trigger via Enter/Space keys.

Screen Reader Text: Added ARIA labels and descriptive text so screen readers can interpret the current state.

4. AI Usage in Development

The Initial design was generated using v0 by Vercel. The design pattern was something like this
1. I used websites like dribble and behance to take inspiration
2. I selected v0 and explained the y2k design concept(the initial draft only provided a stepping stone, it was not a good design), it generated only the design
3. I used the generated design pattern as a base and built on top of it
4. Gemini 3 Pro inside of Antigravity was used to implement the cuckoo feature


5. Honest Assessment of Gaps

Minor UI Polish: While the "windows" have retro borders, I could further refine the "shrink" animation on hover to make the retro-tech effect stronger.

Visual Cue for Focus Mode: I would love to improve the visual cues given during focus mode
