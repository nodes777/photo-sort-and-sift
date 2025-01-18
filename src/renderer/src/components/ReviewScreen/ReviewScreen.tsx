import { useEffect, useRef } from 'react';
import './ReviewScreen.css';
import { useApp } from '../context/app-context';
import { KeeperLog } from '../KeeperLog/KeeperLog';

export const ReviewScreen = () => {
  const { subjectKeepers } = useApp();

  const submitRef = useRef<HTMLButtonElement>(null);

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
        <button
          onClick={() => {
            // Send the subjectKeepers to the main process
            window.electron.ipcRenderer.sendMessage(
              'sort-keepers',
              subjectKeepers
            );
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
