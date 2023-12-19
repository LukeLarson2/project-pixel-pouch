'use client'

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaTimes } from "react-icons/fa";
import '../_stylesheets/addFile.css';
import { setDefaultAutoSelectFamilyAttemptTimeout } from 'net';

export default function AddFileModal({ handleAddFile, currentDirId }: {
  handleAddFile: (value: boolean) => void;
  currentDirId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileType, setFileType] = useState('');

  const supabase = createClientComponentClient();

  const handleUpload = async () => {
    setIsLoading(true)

    const { data: maxFileIdData, error: maxFileIdError } = await supabase
      .from('files')
      .select('file_id')
      .order('file_id', { ascending: false })
      .limit(1)

    if (maxFileIdError) {
      console.error(maxFileIdError)
      setIsLoading(false)
      return;
    }

    const newFileId = maxFileIdData.length > 0 ? maxFileIdData[0].file_id + 1 : 1;

    const fileData = {
      directory: currentDirId,
      name: fileName,
      details: description,
      last_modified: new Date(),
      storage_url: url,
      type_icon: fileType,
      file_id: newFileId
    }

    const { error: insertError } = await supabase
      .from('files')
      .insert(fileData)

    if (insertError) {
      console.error(insertError)
      setIsLoading(false)
      return;
    }

    setIsLoading(false);
    handleAddFile(false);
  }

  const fileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      setFilePath(URL.createObjectURL(file));
      const fileType = file.type.split('/').pop();
      if (fileType) {
        setFileType(fileType);

        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isImage = fileExtension ? imageExtensions.includes(fileExtension) : false;

        const storagePath = isImage ? 'images' : 'docs';
        const uploadPath = `${storagePath}/${file.name}`;
        setFilePath(uploadPath)

        const { error } = await supabase
          .storage
          .from(`client_files`)
          .upload(uploadPath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error(error)
          setIsLoading(false)
          return;
        }

        const supabaseStorageUrl = 'https://jukuwnfgauvcbbkjnhrt.supabase.co/storage/v1/object/public/client_files/';
        const fileUrl = `${supabaseStorageUrl}${uploadPath}`;


        // const timestamp = new Date().toISOString();
        // const fileUrlWithTimestamp = `${fileUrl}?t=${encodeURIComponent(timestamp)}`

        setUrl(fileUrl);
      }
      setIsLoading(false)
    }
  }

  const handleCloseModal = async () => {
    if (!isLoading && url) {
      setIsLoading(true)
      await supabase.storage
        .from(`client_files`)
        .remove([filePath])
        .then(({ error }) => {
          if (error) {
            console.error(error)
            setIsLoading(false)
            return
          }
        })
        .then(() => handleAddFile(false))
      }
      handleAddFile(false);
  }

  return (
    <div className="add-modal-overlay">
      <div className="add-modal">
        {isLoading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        <h2>Upload Project File</h2>
        <FaTimes className="close-modal-icon" onClick={handleCloseModal} />

        <label htmlFor="name">File Name</label>
        <input type='text' name='name' placeholder='e.x. "My File"' className='form-text-field' value={fileName} onChange={(e) => setFileName(e.target.value)} />

        <label htmlFor="file">File Name</label>
        <div className="file-upload">
          <input type='file' name='file' className='form-text-field' onChange={fileSelect} />
        </div>

        <label htmlFor="description">Description</label>
        <textarea name="description" placeholder='e.x. To be used as group image on "About Us" page to replace the current group image...' style={{ resize: 'none', height: ' 100px' }} className="form-text-field" value={description} onChange={(e) => setDescription(e.target.value)} />
        <p>Include details of what this file will be used for</p>
        <div className="btn-placement">
          <button type='button' className="form-btn-upload" disabled={isLoading} onClick={handleUpload}>Upload File</button>
        </div>
      </div>
    </div>
  )
}