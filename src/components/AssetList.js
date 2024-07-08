import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';

const AssetList = ({ assetType }) => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      const assetsRef = collection(db, 'assets');
      const assetDocs = await getDocs(assetsRef);
      const assetData = assetDocs.docs.map(doc => doc.data());

      // Filtrar los activos por tipo
      const filteredAssets = assetData.filter(asset => asset.type === assetType);

      const urls = await Promise.all(
        filteredAssets.map(async (asset) => {
          const url = await getDownloadURL(ref(storage, asset.path));
          return { ...asset, url };
        })
      );

      setAssets(urls);
    };

    fetchAssets();
  }, [assetType]);

  return (
    <div>
      <h2>{assetType.charAt(0).toUpperCase() + assetType.slice(1)}s</h2>
      <div className="asset-grid">
        {assets.map((asset, index) => (
          <div key={index} className="asset-card">
            <a href={asset.url} target="_blank" rel="noopener noreferrer">
              {asset.type === 'photo' ? (
                <img src={asset.url} alt={asset.name} className="asset-image" />
              ) : (
                <p>{asset.name}</p>
              )}
              <p>Uploaded by: {asset.uploader}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetList;