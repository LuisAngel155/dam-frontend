import React, { useState, useEffect, useCallback } from 'react';
import { storage, db, auth } from '../firebaseConfig';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AssetDetails from './AssetDetails';

const AssetGallery = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetsRef = collection(db, 'assets');
        const assetDocs = await getDocs(assetsRef);
        const assetData = assetDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log('Asset data from Firestore:', assetData);

        const urls = await Promise.all(
          assetData.map(async (asset) => {
            const url = await getDownloadURL(ref(storage, asset.path));
            return { ...asset, url };
          })
        );

        console.log('Assets with URLs:', urls);

        setAssets(urls);
        setFilteredAssets(urls);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  const handleSearch = useCallback(() => {
    console.log('Filters - Type:', filterType, 'Subcategory:', filterSubcategory, 'Search Term:', searchTerm);

    const filtered = assets.filter(asset => {
      return (
        (filterType === '' || asset.type === filterType) &&
        (filterSubcategory === '' || asset.subcategory === filterSubcategory) &&
        (searchTerm === '' || asset.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    console.log('Filtered assets:', filtered);

    setFilteredAssets(filtered);
  }, [searchTerm, filterType, filterSubcategory, assets]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filterType, filterSubcategory, handleSearch]);

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
        console.log('User signed out');
        navigate('/'); // Redirigir a la página de inicio de sesión
      } else {
        console.log('No user is currently signed in');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  const handleShare = (url, platform) => {
    const encodedUrl = encodeURIComponent(url);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check this out&body=${encodedUrl}`;
        break;
      default:
        break;
    }

    window.open(shareUrl, '_blank');
  };

  const handleDelete = async (asset) => {
    try {
      const assetRef = ref(storage, asset.path);
      await deleteObject(assetRef);
      await deleteDoc(doc(db, 'assets', asset.id));
      setAssets(assets.filter(a => a.id !== asset.id));
      setFilteredAssets(filteredAssets.filter(a => a.id !== asset.id));
      alert('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset');
    }
  };

  const subcategories = {
    document: ["Report", "Invoice", "Letter"],
    video: ["Movie", "Anime", "Series"],
    photo: ["Portrait", "Landscape", "Event"],
    music: ["Song", "Album", "Podcast"],
  };

  return (
    <div>
      <h2>Asset Gallery</h2>
      <button onClick={handleSignOut}>Sign Out</button>
      <div>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="photo">Photo</option>
          <option value="music">Music</option>
        </select>
        {filterType && (
          <select value={filterSubcategory} onChange={(e) => setFilterSubcategory(e.target.value)}>
            <option value="">All Subcategories</option>
            {subcategories[filterType].map((subcat) => (
              <option key={subcat} value={subcat}>{subcat}</option>
            ))}
          </select>
        )}
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="asset-grid">
        {selectedAsset ? (
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        ) : (
          filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => (
              <div key={index} className="asset-card">
                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                  {asset.type === 'photo' ? (
                    <img src={asset.url} alt={asset.name} className="asset-image" />
                  ) : (
                    <p>{asset.name}</p>
                  )}
                  <p>Uploaded by: {asset.uploader}</p>
                </a>
                <button onClick={() => handleCopyLink(asset.url)}>Copy Link</button>
                <button onClick={() => handleShare(asset.url, 'facebook')}>Share on Facebook</button>
                <button onClick={() => handleShare(asset.url, 'twitter')}>Share on Twitter</button>
                <button onClick={() => handleShare(asset.url, 'email')}>Share via Email</button>
                {asset.uploader === auth.currentUser.email && (
                  <>
                    <button onClick={() => setSelectedAsset(asset)}>Edit</button>
                    <button onClick={() => handleDelete(asset)}>Delete</button>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No assets found</p>
          )
        )}
      </div>
    </div>
  );
};

export default AssetGallery;