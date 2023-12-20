"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { FaEdit } from "react-icons/fa";

import getUser from "../_utils/getUser";
import "./style.css";
import ChangeSubscription from "../_components/ChangeSubscription";

type User = {
  client_id: string;
  name: string;
  username: string;
  email: string;
  admin: boolean;
  subscription: string;
  best_time: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export default function Settings() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logingOut, setLoginOut] = useState(false);
  const [showChangeSub, setShowChangeSub] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    setLoginOut(true);
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleReset = () => {
    router.push("/account-settings/password-reset");
  };

  const handleShowModal = (value: boolean) => {
    setShowChangeSub(value);
  };

  useEffect(() => {
    const retrieveUser = async () => {
      setIsLoading(true);
      await getUser()
        .then((response) => {
          if (!response) {
            router.replace("/login");
          } else {
            setUserInfo(response[0]);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
      setIsLoading(false);
    };
    retrieveUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="settings-main">
      {isLoading || !userInfo || logingOut ? (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          {showChangeSub && (
            <ChangeSubscription handleShowModal={handleShowModal} />
          )}
          <h2>Account Settings</h2>
          <div className="client-details">
            <FaEdit
              className="client-edit-btn"
              onClick={() => handleShowModal(true)}
            />
            <div className="client-info-line">
              Name <span>{userInfo?.name}</span>
            </div>
            <div className="client-info-line">
              Email <span>{userInfo?.email}</span>
            </div>
            <div className="client-info-line">
              Street address <span>{userInfo?.address}</span>
            </div>
            <div className="client-info-line">
              City <span>{userInfo?.city}</span>
            </div>
            <div className="client-info-line">
              State <span>{userInfo?.state}</span>
            </div>
            <div className="client-info-line">
              Zip <span>{userInfo?.zip}</span>
            </div>
            <div className="client-info-line">
              Subscription <span>{userInfo?.subscription}</span>
            </div>
          </div>
          <div className="settings-btn-pos">
            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
            <button className="sign-out-btn" onClick={handleReset}>
              Reset Password
            </button>
          </div>
        </>
      )}
    </div>
  );
}
