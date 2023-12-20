"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";

import LargeImage from "../_components/LargeImage";

import downloadFile from "../_utils/downloadFile";
import formatTimeAgo from "../_utils/formatTimeAgo";

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
  refreshTree,
  updateTree,
}: {
  fileId: string;
  clearPreview: (value: boolean) => void;
  refreshTree: boolean;
  updateTree: (value: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [viewLarge, setViewLarge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const supabase = createClientComponentClient();

  const router = useRouter();

  const handleView = (value: boolean) => {
    setViewLarge(value);
  };
  const backToFiles = () => {
    router.replace("/");
  };

  const deleteFile = async () => {
    setIsLoading(true);
    const urlString = file?.storage_url;
    if (urlString) {
      const parts = urlString.split("/");
      const index = parts.indexOf("client_files");
      const extractedString = parts.slice(index + 1).join("/");

      const { error } = await supabase.storage
        .from("client_files")
        .remove([extractedString]);

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("files")
        .delete()
        .eq("file_id", file.file_id);

      if (deleteError) {
        console.error(deleteError);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      clearPreview(false);
    }
  };

  const viewFile = async () => {
    const { error } = await supabase
      .from("files")
      .update({ new: false })
      .eq("file_id", fileId);

    if (error) {
      console.error(error);
      return;
    }
  };

  useEffect(() => {
    const getFile = async () => {
      setIsLoading(true);
      await viewFile();
      const { data, error } = await supabase
        .from("files")
        .select()
        .eq("file_id", fileId);
      if (error) {
        console.error(error);
        return;
      }
      const format = formatTimeAgo(data[0].last_modified);
      setFile(data[0]);
      setTimeAgo(format);
      updateTree(false);
      setIsLoading(false);
    };
    getFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, supabase]);

  return (
    file && (
      <div className="admin-file-details-main">
        {isLoading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        {viewLarge && (
          <LargeImage imageUrl={file.storage_url} handleView={handleView} />
        )}
        <div
          className="admin-back-to-files"
          onClick={() => clearPreview(false)}
        >
          <FaTimes /> Close Preview
        </div>
        <div className="admin-file-title" key={file.file_id}>
          <h1>File Name - {file.name}</h1>
          <p>Last modified {timeAgo}</p>
        </div>
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
        <div className="admin-preview-btns">
          <button
            className="admin-download-file"
            onClick={() => downloadFile(file.storage_url, file.type_icon)}
          >
            Download File
          </button>
          <button className="admin-delete-file" onClick={() => deleteFile()}>
            Delete File
          </button>
        </div>
      </div>
    )
  );
}
