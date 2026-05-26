import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatbaseWidget from "@/components/ChatbaseWidget";
import { FirebaseAuthProvider } from "@/components/FirebaseAuthProvider";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

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
      <body className={poppins.variable} suppressHydrationWarning>
        <FirebaseAuthProvider>{content}</FirebaseAuthProvider>
      </body>
    </html>
  );
}
