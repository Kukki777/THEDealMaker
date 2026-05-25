import AuthShowcase from "@/components/AuthShowcase";
import FirebaseAuthForm from "@/components/FirebaseAuthForm";

export default function LoginPage() {
  return (
    <main className="interior-shell auth-shell">
      <AuthShowcase title="Secure access to remarkable homes." />
      <section className="auth-card firebase-auth-card">
        <FirebaseAuthForm mode="login" />
      </section>
    </main>
  );
}
