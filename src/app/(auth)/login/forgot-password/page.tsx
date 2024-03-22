"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const companyImage = "/assets/images/caloop_mobile_llcdark_logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const supabase = createClientComponentClient();

  const handleRequest = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/account-settings/password-reset`,
    });

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="login-main-container">
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <div className="logo-login">
        <div
          className="company-logo"
          style={{ backgroundImage: `url(${companyImage})` }}
        />
      </div>
      <div className="login-modal" style={{ height: "200px" }}>
        <h2>Forgot Password</h2>
        <input
          className="login-field"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />

        <button
          type="button"
          aria-label="Reset Pasword"
          className="login-sign-in-btn"
          onClick={handleRequest}
          style={{ fontSize: "18px" }}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
