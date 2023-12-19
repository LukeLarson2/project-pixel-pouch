'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './style.css'
import getUser from "./_utils/getUser";
import AddFileModal from "./_components/AddFileModal";
import { IoArrowBack } from "react-icons/io5";
import { FaRegFolderOpen } from "react-icons/fa";
import { FaFileAlt, FaFileImage, FaFilePdf, FaFileExcel, FaPlus } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";

type File = {
  file_id: number;
  directory: number;
  name: string;
  type_icon: string;
  last_modified: string;
  new: boolean;
  details: string;
  storage_url: string;
  archived: boolean;
}

type Dir = {
  dir_id: number;
  project: number;
  name: string;
  parent_dir: number;
}


export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dirs, setDirs] = useState<Dir[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);
  // const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDirId, setCurrentDirId] = useState('')

  const router = useRouter();

  const supabase = createClientComponentClient();

  const goToFile = async (route: string) => {
    if (route) {
      router.push(`/files/${route}`)
    }
  }

  const getRootDirectory = async () => {
    setIsLoading(true)
    const user = await getUser();
    if (user === false) {
      router.replace('/login')
      return;
    }
    if (user) {
      const { data: userId, error: userIdError } = await supabase
        .from('users')
        .select('client_id')
        .eq('email', user[0].email)

      if (userIdError) {
        console.error(userIdError)
        setIsLoading(false)
        return;
      }

      if (userId[0]) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('root_dir, root_file')
          .eq('user_id', userId[0].client_id)

        if (projectsError || !projectsData || projectsData.length < 1) {
          console.error(projectsError)
          setIsLoading(false)
          return;
        }

        const rootDirId = projectsData[0].root_dir;
        setCurrentDirId(rootDirId)
        const { data: rootDirectoryData, error: rootDirectoryError } = await supabase
          .from('directories')
          .select()
          .eq('dir_id', rootDirId)

        if (rootDirectoryError) {
          console.error(rootDirectoryError)
          setIsLoading(false)
          return;
        }

        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select()
          .eq('directory', rootDirId)

        if (fileError) {
          console.error(fileError)
          setIsLoading(false)
          return;
        }
        setDirs(rootDirectoryData || [])
        setFiles([])
        setIsLoading(false)
      }
    }
  }

  const getDirectoryDetails = async (dirId: string) => {
    // if (!back && dirId !== '') {
    //   setHistoryStack(prevStack => [...prevStack, dirId])
    // }

    setCurrentDirId(dirId)

    setIsLoading(true);
    const { data: dirData, error: dirError } = await supabase
      .from('directories')
      .select()
      .eq('parent_dir', dirId);

    if (dirError) {
      console.error(dirError)
      setIsLoading(false)
      return;
    }

    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select()
      .eq('directory', dirId)

    if (filesError) {
      console.error(filesError)
      setIsLoading(false)
      return;
    }
    setDirs(dirData)
    setFiles(filesData)
    setIsLoading(false)
  }

  const goBack = async (parentDir: string) => {
    if (parentDir !== null) {
      await getDirectoryDetails(parentDir)
    }
  }

  const handleAddFile = (value: boolean) => {
    setShowModal(true)
  }

  useEffect(() => {
    getRootDirectory(); // Fetch root directory on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    if (!showModal && currentDirId !== '') {
      getDirectoryDetails(currentDirId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return (
    <div className="main-folders-container">
      {showModal && (
        <AddFileModal handleAddFile={handleAddFile} currentDirId={currentDirId} />
      )}
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      {(dirs.length > 0 && dirs[0].parent_dir !== null) && (
        <IoArrowBack className="nav-back-icon" onClick={() => goBack(`${dirs[0].parent_dir}`)} />
      )}
      {!isLoading && (
        <>
          {dirs?.map((dir) => {
            const {dir_id} = dir;
            return (
              <div key={dir_id} className="dir-icon-container" onClick={() => getDirectoryDetails(`${dir_id}`)}>
                <FaRegFolderOpen className="dir-icon" />
                {dir.name}
              </div>
            )
          })}

          {files?.map((file) => {
            const fileType = file.type_icon.toLowerCase();
            let FileIconComponent;


            if (['xls', 'xlsx'].includes(fileType)) {
              FileIconComponent = FaFileExcel;
            } else if (['pdf'].includes(fileType)) {
              FileIconComponent = FaFilePdf;
            } else if (['jpg', 'png', 'gif', 'jpeg'].includes(fileType)) {
              FileIconComponent = FaFileImage;
            } else {
              FileIconComponent = FaFileAlt;
            }

            return (
              <div key={file.file_id} className='file-icon-container' onClick={() => goToFile(`${file.file_id}`)}>
                <FileIconComponent className='file-icon' />
                <MdFileDownload className="download-icon" />
                {file.name}.{file.type_icon}
              </div>
            )
          })}
          {(dirs.length > 0 && dirs[0].parent_dir !== null) && (
            <div className="add-file-container" onClick={() => handleAddFile(true)}>
              <FaPlus className="add-icon" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
