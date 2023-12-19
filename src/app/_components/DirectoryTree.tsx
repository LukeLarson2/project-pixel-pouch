'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { FaRegFolderOpen } from "react-icons/fa6";

import { FaFileAlt, FaFileImage, FaFilePdf, FaFileExcel, FaPlus } from "react-icons/fa";

import '../admin/clients/style.css'

type DirectoryTreeProps = {
  dirId: number;
};

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

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ dirId }) => {
  const [subDirectories, setSubDirectories] = useState<Dir[] | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchData = async (directoryId: number): Promise<{ directoriesData: Dir[]; filesData: File[] }> => {
    // Fetch subdirectories
    const { data: directoriesData } = await supabase
      .from('directories')
      .select()
      .eq('parent_dir', directoryId);

    // Fetch files
    const { data: filesData } = await supabase
      .from('files')
      .select()
      .eq('directory', directoryId);

    // Ensure directoriesData is not null or undefined
    const safeDirectoriesData = directoriesData || [];

    // Recursively fetch for each subdirectory
    const subDirsFetches = safeDirectoriesData.map(dir => fetchData(dir.dir_id));

    // Wait for all recursive fetches to complete
    await Promise.all(subDirsFetches);

    return { directoriesData: safeDirectoriesData, filesData: filesData || [] };
  };

  useEffect(() => {
    const initFetch = async () => {
      const { directoriesData, filesData } = await fetchData(dirId);
      setSubDirectories(directoriesData || []);
      setFiles(filesData || []);
      setIsLoading(false);
    };

    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirId, supabase]);

  if (isLoading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <>
      {subDirectories?.map(dir => (
        <div key={dir.dir_id} className="tree-branch">
          <div className="branch-name"><FaRegFolderOpen className="branch-icon-type" />{dir.name}</div>
          <div style={{ paddingLeft: '10px' }}>
            <DirectoryTree dirId={dir.dir_id} />
          </div>
        </div>
      ))}
      {files?.map(file => {
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
          <div key={file.file_id} className="tree-branch">
            <div className="branch-name-file">
              <FileIconComponent className="branch-icon-type"/>{file.name}
            </div>
          </div>
        )
      })}
    </>
  );
}

export default DirectoryTree;
