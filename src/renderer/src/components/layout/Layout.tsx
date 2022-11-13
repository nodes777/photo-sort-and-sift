import { useEffect } from 'react';
import { useApp } from '../context/app-context';
import SelectFolder from '../select-folder/SelectFolder';
import './Layout.css';

const Layout = () => {
  const { images, ensureFolderPath, folderPath, loading } = useApp();

  useEffect(() => {
    ensureFolderPath();
  });

  return (
    <div className="main">
      <div className="top" />
      <div className="bottom">
        <SelectFolder />
        <div>Path: {folderPath}</div>
        {loading && 'Loading...'}
        {!loading && images.length === 0 && 'No jpg images'}
        {images.map((image) => (
          <div key={image.id}>
            <img
              width={200}
              height={200}
              src={`data:image/jpeg;charset=utf-8;base64,${image.data}`}
              alt={image.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Layout;
