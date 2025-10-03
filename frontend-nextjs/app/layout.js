import AuthProvider from "./authProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import AppProvider from "./appProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Task Manager",
  description: "FastAPI + Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProvider>
          <AuthProvider>
            <Header />
            <main className="w-full">{children}</main>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
