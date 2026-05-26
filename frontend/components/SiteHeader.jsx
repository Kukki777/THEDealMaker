"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { clearMobileSession } from "@/lib/api";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

function AccountActions() {
  const { loading, user } = useFirebaseAuth();

  if (loading) return <span className="header-loading" />;
  if (!user) {
    return <Link className="ghost-button link-button" href="/login">Sign in</Link>;
  }

  return (
    <>
      <Link className="ghost-button link-button account-link" href="/dashboard">
        {user.name || user.displayName || user.phone || user.phoneNumber || "Account"}
      </Link>
      <button className="sign-out-button" onClick={() => {
        clearMobileSession();
        if (firebaseConfigured) void signOut(getFirebaseAuth());
      }} type="button">
        Sign out
      </button>
    </>
  );
}

export default function SiteHeader() {
  return (
    <div className="navbar-wrap">
      <header className="site-header global-shell">
        <Link className="brand" href="/" aria-label="THEDealMaker home">
          <span aria-hidden="true" className="brand-mark" />
          <span className="brand-name">THE <span>DEAL MAKER</span><small>Property firm</small></span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/#services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="header-actions">
          <AccountActions />
        </div>
      </header>
    </div>
  );
}
