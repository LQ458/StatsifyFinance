import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "../i18n";
import "katex/dist/katex.min.css";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params: { locale } }: Props) {
  const messages = useMessages();

  if (!locales.includes(locale as any)) notFound();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Shanghai"
    >
      {children}
    </NextIntlClientProvider>
  );
}
