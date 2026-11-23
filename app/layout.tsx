import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Geist, Pinyon_Script } from "next/font/google";
import "./globals.css";

const body = Geist({ subsets: ["latin"], variable: "--font-body" });
// Used by the Golden Poruwa invitation design
// Used by the animated invitation designs
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif" });
// Engraved capitals for the Story templates
const caps = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-caps" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script" });

export const metadata: Metadata = {
  title: { default: "Eternal Chapter", template: "%s · Eternal Chapter" },
  description: "Your story, beautifully told. Digital wedding invitations with personal WhatsApp links and live RSVPs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${script.variable} ${serif.variable} ${caps.variable}`}>
      <body>{children}</body>
    </html>
  );
}
