import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Control de Obras",
  description:
    "Sistema para administrar obras, contratistas, contratos, cobros y pagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <Sidebar />

        <div className="min-h-screen lg:pl-64">
          <Header />

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}