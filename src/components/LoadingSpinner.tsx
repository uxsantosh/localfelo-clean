import React from 'react';
import { LocalFeloLoader } from './LocalFeloLoader';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <LocalFeloLoader size="md" text="Loading..." />
    </div>
  );
}