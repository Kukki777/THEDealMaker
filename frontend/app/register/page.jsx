import AuthShowcase from "@/components/AuthShowcase";
import FirebaseAuthForm from "@/components/FirebaseAuthForm";

export default function RegisterPage() {
  return (
    <main className="interior-shell auth-shell">
      <AuthShowcase title="List your home with verified access." />
      <section className="auth-card firebase-auth-card">
        <FirebaseAuthForm mode="register" />
      </section>
    </main>
  );
}
