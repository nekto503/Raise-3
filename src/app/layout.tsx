import type { Metadata, Viewport } from "next";
import { Unbounded, Inter_Tight, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const heading = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raise3.ai"),
  title: {
    default: "Raise 3 — Напиши. Получи презентацию.",
    template: "%s — Raise 3",
  },
  description:
    "Raise 3 — AI-нейросеть, превращающая текст в зрелищные презентации: структура, дизайн, графики и картинки за 30 секунд. PPTX, PDF, ссылка.",
  keywords: [
    "Raise 3",
    "AI презентации",
    "нейросеть для презентаций",
    "генерация слайдов",
    "AI presentation generator",
    "text to slides",
    "дизайн презентаций",
  ],
  authors: [{ name: "Raise 3" }],
  creator: "Raise 3",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: ["en_US"],
    url: "https://raise3.ai",
    siteName: "Raise 3",
    title: "Raise 3 — Напиши. Получи презентацию.",
    description:
      "AI-нейросеть, которая превращает обычный текст в готовую презентацию со структурой, дизайном и графиками. За 30 секунд.",
    images: [{ url: "/images/og.jpg", width: 1440, height: 720, alt: "Raise 3 — text to deck" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raise 3 — Напиши. Получи презентацию.",
    description: "Текст → зрелищная презентация за 30 секунд. Меньше слайдов вручную. Больше жизни.",
    images: ["/images/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${display.variable} ${heading.variable} ${body.variable} ${mono.variable} antialiased bg-paper text-ink`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
