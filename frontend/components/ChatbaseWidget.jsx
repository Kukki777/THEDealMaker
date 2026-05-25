import Script from "next/script";

export default function ChatbaseWidget() {
  const chatbotId = process.env.NEXT_PUBLIC_CHATBASE_CHATBOT_ID;

  if (!chatbotId) {
    return null;
  }

  const config = JSON.stringify({
    chatbotId,
    showFloatingInitialMessages: true,
    floatingInitialMessagesDelay: 3,
    floatingMessagesOncePerSession: true,
  }).replace(/</g, "\\u003c");

  return (
    <>
      <Script
        id="chatbase-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `window.chatbaseConfig = ${config};` }}
      />
      <Script
        defer
        id={chatbotId}
        src="https://www.chatbase.co/embed.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
