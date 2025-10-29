import React from 'react';
import { useStore } from '../store';

const LoadingScreen: React.FC = () => {
  const loadingMessage = useStore(state => state.loadingMessage);
  return (
    <div className="modal-backdrop" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6">
        <div className="loading-spinner"></div>
        <p className="text-2xl font-bold text-white" style={{ textShadow: '2px 2px 0 var(--dl-text)' }}>
            {loadingMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
