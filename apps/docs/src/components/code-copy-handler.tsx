'use client';

import { useEffect } from 'react';

export function CodeCopyHandler() {
  useEffect(() => {
    const handleCopy = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.copy-btn') as HTMLButtonElement | null;
      if (!target) return;

      const encodedCode = target.getAttribute('data-code');
      if (!encodedCode) return;

      const code = decodeURIComponent(encodedCode);
      navigator.clipboard.writeText(code).then(() => {
        const originalText = target.innerText;
        target.innerText = 'Copied!';
        target.classList.add('text-emerald-400');

        setTimeout(() => {
          target.innerText = originalText;
          target.classList.remove('text-emerald-400');
        }, 2000);
      });
    };

    document.addEventListener('click', handleCopy);
    return () => document.removeEventListener('click', handleCopy);
  }, []);

  return null;
}
