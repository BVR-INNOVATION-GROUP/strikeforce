// import type { Metadata } from "next";
// import { Geist, Geist_Mono, Poppins } from "next/font/google";
// import "./globals.css";
// import ConditionalLayout from "@/src/components/base/ConditionalLayout";
// import { Toaster } from "sonner";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "StrikeForce - Connect Universities, Students, and Partners",
//   description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently — with traceable outcomes and verified participants.",
//   keywords: ["strikeforce", "university", "students", "partners", "projects", "collaboration", "education"],
//   authors: [{ name: "BVR Innovation Group" }],
//   creator: "BVR Innovation Group",
//   publisher: "BVR Innovation Group",
//   metadataBase: new URL("https://www.strikeforcetalent.africa"),
//   openGraph: {
//     title: "StrikeForce - Connect Universities, Students, and Partners",
//     description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently — with traceable outcomes and verified participants.",
//     url: "https://www.strikeforcetalent.africa",
//     siteName: "StrikeForce",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "StrikeForce - Connect Universities, Students, and Partners",
//     description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently.",
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
//           rel="stylesheet"
//         />

//       </head>
//       <body
//         className={`antialiased bg-pale`}
//         suppressHydrationWarning
//       >
//         <ConditionalLayout>{children}</ConditionalLayout>
//         <Toaster position="top-right" richColors />
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/src/components/base/ConditionalLayout";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StrikeForce - Connect Universities, Students, and Partners",
  description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently — with traceable outcomes and verified participants.",
  keywords: ["strikeforce", "university", "students", "partners", "projects", "collaboration", "education"],
  authors: [{ name: "BVR Innovation Group" }],
  creator: "BVR Innovation Group",
  publisher: "BVR Innovation Group",
  metadataBase: new URL("https://www.strikeforcetalent.africa"),
  openGraph: {
    title: "StrikeForce - Connect Universities, Students, and Partners",
    description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently — with traceable outcomes and verified participants.",
    url: "https://www.strikeforcetalent.africa",
    siteName: "StrikeForce",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StrikeForce - Connect Universities, Students, and Partners",
    description: "A collaboration system that enables universities, students, and partners to run real-world projects efficiently.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-pale`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R3834B3DCH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R3834B3DCH');
          `}
        </Script>

        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
