export default function FirebaseSetupNotice() {
  return (
    <div className="firebase-setup-notice">
      <p className="eyebrow">Authentication setup</p>
      <h2>Connect Google sign-in</h2>
      <p>
        Add Firebase web app keys to <code>frontend/.env.local</code> only when
        you want Google login. Mobile OTP is delivered through your configured
        2Factor account.
      </p>
    </div>
  );
}
