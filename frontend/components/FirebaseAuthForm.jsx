"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { apiRequest, clearMobileSession, getMobileSession, saveMobileSession } from "@/lib/api";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

function indianMobile(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const mobile = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;
  return /^[6-9]\d{9}$/.test(mobile) ? `+91${mobile}` : "";
}

function authMessage(error) {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before completing.";
    case "auth/popup-blocked":
      return "Google sign-in popup was blocked. Allow pop-ups for localhost, then try again.";
    default:
      return error.message || "Unable to complete authentication.";
  }
}

export default function FirebaseAuthForm({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [resendDelay, setResendDelay] = useState(0);

  useEffect(() => {
    if (!resendDelay) return undefined;
    const timer = window.setInterval(() => {
      setResendDelay((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendDelay]);

  const sendOtp = async () => {
    const mobile = indianMobile(phone);
    if (!mobile) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (isRegister && fullName.trim().length < 2) {
      setError("Enter your full name to create an account.");
      return;
    }

    setWorking(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest("/auth/mobile/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone: mobile, name: isRegister ? fullName.trim() : "" }),
      });
      setChallengeId(result.challengeId);
      setOtp("");
      setResendDelay(30);
      setMessage(result.message || `OTP sent to ${mobile}. Enter the code below.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  };

  const requestOtp = (event) => {
    event.preventDefault();
    void sendOtp();
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(otp)) {
      setError("Enter the OTP from your SMS.");
      return;
    }
    setWorking(true);
    setError("");
    try {
      const result = await apiRequest("/auth/mobile/verify-otp", {
        method: "POST",
        body: JSON.stringify({ challengeId, otp }),
      });
      saveMobileSession(result.token, result.user);
      router.push(isRegister ? "/list-property" : "/#services");
    } catch (verificationError) {
      setError(authMessage(verificationError));
      setWorking(false);
    }
  };

  const continueWithGoogle = async () => {
    setWorking(true);
    setError("");
    try {
      clearMobileSession();
      const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      if (!result.user || getMobileSession()?.token) return;
      await apiRequest("/auth/me");
      router.replace(isRegister ? "/list-property" : "/#services");
    } catch (googleError) {
      setError(authMessage(googleError));
      setWorking(false);
    }
  };

  return (
    <div className="firebase-auth-form">
      <p className="eyebrow">{isRegister ? "Create account" : "Welcome back"}</p>
      <h1>{isRegister ? "Register with mobile OTP" : "Sign in securely"}</h1>
      <p className="helper-copy">
        {isRegister
          ? "Verify your Indian mobile number to list and manage properties."
          : "Receive an OTP on your mobile number or continue with Google."}
      </p>
      {firebaseConfigured && (
        <>
          <button className="google-auth-button" disabled={working} onClick={() => void continueWithGoogle()} type="button">
            <span className="google-mark">G</span>
            Continue with Google
          </button>
          <div className="auth-divider"><span>or use mobile OTP</span></div>
        </>
      )}
      {!challengeId ? (
        <form className="stack-form" onSubmit={requestOtp}>
          {isRegister && (
            <label className="field">
              <span>Full name</span>
              <input autoComplete="name" onChange={(event) => setFullName(event.target.value)} placeholder="Priyansh Agrawal" required value={fullName} />
            </label>
          )}
          <label className="field">
            <span>Mobile number</span>
            <input autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+91 84334 03333" required value={phone} />
          </label>
          <button className="primary-button full-button" disabled={working} type="submit">
            {working ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form className="stack-form" onSubmit={verifyOtp}>
          <label className="field">
            <span>One-time password</span>
            <input autoComplete="one-time-code" inputMode="numeric" maxLength="6" onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="OTP code" required value={otp} />
          </label>
          <button className="primary-button full-button" disabled={working} type="submit">
            {working ? "Verifying..." : "Verify and continue"}
          </button>
          <div className="otp-actions">
            <button className="text-action" disabled={working || resendDelay > 0} onClick={() => void sendOtp()} type="button">
              {resendDelay > 0 ? `Resend OTP in ${resendDelay}s` : "Resend OTP"}
            </button>
            <button className="text-action subtle-action" disabled={working} onClick={() => { setChallengeId(""); setOtp(""); setMessage(""); setResendDelay(0); }} type="button">
              Change number
            </button>
          </div>
        </form>
      )}
      {message && <p className="success-banner auth-feedback">{message}</p>}
      {error && <p className="form-error auth-feedback">{error}</p>}
      <p className="auth-switch">
        {isRegister ? "Already a member?" : "New to THEDealMaker?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </div>
  );
}
