import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

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
        <Link href="/" aria-label="Safe Haven home">
          <BrandLogo className="h-12 w-[154px]" />
        </Link>
        <Link href="/">Back to home</Link>
      </header>

      <div className="auth-layout">
        <section className="auth-intro">
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
