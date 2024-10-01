import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShipStation - Create stunning websites using AI",
  description: "Create stunning websites with ease using our AI-powered platform.",
  keywords: "AI, website creation, web design, ShipStation, stunning websites",
  openGraph: {
    title: "ShipStation - Create stunning websites",
    description: "Create stunning websites with ease using our AI-powered platform.",
    url: "https://shipstation.ai",
  },
  twitter: {
    title: "ShipStation - Create stunning websites",
    description: "Create stunning websites with ease using our AI-powered platform.",
  },
  other: {
    "google-site-verification": "G-2ZEXC0QVN6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-2ZEXC0QVN6" />
        <Script defer data-website-id="66fa7e660fcbb20478683a51" data-domain="shipstation.ai" src="https://datafa.st/js/script.js" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-2ZEXC0QVN6');
          `}
        </Script>
        <Script id="schema-org" type="application/ld+json">
          {`
            {  
              "@context":"http://schema.org",
              "@type":"Organization",
              "name":"ShipStation",
              "logo":"https://shipstation.ai/assets/logo.png",
              "url":"https://shipstation.ai",
              "brand":{  
                "@type":"Organization",
                "name":"ShipStation",
                "description":"Create stunning websites with ease using our AI-powered platform.",
                "logo":"https://shipstation.ai/assets/logo.png",
                "sameAs":[  
                  "https://bubble.io/",
                  "https://durable.co/",
                  "https://www.weebly.com",
                  "https://www.squarespace.com",
                  "https://www.shopify.com",
                  "https://www.wordpress.com"
                ]
              }
            }
          `}
        </Script>
        <Script id="schema-website" type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "Website",
              "name": "ShipStation.AI",
              "description": "Create stunning websites with ease using our AI-powered platform.",
              "url": "https://shipstation.ai",
              "image": "https://shipstation.ai/assets/logo.png",
              "keywords": "Create stunning websites with ease using our AI-powered platform."
            }
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
