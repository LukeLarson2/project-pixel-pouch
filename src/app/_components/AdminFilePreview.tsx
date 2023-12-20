"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";

import LargeImage from "../_components/LargeImage";

import downloadFile from "../_utils/downloadFile";

import "../_stylesheets/adminFilePreview.css";

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
};

type Dir = {
  dir_id: number;
  project: number;
  parent_dir: number;
};

export default function AdminFilePreview({
  fileId,
  clearPreview,
}: {
  fileId: string;
  clearPreview: (value: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [viewLarge, setViewLarge] = useState(false);
  const supabase = createClientComponentClient();

  const router = useRouter();

  const handleView = (value: boolean) => {
    setViewLarge(value);
  };
  const backToFiles = () => {
    router.replace("/");
  };

  useEffect(() => {
    const getFile = async () => {
      const { data, error } = await supabase
        .from("files")
        .select()
        .eq("file_id", fileId);
      if (error) {
        console.error(error);
        return;
      }
      setFile(data[0]);
    };
    getFile();
  }, [fileId, supabase]);

  return (
    file && (
      <div className="admin-file-details-main">
        {viewLarge && (
          <LargeImage imageUrl={file.storage_url} handleView={handleView} />
        )}
        <div
          className="admin-back-to-files"
          onClick={() => clearPreview(false)}
        >
          <FaTimes /> Close Preview
        </div>
        <h1 className="admin-file-title" key={file.file_id}>
          File Name - {file.name}
        </h1>
        <div className="admin-file-info">
          {file.storage_url && (
            <>
              <div
                className="admin-file-thumbnail"
                style={{ backgroundImage: `url(${file.storage_url})` }}
                onClick={() => handleView(true)}
              />
            </>
          )}
          <div
            className="admin-details-block"
            style={{ width: file.storage_url ? "65%" : "100%" }}
          >
            <h3>File Details</h3>
            <p>{file.details}</p>
          </div>
        </div>
        <button
          className="admin-download-file"
          onClick={() => downloadFile(file.storage_url, file.type_icon)}
        >
          Download File
        </button>
      </div>
    )
  );
}
