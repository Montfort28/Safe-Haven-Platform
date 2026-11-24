import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import LineWaves from '@/components/LineWaves';

type AuthLayoutProps = {
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export default function AuthLayout({
  title,
  description,
  panelTitle,
  panelDescription,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page min-h-screen">
      <header className="auth-header">
        <Link href="/" aria-label="Safe Haven home" className="auth-brand">
          <BrandLogo className="h-[76px] w-[190px]" withName />
        </Link>
        <Link href="/" className="auth-back-link">
          <span className="signin-icon auth-back-icon" aria-hidden="true" />
          Back to home
        </Link>
      </header>

      <div className="auth-layout">
        <section className="auth-intro">
          <LineWaves
            className="auth-intro-waves"
            color1="#ffffff"
            color2="#fff1df"
            color3="#ffffff"
            speed={0.2}
            lineCount={54}
            lineWidth={1.2}
            glow={0.55}
            highlight={0.8}
            warpIntensity={0.85}
            rotation={-33}
            enableMouseInteraction={false}
            clickRipple={false}
            intro={false}
            opacity={0.27}
          />
          <div className="auth-intro-copy">
            <span className="home-section-label">Safe Haven · Find your peace</span>
            <h1>
              {title}
              <span> at your pace.</span>
            </h1>
            <p>{description}</p>
          </div>
        </section>

        <section className="auth-panel" aria-labelledby="auth-panel-title">
          <h2 id="auth-panel-title">{panelTitle}</h2>
          <p className="auth-panel-intro">{panelDescription}</p>
          {children}
          <div className="auth-footnote">{footer}</div>
        </section>
      </div>
    </main>
  );
}
