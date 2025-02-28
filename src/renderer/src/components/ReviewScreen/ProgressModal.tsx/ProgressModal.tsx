import { useEffect, useState } from 'react';

import './ProgressModal.css';

export type SortProgressData = {
  progress: number;
  message: string;
};

export type SortCompleteData = {
  message: string;
  destinationFolder: string;
};

export const ProgressModal = () => {
  const [progress, setProgress] = useState<number | null>(null); // Progress percentage
  const [statusMessage, setStatusMessage] = useState<string>(''); // Status message
  const [isComplete, setIsComplete] = useState(false); // Completion flag
  const [destinationFolder, setDestinationFolder] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Listen for progress updates
    if (window.electron) {
      window.electron.ipcBridge.on('sort-progress', (data) => {
        if (
          typeof data === 'object' &&
          data !== null &&
          'progress' in data &&
          'message' in data
        ) {
          const progressData = data as SortProgressData;
          setProgress(progressData.progress);
          setStatusMessage(progressData.message);
        }
      });

      // Listen for completion updates
      window.electron.ipcBridge.on('sort-complete', (data) => {
        if (
          typeof data === 'object' &&
          data !== null &&
          'message' in data &&
          'destinationFolder' in data
        ) {
          const completeData = data as SortCompleteData;
          setIsComplete(true);
          setStatusMessage(completeData.message);
          setDestinationFolder(completeData.destinationFolder);
        }
      });
    }
  }, []);

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal-content">
        {/* Display progress or status message */}
        {progress !== null && !isComplete && (
          <>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{statusMessage}</p>
          </>
        )}

        {/* Display completion message */}
        {isComplete && (
          <div className="completion-message">
            <p>{statusMessage}</p>
            {destinationFolder && (
              <>
                <p>Files were saved to:</p>
                <p>
                  <strong>{destinationFolder}</strong>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
