import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pocketer.app"
  ),
  title: "Pocketer — swap one habit, pocket the difference",
  description:
    "Pocketer finds the money quietly leaking out of your account and redirects it into savings.",
  openGraph: {
    title: "Pocketer",
    description: "Swap one habit. Pocket the difference.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pocketer",
    description: "Swap one habit. Pocket the difference.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-950 text-ink-100 grain">
        <SessionProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
