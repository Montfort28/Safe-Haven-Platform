import './globals.css';
import EmergencySupport from '@/components/EmergencySupport';
import SoundPlayer from '@/components/SoundPlayer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="fade-page-transition">
          {children}
          <SoundPlayer src="/sounds/ambient-rain.mp3" loop />
        </div>
      </body>
    </html>
  );
}
