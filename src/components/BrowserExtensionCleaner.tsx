'use client';

import { useEffect } from 'react';

export function BrowserExtensionCleaner() {
  useEffect(() => {
    document.querySelectorAll('[bis_skin_checked]').forEach((e) =>
      e.removeAttribute('bis_skin_checked'),
    );
  }, []);

  return null;
}
