"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

import "./style.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const router = useRouter();

  const supabase = createClientComponentClient();

  const companyLogo = "/assets/images/pixel-sky-design-logo-small.png";

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (existingUser) {
      setSignUpError("An account already exists with that email");
      return;
    }

    if (userError && existingUser !== null) {
      console.error("Error checking for existing user: ", userError);
      setSignUpError("Error during sign up");
      return;
    }

    const signUpResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/callback`,
      },
    });

    if (signUpResponse.error) {
      setSignUpError("Error during sign up");
      console.error("Error during sign up: ", signUpResponse.error.message);
      return;
    }

    if (signUpResponse.data.user) {
      setUser(signUpResponse.data.user);

      const clientData = {
        username: "My Account",
        email: signUpResponse.data.user.email,
        admin: false,
        subscription: "Free",
      };

      const insertResponse = await supabase.from("users").insert([clientData]);

      if (insertResponse.error) {
        console.error("Error inserting client data: ", insertResponse.error);
      }

      router.refresh();
      setEmail("");
      setPassword("");
    }
  };

  const handleSignIn = async () => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (res.error) {
      setSignInError("Incorrect email or password");
      console.error("Error signing in: ", res.error.message);
      return;
    }

    setUser(res.data.user);
    window.location.reload();
  };

  const getUser = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      setIsLoading(false);
      return;
    }

    const response = await supabase.auth.getUser();
    setUser(response.data.user);

    const { data, error } = await supabase
      .from("users")
      .select("admin")
      .eq("email", response.data.user?.email);

    if (error) {
      setIsLoading(false);
      return;
    }

    if (data[0].admin) {
      router.replace("/admin/clients");
      return;
    }
    router.replace("/");
  };

  const handleToForget = () => {
    router.push("/login/forgot-password");
  };

  useEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!email) {
        setEmailError("");
      } else if (!validateEmail(email)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }

      if (!password) {
        setPasswordError("");
      } else if (password.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError("");
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [email, password]);

  if (isLoading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div className="login-main-container">
      <div className="logo-login">
        <div
          className="company-logo"
          style={{ backgroundImage: `url(${companyLogo})` }}
        />
      </div>
      <div
        className="login-modal"
        style={{
          height:
            emailError || passwordError || signInError || signUpError
              ? "350px"
              : "300px",
        }}
      >
        <h2>Login</h2>
        <input
          className={`login-field ${emailError ? "error" : ""}`}
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />

        <input
          className={`login-field ${passwordError ? "error" : ""}`}
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {passwordError && <div className="error-message">{passwordError}</div>}
        {emailError && <div className="error-message">{emailError}</div>}
        {signInError && <div className="error-message">{signInError}</div>}
        {signUpError && <div className="error-message">{signUpError}</div>}
        <button
          className="login-sign-in-btn"
          aria-label="Sign in"
          id="sign-in"
          disabled={!!(emailError || passwordError)}
          onClick={() => handleSignIn()}
        >
          Sign In
        </button>
        <p className="forgot-password" onClick={() => handleToForget()}>
          Forgot Password
        </p>
      </div>
    </div>
  );
}
