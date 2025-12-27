import { toFileUrl } from 'renderer/utils';
import { useApp } from '../context/app-context';
import './BigPreview.css';

const BigPreview = () => {
  const { selectedImage } = useApp();

  return selectedImage ? (
    <div className="BigPreviewContainer">
      <img
        src={`app-images://${selectedImage.bigPreview.pathName}`}
        alt={selectedImage.jpegPath}
      />
    </div>
  ) : null;
};

export default BigPreview;
