'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { FaCheck } from "react-icons/fa";

import getUser from '../_utils/getUser';
import formatTimeAgo from '../_utils/formatTimeAgo';
import truncateString from '../_utils/truncateString';

import './style.css';

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

type User = {
  client_id: string;
  username: string;
  email: string;
  admin: boolean;
  subscription: string;
};

export default function Inbox() {
  const [messages, setMessages] = useState<MessageItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient();
  const router = useRouter();

  const getMessages = async () => {
    setIsLoading(true)
    const result = await getUser();
    if (result && Array.isArray(result) && 'client_id' in result[0]) {
      const user: User = result[0];

      const { data, error } = await supabase
        .from('messages')
        .select()
        .eq('user_id', user.client_id)
        .order('date_added', { ascending: false });

      if (error) {
        console.error(error);
        setIsLoading(false)
        return;
      }
      setMessages(data);
    }
    setIsLoading(false)
  }

  const handleGoToMessage = (id: string) => {
    router.push(`/inbox/${id}`)
  }

  useEffect(() => {
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return messages && (
    <div className="all-messages">
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <h2>Inbox</h2>
      {messages.map((message) => {
        const date = formatTimeAgo(message.date_added)
        const formMessage = truncateString(message.message, 100);
        return (
          <div className='singlemessage-container-all' key={`${message.todo_id}`} onClick={() => handleGoToMessage(`${message.todo_id}`)}>
            {message.complete && <div className="message-completed"><FaCheck /> Completed</div>}
            <p className="message-time-ago-all">Sent {date}</p>
            <h3 className="message-title-all">{message.title}</h3>
            <p className="message-message-all">{formMessage}</p>
          </div>
        )
      })}
    </div>
  )
}