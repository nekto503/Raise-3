import type { Metadata } from "next";
import Home from "@/components/Home";

export const metadata: Metadata = {
  title: "Raise 3 — Напиши. Получи презентацию.",
  description:
    "Raise 3 — AI-нейросеть, превращающая текст в зрелищные презентации: структура, дизайн, графики и картинки за 30 секунд. PPTX, PDF, ссылка.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Raise 3",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-нейросеть, превращающая обычный текст в готовую презентацию: структура, дизайн, графики и картинки за 30 секунд.",
  inLanguage: ["ru", "en"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
    description: "Демо-доступ бесплатно, генерация — по подписке Pro от 490 ₽/мес",
  },
  featureList: [
    "Автоструктура презентации из текста",
    "Умный дизайн слайдов",
    "Графики из данных",
    "Генерация иллюстраций",
    "Брендбук",
    "Голосовой ввод",
    "Совместная работа",
    "Экспорт в PPTX / PDF / Google Slides",
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home />
    </>
  );
}
