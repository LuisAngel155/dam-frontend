import React, { useState } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const AssetDetails = ({ asset, onClose }) => {
  const [newName, setNewName] = useState(asset.name);
  const [newFile, setNewFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccess('');
    try {
      let newUrl = asset.url;
      if (newFile) {
        const storageRef = ref(storage, asset.path);
        await uploadBytes(storageRef, newFile);
        newUrl = await getDownloadURL(storageRef);
      }

      const assetRef = doc(db, 'assets', asset.id);
      await updateDoc(assetRef, {
        name: newName,
        url: newUrl
      });

      setSuccess('Changes saved successfully');
      onClose();
    } catch (error) {
      console.error('Error updating asset:', error);
      setError('Error updating asset');
    }
  };

  return (
    <div>
      <h2>Edit Asset</h2>
      <label>
        Name:
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Replace File:
        <input type="file" onChange={handleFileChange} />
      </label>
      <br />
      <button onClick={handleSaveChanges}>Save Changes</button>
      <button onClick={onClose}>Cancel</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default AssetDetails;