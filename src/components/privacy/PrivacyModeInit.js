"use client";

import { useEffect } from 'react';
import { installConsoleRedaction } from '../../lib/privacy';

// Mounted once in the root layout so console redaction is active on every
// page, not just the settings screen — Privacy Mode has to already be
// installed before anything sensitive would ever get logged.
export default function PrivacyModeInit() {
  useEffect(() => {
    installConsoleRedaction();
  }, []);
  return null;
}
