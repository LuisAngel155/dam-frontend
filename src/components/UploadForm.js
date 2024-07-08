import React, { useState } from 'react';
import { storage, db, auth } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [error, setError] = useState('');

  const subcategories = {
    document: ["Report", "Invoice", "Letter"],
    video: ["Movie", "Anime", "Series"],
    photo: ["Portrait", "Landscape", "Event"],
    music: ["Song", "Album", "Podcast"],
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !type || !subcategory) {
      setError('Please select a file, file type, and subcategory');
      return;
    }

    const user = auth.currentUser;
    const folderPath = `${type}/${file.name}`;
    const storageRef = ref(storage, folderPath);
    const metadata = {
      customMetadata: {
        owner: user.uid,
      },
    };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (error) => {
        console.error('Error uploading file:', error);
        setError('Error uploading file');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const assetRef = collection(db, 'assets');

        await addDoc(assetRef, {
          name: file.name,
          path: folderPath,
          url: downloadURL,
          type,
          subcategory,
          uploader: user.email,
          owner: user.uid,
        });

        setUrl(downloadURL);
        console.log('File available at', downloadURL);
        setError('');
      }
    );
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Select Type</option>
        <option value="document">Document</option>
        <option value="video">Video</option>
        <option value="photo">Photo</option>
        <option value="music">Music</option>
      </select>
      {type && (
        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
          <option value="">Select Subcategory</option>
          {subcategories[type].map((subcat) => (
            <option key={subcat} value={subcat}>{subcat}</option>
          ))}
        </select>
      )}
      <button onClick={handleUpload}>Upload</button>
      <p>Upload Progress: {progress}%</p>
      {url && <p>File URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UploadForm;