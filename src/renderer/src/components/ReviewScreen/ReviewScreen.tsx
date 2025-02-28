import { useEffect, useRef, useState } from 'react';
import './ReviewScreen.css';
import { useApp } from '../context/app-context';
import { KeeperLog } from '../KeeperLog/KeeperLog';
import { ProgressModal } from './ProgressModal.tsx/ProgressModal';

export const ReviewScreen = () => {
  const { subjectKeepers } = useApp();

  const submitRef = useRef<HTMLButtonElement>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (submitRef.current) {
      // @todo: Seems like a hack
      // Delay focusing the input to avoid the initial 'Enter' being counted as the submit
      const timer = setTimeout(() => {
        submitRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }

    return () => {};
  }, []);

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content">
        <h1>Review </h1>
        <KeeperLog />
        {showProgressModal && <ProgressModal />}
        <button
          onClick={() => {
            // Send the subjectKeepers to the main process
            window.electron.ipcBridge.sendMessage(
              'sort-keepers',
              subjectKeepers
            );
            setShowProgressModal(true);
          }}
          type="submit"
          ref={submitRef}
        >
          Save
        </button>
      </div>
    </div>
  );
};
