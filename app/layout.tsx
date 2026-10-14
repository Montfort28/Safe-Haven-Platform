import './globals.css';
import EmergencySupport from '@/components/EmergencySupport';
import MemberTheme from '@/components/MemberTheme';
import SoundPlayer from '@/components/SoundPlayer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="fade-page-transition">
          <MemberTheme>{children}</MemberTheme>
          <SoundPlayer src="/sounds/ambient-rain.mp3" loop />
        </div>
      </body>
    </html>
  );
}
