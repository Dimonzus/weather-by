import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Погода Беларусь — почасовой прогноз",
  description: "Точный прогноз погоды для городов Беларуси",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          id="remove-bis-attr"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.querySelectorAll('[bis_skin_checked]').forEach(e=>e.removeAttribute('bis_skin_checked'));`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}