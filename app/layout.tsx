import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="fade-page-transition">
          {children}
        </div>
      </body>
    </html>
  );
}
