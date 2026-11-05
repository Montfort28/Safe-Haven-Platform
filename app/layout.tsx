import './globals.css';
import BlobCursor from '@/components/BlobCursor';
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
        <BlobCursor
          material="ink"
          color="#033B2C"
          size={28}
          morph={0.2}
          morphSpeed={0.25}
          trail={10}
          lag={0.32}
          goo={0.8}
          stretch={0.35}
          wobble={0.35}
          splash={false}
          hideCursor
        />
      </body>
    </html>
  );
}
