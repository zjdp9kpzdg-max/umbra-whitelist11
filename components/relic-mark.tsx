export function RelicMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label="UMBRA relic mark"
      className={className}
    >
      <defs>
        <radialGradient id="umbra-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1F6B4A" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#C9A227" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#07070A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="umbra-gold" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#E8D48A" />
          <stop offset="45%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8A6E12" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="url(#umbra-glow)" />
      <circle
        cx="160"
        cy="160"
        r="138"
        fill="none"
        stroke="url(#umbra-gold)"
        strokeWidth="1.2"
        opacity="0.9"
      />
      <circle
        cx="160"
        cy="160"
        r="126"
        fill="none"
        stroke="#C9A227"
        strokeWidth="0.6"
        opacity="0.45"
        strokeDasharray="2 7"
      />

      {Array.from({ length: 48 }, (_, i) => {
        const angle = (i / 48) * Math.PI * 2;
        const inner = i % 4 === 0 ? 118 : 122;
        const x1 = 160 + Math.cos(angle) * inner;
        const y1 = 160 + Math.sin(angle) * inner;
        const x2 = 160 + Math.cos(angle) * 132;
        const y2 = 160 + Math.sin(angle) * 132;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C9A227"
            strokeWidth={i % 4 === 0 ? 1.4 : 0.6}
            opacity={i % 4 === 0 ? 0.85 : 0.35}
          />
        );
      })}

      <circle
        cx="160"
        cy="160"
        r="92"
        fill="#0A0A0E"
        stroke="url(#umbra-gold)"
        strokeWidth="1.4"
      />
      <circle
        cx="160"
        cy="160"
        r="78"
        fill="none"
        stroke="#C9A227"
        strokeWidth="0.5"
        opacity="0.35"
      />

      <path
        d="M188 108c-28-6-58 10-68 38-10 28 4 58 32 70 12 5 18 4 18 4-22-10-34-34-28-58 7-28 34-46 62-42-6-6-10-8-16-12z"
        fill="url(#umbra-gold)"
        opacity="0.92"
      />
      <circle cx="196" cy="128" r="7" fill="#1F6B4A" />
      <circle cx="196" cy="128" r="3.2" fill="#E8E0D4" opacity="0.55" />

      <text
        x="160"
        y="214"
        textAnchor="middle"
        fill="#C9A227"
        fontFamily="ui-serif, Georgia, serif"
        fontSize="13"
        letterSpacing="0.42em"
      >
        UMBRA
      </text>
    </svg>
  );
}
