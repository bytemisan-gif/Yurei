import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Yurei — Advanced All-in-One Discord Bot & Security Platform',
  description:
    'Yurei is the next-generation multipurpose Discord bot featuring Anti-Nuke, Anti-Raid, Moderation, Automod, Tickets, Giveaways, Join-to-Create Voice, Music, and full Web Dashboard. Developed by Misan.',
  keywords: ['discord bot', 'yurei', 'misan', 'antinuke', 'antiraid', 'moderation', 'dashboard', 'zynrax alternative'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-gray-100 flex flex-col min-h-screen selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
