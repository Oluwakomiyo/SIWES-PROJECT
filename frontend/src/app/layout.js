"use client"; // Add this at the top to use usePathname
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutDashboard, Image as ImageIcon, PlayCircle, PlusSquare } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {

  const pathname = usePathname();
  const isSlideshow = pathname === '/slideshow';
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/');
        if (res.ok) setIsOnline(true);
        else setIsOnline(false);
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex min-h-screen">
          {/* SIDEBAR */}
          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full border-r border-slate-800">
            <div className="p-6">
              <h2 className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
                <div className="w-10 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs">YOUR</div>
                MEDIA HUB
              </h2>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/" />
              <SidebarItem icon={<ImageIcon size={20} />} label="Project Gallery" href="/gallery" />
              <SidebarItem icon={<PlusSquare size={20} />} label="Add Project" href="/add-project" />
              <SidebarItem icon={<PlayCircle size={20} />} label="Slideshow" href="/slideshow" />
            </nav>

            <div className="p-6 border-t border-slate-800">
              <div className={`rounded-xl p-4 transition-colors ${isOnline ? 'bg-slate-800/50' : 'bg-red-900/20'}`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-bold ${isOnline ? 'text-white' : 'text-red-400'}`}>
                    {isOnline ? 'Server Active' : 'Server Offline'}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarItem({ icon, label, href }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group">
      <span className="text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}