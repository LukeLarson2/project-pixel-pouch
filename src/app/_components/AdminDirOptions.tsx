'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import '../_stylesheets/adminDirOptions.css'
import { FaTimes } from "react-icons/fa";

export default function AdminDirOptions({ parentDirId, projectId, handleOptions }: {
  parentDirId: string;
  projectId: string;
  handleOptions: (value: boolean, id: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [dirName, setDirName] = useState(false)
  const [editDirName, setEditDirName] = useState(false)
  const supabase = createClientComponentClient()

  const addFolder = async () => {
    setIsLoading(true)
    const { data: maxDirIdData, error: maxDirIdError } = await supabase
      .from('directories')
      .select('dir_id')
      .order('dir_id', { ascending: false })
      .limit(1)

    if (maxDirIdError) {
      console.error(maxDirIdError)
      setIsLoading(false)
      return;
    }

    const newDirId = maxDirIdData.length > 0 ? maxDirIdData[0].dir_id + 1 : 1;
    const directoryData = {
      dir_id: newDirId,
      project: projectId,
      parent_dir: parentDirId,
      name
    }
    const { error } = await supabase
      .from('directories')
      .insert(directoryData)

    if (error) {
      console.error(error)
      setIsLoading(false)
      return;
    }
    setIsLoading(false)
    handleOptions(false, '')
  }

  const editFolder = async () => {
    setIsLoading(true)
    const {error} = await supabase
    .from('directories')
    .update({name: name})
    .eq('dir_id', parentDirId)

    if (error) {
      console.error(error)
      setIsLoading(false)
      return
    }
    setEditDirName(false)
    handleOptions(false, '')
  }

  const addName = () => {
    setDirName(true)
  }

  return (
    <div className='admin-dir-options-overlay'>
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      {dirName && (
        <div className="add-dir-name-overlay">
          <div className="add-dir-name-modal">
            <h2>Add Folder</h2>
          <FaTimes className="close-options-name" onClick={() => setDirName(false)} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder Name" />
            <button type="button" onClick={addFolder}>Add Folder</button>
            </div>
          </div>
      )}
      {editDirName && (
        <div className="add-dir-name-overlay">
          <div className="add-dir-name-modal">
          <h2>Edit Folder</h2>
          <FaTimes className="close-options-name" onClick={() => setEditDirName(false)} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder Name" />
            <button type="button" onClick={editFolder}>Change Name</button>
            </div>
          </div>
      )}
      <div className='admin-dir-options-modal'>
        <h2>Folder Options</h2>
        <button type="button" onClick={addName}>Add folder here</button>
        <button type="button">Request files here</button>
        <button type="button" onClick={() => setEditDirName(true)}>Edit Name</button>
        <FaTimes className="close-options" onClick={() => handleOptions(false, '')} />

      </div>
    </div>
  )
}