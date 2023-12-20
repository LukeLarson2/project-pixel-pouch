"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaCheck } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

import formatTimeAgo from "../../_utils/formatTimeAgo";
import downloadFile from "../../_utils/downloadFile";
import { useRouter } from "next/navigation";
import AddFileModal from "@/app/_components/AddFileModal";

type MessageItem = {
  todo_id: number;
  user_id: number;
  project: number;
  dir_id: number;
  title: string;
  message: string;
  viewed: boolean;
  complete: boolean;
  date_added: string;
  storage_url: string;
  download: boolean;
  upload: boolean;
};

export default function MessageDetails({
  params,
}: {
  params: {
    messageId: string;
  };
}) {
  const [message, setMessage] = useState<MessageItem | null>(null);
  const [timeAgo, setTimeAgo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fileType, setFileType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const getMessage = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("todo_id", params.messageId)
      .single();

    if (error) {
      console.error(error);
      return;
    }
    setMessage(data);
    const time = formatTimeAgo(data.date_added);
    setTimeAgo(time);
  };

  const handleAddFile = (value: boolean) => {
    setShowModal(value);
  };

  const handleComplete = async (value: boolean) => {
    setIsLoading(true);

    const updateData = {
      complete: value,
      date_completed: value ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("todo_id", `${params.messageId}`);

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }
    await getMessage();
    setIsLoading(false);
  };

  const startDownload = async (url: string, type: string) => {
    setIsLoading(true);
    await downloadFile(url, type);
    setIsLoading(false);
  };

  const handleToInbox = () => {
    router.replace("/inbox");
  };

  useEffect(() => {
    getMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.messageId, supabase]);

  useEffect(() => {
    if (message?.download) {
      const sliceType = message.storage_url.split(".").pop()?.toLowerCase();
      if (sliceType) {
        setFileType(sliceType);
      }
    }
  }, [message]);

  return (
    message &&
    timeAgo && (
      <div className="single-message-container">
        {isLoading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        {showModal && (
          <AddFileModal
            handleAddFile={handleAddFile}
            currentDirId={`${message.dir_id}`}
          />
        )}
        <div className="back-to-inbox" onClick={handleToInbox}>
          <IoArrowBack /> Back to inbox
        </div>
        <h2 className="message-title">Subject: {message.title}</h2>
        <p className="message-time-ago">Sent {timeAgo}</p>
        <p className="message-message">{message.message}</p>
        <div className="btn-placement-message">
          {message.upload && (
            <button
              className="message-btn-upload"
              onClick={() => handleAddFile(true)}
            >
              Upload File
            </button>
          )}
          {message.download && (
            <button
              className="message-btn-download"
              onClick={() => startDownload(message.storage_url, fileType)}
            >
              Download File
            </button>
          )}
          {message.complete ? (
            <button className="todo-done" onClick={() => handleComplete(false)}>
              <FaCheck /> Complete
            </button>
          ) : (
            <button
              className="todo-not-done"
              onClick={() => handleComplete(true)}
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    )
  );
}
