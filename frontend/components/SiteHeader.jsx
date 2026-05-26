"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { clearMobileSession } from "@/lib/api";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

function AccountActions() {
  const { loading, user } = useFirebaseAuth();
  const pathname = usePathname();

  if (loading) return <span className="header-loading" />;
  if (!user) {
    const isLoginPage = pathname === "/login";
    return (
      <Link className="ghost-button link-button" href={isLoginPage ? "/register" : "/login"}>
        {isLoginPage ? "Register" : "Sign in"}
      </Link>
    );
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
