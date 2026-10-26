import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ChapterBackdrop } from "@/components/layout/chapter-backdrop";
import { Grain } from "@/components/layout/grain";
import { GridLines } from "@/components/layout/grid-lines";
import { Rail } from "@/components/layout/rail";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { EasterEgg } from "@/components/layout/easter-egg";
import { Preloader } from "@/components/sections/preloader";
import { person, site } from "@/data/portfolio";
import "./globals.css";

const clash = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  preload: true,
});

const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${person.firstName} ${person.lastName}` },
  description: site.description,
  applicationName: `${person.firstName} ${person.lastName}`,
  authors: [{ name: `${person.firstName} ${person.lastName}`, url: site.url }],
  keywords: ["Sheraz Yousaf", "Data Analyst", "Product Data Analyst", "Data Quality Analyst", "Frontend Developer", "Lahore", "Pakistan"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: `${person.firstName} ${person.lastName}`,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeebe4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0a" },
  ],
  colorScheme: "light dark",
};

/** Runs before paint: flags JS + repeat visits so the preloader never flashes. */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('sy-seen'))d.classList.add('seen')}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${clash.variable} ${satoshi.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="label fixed left-4 top-4 z-[200] -translate-y-24 bg-accent px-3 py-2 text-[#141312] transition-transform focus:translate-y-0"
          >
            Skip to content
          </a>
          <ChapterBackdrop />
          <GridLines />
          <Preloader />
          <Navbar />
          <Rail />
          <ScrollProgress />
          <SmoothScroll />
          {children}
          <Grain />
          <EasterEgg />
        </ThemeProvider>
      </body>
    </html>
  );
}
