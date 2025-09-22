import { useEffect, useRef } from 'react';
import { ImagePackage } from 'main/types';

import { useApp } from '../context/app-context';
import BigPreview from '../big-preview/BigPreview';
import { CreateSubjectKeeperModal } from '../CreateSubjectKeeperModal/CreateSubjectKeeperModal';
import { ProcessingProgressModal } from '../ProcessingProgressModal';

import './Layout.css';
import useKeyHandlers from './useKeyHandlers';
import { CurrentSubjectKeeper } from '../CurrentSubjectKeeper/CurrentSubjectKeeper';
import { KeeperLog } from '../KeeperLog/KeeperLog';
import { ReviewScreen } from '../ReviewScreen/ReviewScreen';

const Layout = () => {
  const {
    images,
    ensureFolderPath,
    loading,
    setSelectedImage,
    selectedImage,
    isCreatingSubjectKeeper,
    isShowingReviewScreen,
    processingProgress,
    isProcessing,
  } = useApp();

  useEffect(() => {
    ensureFolderPath();
  }, []);

  const selectedImageRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selectedImageRef.current) {
      // timeout hack: scrollIntoView may be called before the element exists in the DOM.
      setTimeout(() => {
        selectedImageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }, 0);
    }
  }, [selectedImage]);

  useKeyHandlers();

  const handleImageClick = (imagePackage: ImagePackage) => {
    setSelectedImage(imagePackage);
  };

  return (
    <div className="main">
      <div className="top">
        <CurrentSubjectKeeper />
        <BigPreview />
        <KeeperLog />
      </div>
      <div className="bottom">
        {loading && 'Loading...'}
        {!loading && images.length === 0 && 'No jpg images'}
        {images
          .filter((image) => image.thumbnail)
          .map((image) => (
            <button
              key={image.thumbnail.pathName}
              onClick={() => handleImageClick(image)}
              className="btn"
              type="button"
              ref={
                selectedImage?.id === image.id
                  ? (el) => {
                      selectedImageRef.current = el;
                    }
                  : null
              }
            >
              <img
                width={200}
                height={200}
                className={selectedImage?.id === image.id ? 'selected' : ''}
                src={`data:image/jpeg;charset=utf-8;base64,${image.thumbnail.data}`}
                alt={image.thumbnail.pathName}
              />
            </button>
          ))}
      </div>
      {isCreatingSubjectKeeper && <CreateSubjectKeeperModal />}
      {isShowingReviewScreen && <ReviewScreen />}
      {isProcessing && processingProgress && (
        <ProcessingProgressModal
          progress={processingProgress}
          isVisible={isProcessing}
        />
      )}
    </div>
  );
};
export default Layout;
