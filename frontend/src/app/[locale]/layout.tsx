import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Outfit, Cairo } from 'next/font/google';
import "../globals.css";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/react";
import TrafficTracker from '@/components/store/TrafficTracker';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata = {
  title: 'SkinIQ',
  description: 'Premium AI-driven destination for holistic health and cosmetics.',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Enable static rendering
  setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  // Set dir='rtl' for Arabic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${outfit.variable} ${cairo.variable} antialiased min-h-screen flex flex-col ${locale === 'ar' ? 'font-arabic' : ''}`}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex-1">
            {children}
          </div>
          <Toaster richColors position="top-right" />
          <Analytics />
          <TrafficTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
