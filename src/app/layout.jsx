import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "NexGear — Gaming Gear Sales",
  description: "Gaming gear sales management system built with Next.js + MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen pt-16 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
