import styles from "./AnimatedDog.module.css";

interface Props {
  active?: boolean;
  glow?: string;
}

export default function AnimatedDog({ active = false, glow = "#7c6af7" }: Props) {
  return (
    <svg
      className={`${styles.dog} ${active ? styles.active : ""}`}
      viewBox="0 0 340 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Floor shadow */}
        <radialGradient id="shadow" cx="50%" cy="100%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* White fur body */}
        <radialGradient id="bodyGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0ede8" />
          <stop offset="100%" stopColor="#dbd5c8" />
        </radialGradient>
        {/* Brown ear */}
        <linearGradient id="earGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#c07840" />
          <stop offset="100%" stopColor="#7a4820" />
        </linearGradient>
        {/* Eye */}
        <radialGradient id="eyeGrad" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#6b3a1f" />
          <stop offset="100%" stopColor="#1a0a00" />
        </radialGradient>
        {/* Nose */}
        <radialGradient id="noseGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#3a3030" />
          <stop offset="100%" stopColor="#0d0808" />
        </radialGradient>
        {/* Brain glow */}
        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.7" />
          <stop offset="60%" stopColor={glow} stopOpacity="0.25" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <filter id="fur" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="170" cy="462" rx="100" ry="16" fill="url(#shadow)" />

      {/* ── BODY ─────────────────────────────────────────── */}
      <g className={styles.body} filter="url(#fur)">
        {/* Tail (behind) */}
        <path className={styles.tail}
          d="M 95 390 q -55 -30 -48 -90 q 5 -25 22 -18 q 15 6 12 30 q -8 40 22 72 Z"
          fill="#e8e2d8" />

        {/* Main torso */}
        <path
          d="M 108 290
             q -30 10 -42 70
             q -10 55 12 90
             q 16 22 50 26
             q 60 8 100 -4
             q 44 -12 52 -52
             q 10 -55 -8 -110
             q -22 -52 -64 -56
             q -60 -8 -100 36 Z"
          fill="url(#bodyGrad)"
        />

        {/* Chest fluff */}
        <path
          d="M 152 320 q -18 8 -22 50 q -2 26 8 42 q 20 -10 34 -14 q 14 4 34 14 q 10 -16 8 -42 q -4 -42 -22 -50 q -18 -8 -40 0 Z"
          fill="#fff"
        />

        {/* Front left leg */}
        <path
          d="M 128 390 q -14 4 -16 50 q 0 14 12 18 l 22 0 q 12 0 12 -18 q 0 -46 -18 -52 q -6 -2 -12 2 Z"
          fill="url(#bodyGrad)"
        />
        {/* Front right leg */}
        <path
          d="M 188 390 q -10 4 -12 50 q 0 14 12 18 l 22 0 q 12 0 14 -18 q 2 -46 -16 -52 q -8 -2 -20 2 Z"
          fill="#ede8e0"
        />

        {/* Paw toes front left */}
        <ellipse cx="130" cy="455" rx="16" ry="9" fill="#e0d8cc" />
        <path d="M 118 451 q 0 -6 5 -6 M 126 450 q -1 -6 4 -6 M 134 450 q 0 -6 5 -6" stroke="#ccc4b8" strokeWidth="1.2" />
        {/* Paw toes front right */}
        <ellipse cx="196" cy="455" rx="16" ry="9" fill="#ded6ca" />
        <path d="M 184 451 q 0 -6 5 -6 M 192 450 q -1 -6 4 -6 M 200 450 q 0 -6 5 -6" stroke="#ccc4b8" strokeWidth="1.2" />

        {/* Back haunch */}
        <path
          d="M 100 350 q -28 20 -28 80 q 0 28 18 36 q 24 10 46 -4 q 12 -52 0 -110 q -18 -12 -36 -2 Z"
          fill="#e4ddd2"
        />
      </g>

      {/* ── HEAD group (tilts up when active) ───────────── */}
      <g className={styles.head}>

        {/* Back ear (brown, floppy, behind head) */}
        <path
          d="M 222 92
             q 28 -18 44 8
             q 14 24 6 68
             q -6 32 -26 44
             q -16 -10 -26 -40
             q -14 -46 2 -80 Z"
          fill="url(#earGrad)"
        />
        {/* Ear inner shadow */}
        <path
          d="M 238 106 q 14 -4 18 20 q 4 22 -6 46 q -12 -10 -18 -34 q -6 -24 6 -32 Z"
          fill="#a05c28" fillOpacity="0.4"
        />

        {/* Skull */}
        <path
          d="M 128 148
             q -6 -76 38 -108
             q 36 -28 82 -20
             q 50 8 68 52
             q 18 42 8 86
             q -10 44 -46 62
             q -44 16 -90 -4
             q -46 -22 -60 -68 Z"
          fill="url(#bodyGrad)"
          filter="url(#fur)"
        />

        {/* Forehead highlight */}
        <ellipse cx="192" cy="130" rx="38" ry="26" fill="#fff" fillOpacity="0.45" />

        {/* Muzzle */}
        <path
          d="M 148 210
             q -10 2 -14 24
             q -4 20 8 32
             q 18 16 52 16
             q 34 0 50 -16
             q 12 -12 8 -32
             q -4 -22 -14 -24
             q -40 -8 -90 0 Z"
          fill="#f0ece4"
        />
        {/* Muzzle dividing line */}
        <path d="M 193 228 q 0 16 0 24" stroke="#ccc4b4" strokeWidth="1.5" />

        {/* Nose — big, rounded, black */}
        <ellipse cx="193" cy="216" rx="28" ry="22" fill="url(#noseGrad)" />
        {/* Nose highlight */}
        <ellipse cx="184" cy="208" rx="9" ry="6" fill="#fff" fillOpacity="0.18" />
        <ellipse cx="180" cy="205" rx="4" ry="3" fill="#fff" fillOpacity="0.35" />
        {/* Nose texture lines */}
        <path d="M 173 216 q 10 -4 20 0 M 173 221 q 10 -2 20 0" stroke="#1a0808" strokeWidth="1" strokeOpacity="0.4" />

        {/* Left eye (looking up-left — thinking) */}
        <ellipse cx="155" cy="185" rx="20" ry="22" fill="url(#eyeGrad)" />
        <ellipse cx="155" cy="185" rx="20" ry="22" fill="none" stroke="#0d0808" strokeWidth="1.5" />
        {/* Iris */}
        <ellipse cx="155" cy="183" rx="14" ry="15" fill="#5a3010" />
        {/* Pupil — shifted upward for "thinking / looking up" */}
        <ellipse cx="153" cy="178" rx="9" ry="10" fill="#0d0808" />
        {/* Catchlights */}
        <ellipse cx="148" cy="172" rx="4.5" ry="4" fill="#fff" fillOpacity="0.92" />
        <circle cx="159" cy="180" r="2" fill="#fff" fillOpacity="0.5" />
        {/* Lower eye wetness */}
        <path d="M 138 192 q 16 8 34 2" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" fill="none" />

        {/* Right eye */}
        <ellipse cx="222" cy="185" rx="20" ry="22" fill="url(#eyeGrad)" />
        <ellipse cx="222" cy="185" rx="20" ry="22" fill="none" stroke="#0d0808" strokeWidth="1.5" />
        <ellipse cx="222" cy="183" rx="14" ry="15" fill="#5a3010" />
        <ellipse cx="220" cy="178" rx="9" ry="10" fill="#0d0808" />
        <ellipse cx="215" cy="172" rx="4.5" ry="4" fill="#fff" fillOpacity="0.92" />
        <circle cx="226" cy="180" r="2" fill="#fff" fillOpacity="0.5" />
        <path d="M 205 192 q 16 8 34 2" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" fill="none" />

        {/* Eyebrows — raised slightly, giving quizzical/thinking expression */}
        <path d="M 135 163 q 18 -10 38 -5" stroke="#c8a060" strokeWidth="3.5"
          strokeLinecap="round" fill="none" className={styles.brow} />
        <path d="M 200 160 q 20 -10 42 -4" stroke="#c8a060" strokeWidth="3.5"
          strokeLinecap="round" fill="none" className={styles.brow} />

        {/* Front (left) floppy ear */}
        <path
          d="M 122 140
             q -30 -12 -36 30
             q -6 38 10 72
             q 12 26 32 34
             q 20 -10 26 -38
             q 10 -50 -4 -84
             q -10 -18 -28 -14 Z"
          fill="url(#earGrad)"
        />
        {/* Front ear inner */}
        <path
          d="M 126 158 q -12 2 -14 28 q -2 22 8 42 q 12 -8 16 -30 q 4 -28 -10 -40 Z"
          fill="#9e5220" fillOpacity="0.4"
        />

        {/* Mouth: gentle closed smile */}
        <path d="M 175 248 q 18 10 36 0" stroke="#9a7a60" strokeWidth="2"
          strokeLinecap="round" fill="none" />

        {/* Collar */}
        <path
          d="M 138 286 q 54 24 110 0"
          stroke="#7a4820" strokeWidth="10" strokeLinecap="round" fill="none"
        />
        <path
          d="M 138 286 q 54 24 110 0"
          stroke="#a06030" strokeWidth="7" strokeLinecap="round" fill="none"
        />
        {/* Collar tag */}
        <ellipse cx="193" cy="298" rx="9" ry="11" fill="#c8a030" />
        <ellipse cx="193" cy="298" rx="9" ry="11" fill="none" stroke="#a07818" strokeWidth="1" />
        <text x="193" y="302" textAnchor="middle" fill="#7a5010" fontSize="7" fontWeight="bold">🐾</text>

      </g>

      {/* ── BRAIN GLOW + NEURAL NODES emanating from forehead ── */}
      <g className={styles.brain}>
        {/* Soft glow halo behind skull */}
        <ellipse cx="192" cy="148" rx="72" ry="60"
          fill={glow} fillOpacity="0.12" filter="url(#softGlow)"
          className={styles.brainHalo} />

        {/* Visible glow pulse on forehead */}
        <ellipse cx="192" cy="138" rx="44" ry="36"
          fill="url(#brainGlow)" filter="url(#glow)"
          className={styles.brainPulse} />

        {/* Neural nodes */}
        {NEURONS.map(([x, y, r, delay], i) => (
          <circle key={i} cx={x} cy={y} r={r}
            fill={glow}
            className={styles.neuron}
            style={{ animationDelay: `${delay}s` }}
            filter="url(#glow)"
          />
        ))}

        {/* Synapse lines */}
        {SYNAPSES.map(([x1, y1, x2, y2, delay], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={glow} strokeWidth="1"
            className={styles.synapse}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

// [x, y, radius, animDelay]
const NEURONS: [number, number, number, number][] = [
  [192, 100, 3.5, 0],
  [168, 84,  2.8, 0.2],
  [216, 82,  2.8, 0.35],
  [148, 68,  2.2, 0.5],
  [192, 62,  2.5, 0.15],
  [236, 70,  2.2, 0.4],
  [162, 46,  2.0, 0.6],
  [192, 36,  2.4, 0.25],
  [222, 48,  2.0, 0.55],
  [135, 90,  1.8, 0.45],
  [250, 88,  1.8, 0.3],
  [176, 22,  1.6, 0.7],
  [208, 24,  1.6, 0.8],
];

// [x1, y1, x2, y2, animDelay]
const SYNAPSES: [number, number, number, number, number][] = [
  [192, 100, 168, 84,  0],
  [192, 100, 216, 82,  0.1],
  [168, 84,  148, 68,  0.2],
  [216, 82,  236, 70,  0.25],
  [168, 84,  192, 62,  0.15],
  [216, 82,  192, 62,  0.3],
  [148, 68,  162, 46,  0.4],
  [236, 70,  222, 48,  0.35],
  [192, 62,  192, 36,  0.2],
  [162, 46,  176, 22,  0.5],
  [222, 48,  208, 24,  0.6],
  [192, 36,  176, 22,  0.45],
  [192, 36,  208, 24,  0.55],
  [148, 68,  135, 90,  0.5],
  [236, 70,  250, 88,  0.45],
];
