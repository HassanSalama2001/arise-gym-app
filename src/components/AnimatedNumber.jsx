import { useState, useEffect } from 'react';

/** Counts up from 0 to `value` over `duration` ms. */
export default function AnimatedNumber({ value = 0, duration = 800, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const step = (t) => {
      start ??= t;
      const progress = Math.min((t - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}
