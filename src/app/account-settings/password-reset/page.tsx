"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

import "./style.css";

export default function PasswordReset() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [viewNew, setViewNew] = useState(false);
  const [viewConfirm, setViewConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleReset = async () => {
    setIsLoading(true);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    router.replace("/account-settings");
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!newPassword || !confirmPassword) {
        setPasswordError("");
      } else if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError("");
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [newPassword, confirmPassword]);

  return (
    <div className="password-reset-main">
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <h1>Reset Password</h1>
      <div
        className="password-reset-modal"
        style={{ height: passwordError !== "" ? "300px" : "250px" }}
      >
        <div className="new-pass-container">
          <input
            id="new-password"
            type={viewNew ? "text" : "password"}
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {viewNew ? (
            <FaEyeSlash
              onClick={() => setViewNew(false)}
              className="view-pass"
            />
          ) : (
            <FaEye onClick={() => setViewNew(true)} className="view-pass" />
          )}
        </div>
        <div className="confirm-pass-container">
          <input
            id="confirm-password"
            type={viewConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {viewConfirm ? (
            <FaEyeSlash
              onClick={() => setViewConfirm(false)}
              className="view-pass"
            />
          ) : (
            <FaEye onClick={() => setViewConfirm(true)} className="view-pass" />
          )}
        </div>
        {passwordError !== "" && (
          <p className="error-message">{passwordError}</p>
        )}
        <button
          className="reset-pass-btn"
          aria-label="Reset"
          disabled={passwordError !== ""}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
