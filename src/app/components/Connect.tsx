
'use client';
import React, { useEffect } from 'react';

export function Connect() {
  return (
    <div>
      <appkit-button
        label="Connect"
        balance="hide"
        size="sm"
        loadingLabel="Connecting"
      />
    </div>
  );
}
