import { useApp } from '../context/app-context';
import './BigPreview.css';

const BigPreview = () => {
  const { selectedImage } = useApp();

  return selectedImage ? (
    <div className="BigPreviewContainer">
      <img
        src={`data:image/jpeg;charset=utf-8;base64,${selectedImage.bigPreview.data}`}
        alt={selectedImage.jpegPath}
      />
    </div>
  ) : null;
};

export default BigPreview;
