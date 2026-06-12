import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ar-trans-tk.ua"),
  title: "AR-TRANS | Вантажні перевезення Україна та Європа",
  description:
    "AR-TRANS — вантажні, міжнародні та рефрижераторні перевезення для бізнесу. Надійна логістика та контроль доставки 24/7.",
  openGraph: {
    title: "AR-TRANS | Вантажні перевезення Україна та Європа",
    description:
      "Вантажні, міжнародні та рефрижераторні перевезення для бізнесу з контролем маршруту, термінів і температури.",
    type: "website",
    locale: "uk_UA",
    siteName: "AR-TRANS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${inter.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
