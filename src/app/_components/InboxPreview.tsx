'use client'
import React, { useEffect, useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import formatTimeAgo from "../_utils/formatTimeAgo";
import truncateString from "../_utils/truncateString";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import '../inbox/style.css';


type MessageItem = {
  todo_id: number;
  title: string;
  message: string;
  viewed: boolean;
  complete: boolean;
  date_added: string;
  route: string;
  project_id: number;
  dir_id: number;
  client_id: number;
  download: boolean;
  upload: boolean;
};

type InboxPreviewProps = {
  newMessages: MessageItem[];
  closePreview: () => void;
  onViewMessage: (id:string) => Promise<void>;
}

const InboxPreview = forwardRef<HTMLDivElement, InboxPreviewProps>(
({newMessages, closePreview, onViewMessage}, ref) => {
  // const [messages, setMessages] = useState<MessageItem[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const navToInbox = () => {
    router.replace('/inbox')
  }

  return (
    <div className="inbox-preview" ref={ref}>
      <div className="prev-header">New Messages</div>
      {newMessages.length < 1 ? (
        <div className="prev-no-messages">No New Messages</div>
      ) : (
        <>
        {newMessages.map((todo) => {
          if (todo.viewed === false) {
            const {todo_id, title, message, date_added} = todo;
            const formTitle = truncateString(title, 35)
            const formMessage = truncateString(message, 100);
            const timeAgo = formatTimeAgo(date_added);
            return (
              <div key={todo_id} className="message" onClick={() => onViewMessage(`${todo_id}`)}>
                <p className="sate-style">{timeAgo}</p>
                <h4>{formTitle}</h4>
                <p className="summary">{formMessage}</p>
              </div>
            )
          }
        })}
        </>
      )}
      <div className="prev-footer" onClick={navToInbox}>
        <p>See All Messages</p>
      </div>
    </div>
  )
})

InboxPreview.displayName = 'InboxPreview';

export default InboxPreview;