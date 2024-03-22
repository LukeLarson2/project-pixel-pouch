"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

import "../_stylesheets/request.css";

export default function RequestFile({
  dirId,
  userId,
  projectId,
  handleRequestModal,
}: {
  dirId: string;
  userId: string;
  projectId: string;
  handleRequestModal: (value: boolean, id: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState(false);
  const [upload, setUpload] = useState(true);
  const [storageUrl, setStorageUrl] = useState(null);
  const [dirName, setDirName] = useState("");

  const supabase = createClientComponentClient();

  const getDirInfo = async () => {
    setIsLoading(true);
    const { data: dirInfo, error: dirError } = await supabase
      .from("directories")
      .select("name")
      .eq("dir_id", dirId);

    if (dirError) {
      console.error(dirError);
      setIsLoading(false);
      return;
    }

    setDirName(dirInfo[0].name);
    setIsLoading(false);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const { data: maxMessageIdData, error: maxMessageIdError } = await supabase
      .from("messages")
      .select("todo_id")
      .order("todo_id", { ascending: false })
      .limit(1);

    if (maxMessageIdError) {
      console.error(maxMessageIdError);
      setIsLoading(false);
      return;
    }

    const newMessageId =
      maxMessageIdData.length > 0 ? maxMessageIdData[0].todo_id + 1 : 1;
    const requestData = {
      todo_id: newMessageId,
      user_id: userId,
      project: projectId,
      dir_id: dirId,
      title,
      message,
      viewed: false,
      complete: false,
      date_added: new Date(),
      storage_url: storageUrl,
      download,
      upload,
    };

    const { error } = await supabase.from("messages").insert(requestData);

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    alert("Request Sent");
    handleRequestModal(false, "");
  };

  useEffect(() => {
    getDirInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirId]);

  return (
    <div className="request-overlay">
      <div className="request-modal">
        {isLoading && dirName === "" ? (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        ) : (
          <>
            <FaTimes
              className="close-request-modal"
              onClick={() => handleRequestModal(false, "")}
            />
            <h2 style={{ textAlign: "center", margin: "0px", color: "#666" }}>
              Request file for <br></br>&quot;{dirName}&quot;
            </h2>
            <input
              type="text"
              className="request-title"
              value={title}
              placeholder="Subject"
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              value={message}
              placeholder={`Message description of what is needed in folder "${dirName}"`}
              onChange={(e) => setMessage(e.target.value)}
              className="request-message"
            />
            <button
              type="button"
              aria-label="Send Request"
              className="request-submit"
              onClick={handleSendRequest}
            >
              Send Request
            </button>
          </>
        )}
      </div>
    </div>
  );
}
