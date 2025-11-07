import React, { useCallback, useEffect, useState } from 'react';

function AccessibilityToggle() {
  const [enabled, setEnabled] = useState(false);

  const toggleContrast = useCallback(() => {
    setEnabled(v => !v);
  }, []);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    return () => document.body.classList.remove('high-contrast');
  }, [enabled]);

  return (
    <button
      onClick={toggleContrast}
      aria-pressed={enabled}
      aria-label="Toggle high contrast accessibility mode"
      className={`ml-2 px-3 py-1 rounded font-semibold border focus:ring-2 ring-offset-2 ring-blue-400 transition ${enabled ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-yellow-50 text-black border-yellow-300'}`}
      title="Toggle high contrast mode for accessible viewing"
    >
      {enabled ? '🌓 High Contrast: ON' : '🌓 High Contrast'}
    </button>
  );
}

export default AccessibilityToggle;



