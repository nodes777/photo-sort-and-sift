import React from 'react';
import './ProcessingProgressModal.css';

export interface ProcessingProgressProps {
  currentStep: string;
  current: number;
  total: number;
  percentage: number;
  fileName?: string;
}

interface ProcessingProgressModalProps {
  progress: ProcessingProgressProps;
  isVisible: boolean;
}

export const ProcessingProgressModal: React.FC<
  ProcessingProgressModalProps
> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content processing-modal">
        <h2>Processing Images</h2>
        <div className="progress-info">
          <p className="step-text">{progress.currentStep}</p>
          {progress.fileName && (
            <p className="filename-text">Processing: {progress.fileName}</p>
          )}
          <div className="progress-stats">
            <span>
              {progress.current} of {progress.total}
            </span>
            <span>{progress.percentage}%</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
