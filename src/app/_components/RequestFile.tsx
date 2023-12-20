"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RequestFile({
  dirId,
  userId,
  projectId,
}: {
  dirId: string;
  userId: string;
  projectId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="request-overlay">
      <div className="request-modal">
        <input
          type="text"
          className="request-title"
          value={title}
          placeholder="Subject"
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          value={title}
          placeholder="Message - Include details to help specify what you need in the current folder"
          onChange={(e) => setTitle(e.target.value)}
          className="request-message"
        />
      </div>
    </div>
  );
}
