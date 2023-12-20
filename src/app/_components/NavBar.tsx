"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaInbox } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaExclamationCircle } from "react-icons/fa";

import InboxPreview from "./InboxPreview";
import { useRouter } from "next/navigation";

import "../_stylesheets/navbar.css";

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

type ProjectItem = {
  project_id: number;
  client_id: number;
  name: string;
  root_dir: number;
  root_file: number;
};

type User = {
  username: string;
  email: string;
  admin: boolean;
};

export default function NavBar() {
  const [userData, setUserData] = useState<User | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [inbox, setInbox] = useState<MessageItem[]>([]);
  const [newMessages, setNewMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClientComponentClient();

  const inboxPreviewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const companyImage = "/assets/images/pixel-sky-design-logo-small.png";

  const navLinks = [
    { name: "My Projects", href: "/" },
    { name: "Inbox", href: "/inbox" },
  ];

  const adminLinks = [
    { name: "Clients Dashboard", href: "/admin/clients" },
    { name: "Add Client", href: "/admin/add-client" },
  ];

  const handleViewPreview = () => {
    if (showPreview) {
      return;
    }
    setShowPreview(true);
  };

  const closeModals = () => {
    setShowPreview(false);
  };

  const goToProjects = () => {
    router.replace("/");
  };

  const goToSettings = () => {
    router.replace("/account-settings");
  };

  const checkUser = async () => {
    setIsLoading(true);
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      setIsLoading(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", user?.email)
      .single();

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const { data: newMessages, error: messagesError } = await supabase
      .from("messages")
      .select()
      .filter("viewed", "eq", false)
      .filter("user_id", "eq", data.client_id);

    if (messagesError) {
      console.error(messagesError);
      setIsLoading(false);
      return;
    }

    setUserData(data);
    // const notViewed = newMessages.filter((item) => item.viewed === false);
    // const todoIds = notViewed.map((item) => item.todo_id);

    if (newMessages) {
      setNewMessages(newMessages);
    }

    // setInbox(newMessages as MessageItem[])
    setIsLoading(false);
  };

  const handleViewMessage = async (id: string) => {
    if (!id) {
      console.error("Invalid ID provided: ", id);
      return;
    }

    const { error } = await supabase
      .from("messages")
      .update({ viewed: true })
      .eq("todo_id", id);

    if (error) {
      console.error(error);
      return;
    }

    await checkUser();
    router.replace(`/inbox/${id}`);
  };

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inboxPreviewRef.current &&
        !inboxPreviewRef.current.contains(event.target as Node)
      ) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pathname = usePathname();

  return (
    userData && (
      <div className="nav-bar">
        <div className="nav-container">
          <div className="nav-main">
            <div className="nav-prof">
              <div className="nav-links">
                {userData.admin ? (
                  <>
                    {adminLinks.map((link) => {
                      const isActive =
                        link.href === "/"
                          ? pathname === link.href
                          : pathname.startsWith(link.href);
                      return (
                        <Link
                          href={link.href}
                          onClick={closeModals}
                          key={link.name}
                          className={isActive ? "active-link" : "nav-link"}
                        >
                          {link.name}
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {navLinks.map((link) => {
                      const isActive =
                        link.href === "/"
                          ? pathname === link.href
                          : pathname.startsWith(link.href);
                      return (
                        <Link
                          href={link.href}
                          onClick={closeModals}
                          key={link.name}
                          className={isActive ? "active-link" : "nav-link"}
                        >
                          {link.name}
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="right-nav">
                <div className="nav-profile">
                  Welcome back, {userData?.username}
                </div>
                <div className="inbox">
                  {showPreview && (
                    <InboxPreview
                      newMessages={newMessages}
                      closePreview={() => setShowPreview(false)}
                      onViewMessage={handleViewMessage}
                      ref={inboxPreviewRef}
                    />
                  )}
                  {newMessages.length > 0 && (
                    <FaExclamationCircle className="notification" />
                  )}
                  <FaInbox
                    className="icon"
                    onClick={() => handleViewPreview()}
                  />
                </div>
                <IoSettingsSharp className="icon" onClick={goToSettings} />
              </div>
            </div>
          </div>
          <div className="main-links">
            <div
              className="company-img"
              style={{ backgroundImage: `url(${companyImage})` }}
            />
          </div>
        </div>
      </div>
    )
  );
}
