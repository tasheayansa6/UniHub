import React, { useEffect, useRef } from 'react';

const glowColorMap = {
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green:  { base: 120, spread: 200 },
  red:    { base: 0,   spread: 200 },
  orange: { base: 30,  spread: 200 },
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

// Injected once into <head>
const GLOW_CSS = `
[data-glow]::before,
[data-glow]::after {
  pointer-events: none;
  content: "";
  position: absolute;
  inset: calc(var(--border-size) * -1);
  border: var(--border-size) solid transparent;
  border-radius: calc(var(--radius) * 1px);
  background-attachment: fixed;
  background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
  background-repeat: no-repeat;
  background-position: 50% 50%;
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
[data-glow]::before {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75)
    at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
    transparent 100%
  );
  filter: brightness(2);
}
[data-glow]::after {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5)
    at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(0 100% 100% / var(--border-light-opacity, 1)),
    transparent 100%
  );
}
[data-glow] [data-glow] {
  position: absolute;
  inset: 0;
  will-change: filter;
  opacity: var(--outer, 1);
  border-radius: calc(var(--radius) * 1px);
  border-width: calc(var(--border-size) * 20);
  filter: blur(calc(var(--border-size) * 10));
  background: none;
  pointer-events: none;
  border: none;
}
[data-glow] > [data-glow]::before {
  inset: -10px;
  border-width: 10px;
}
`;

let glowStyleInjected = false;
function injectGlowStyle() {
  if (glowStyleInjected) return;
  const style = document.createElement('style');
  style.textContent = GLOW_CSS;
  document.head.appendChild(style);
  glowStyleInjected = true;
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
}) {
  const cardRef = useRef(null);

  // Inject global CSS once
  useEffect(() => { injectGlowStyle(); }, []);

  // Track pointer position as CSS vars on the card
  useEffect(() => {
    const syncPointer = (e) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--x', e.clientX.toFixed(2));
      cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', e.clientY.toFixed(2));
      cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] ?? glowColorMap.blue;

  const inlineStyle = {
    // Glow config vars
    '--base':   base,
    '--spread': spread,
    '--radius': '14',
    '--border': '3',
    '--backdrop': 'hsl(0 0% 60% / 0.12)',
    '--backup-border': 'var(--backdrop)',
    '--size':   '200',
    '--outer':  '1',
    '--border-size':     'calc(var(--border, 2) * 1px)',
    '--spotlight-size':  'calc(var(--size, 150) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',

    // Spotlight background
    backgroundImage: [
      'radial-gradient(',
      '  var(--spotlight-size) var(--spotlight-size)',
      '  at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),',
      '  hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)),',
      '  transparent',
      ')',
    ].join(''),

    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',

    // Optional explicit dimensions
    ...(width  !== undefined ? { width:  typeof width  === 'number' ? `${width}px`  : width  } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const sizeClass = customSize ? '' : sizeMap[size] ?? sizeMap.md;
  const aspectClass = customSize ? '' : 'aspect-[3/4]';

  return (
    <div
      ref={cardRef}
      data-glow
      style={inlineStyle}
      className={`${sizeClass} ${aspectClass} rounded-2xl relative grid grid-rows-[1fr_auto] shadow-[0_1rem_2rem_-1rem_black] p-4 gap-4 backdrop-blur-[5px] ${className}`.trim()}
    >
      {/* Inner glow layer — required for the border effect */}
      <div data-glow />
      {children}
    </div>
  );
}
