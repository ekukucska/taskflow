import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar/Sidebar";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task manager for distributed teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
