import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800">
          <nav className="container flex gap-4 py-3 text-sm">
            <Link href="/">Home</Link><Link href="/markets">Markets</Link><Link href="/portfolio">Portfolio</Link><Link href="/wallet">Wallet</Link><Link href="/skills">Skills</Link><Link href="/achievements">Achievements</Link><Link href="/admin">Admin</Link>
          </nav>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
