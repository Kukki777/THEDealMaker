import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatbaseWidget from "@/components/ChatbaseWidget";
import { FirebaseAuthProvider } from "@/components/FirebaseAuthProvider";
import "./globals.css";

export const metadata = {
  title: "THEDealMaker | Property Sale & Purchase Firm",
  description:
    "Find, sell, and rent refined houses and plots with THEDealMaker.",
};

export default function RootLayout({ children }) {
  const content = (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader />
      {children}
      <SiteFooter />
      <ChatbaseWidget />
    </>
  );

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <FirebaseAuthProvider>{content}</FirebaseAuthProvider>
      </body>
    </html>
  );
}
