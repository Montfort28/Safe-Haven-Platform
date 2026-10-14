import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Leaf,
  LockKeyhole,
  Play,
  Sprout,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const tools = [
  {
    icon: Heart,
    title: 'Understand your moods',
    description:
      'Notice patterns over time with a gentle mood check-in and thoughtful insights.',
    color: 'sage',
  },
  {
    icon: BookOpen,
    title: 'Make space to reflect',
    description:
      'Use guided journaling to untangle thoughts and capture the small things that matter.',
    color: 'orange',
  },
  {
    icon: Sprout,
    title: 'Grow at your own pace',
    description:
      'Build steady habits with calming exercises and a garden that grows with you.',
    color: 'light',
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" aria-label="Safe Haven home" className="home-brand">
            <BrandLogo className="h-[68px] w-[180px]" />
          </Link>

          <nav aria-label="Main navigation" className="home-nav">
            <Link href="/">Home</Link>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <Link href="/resources">Resources</Link>
            <a href="#contact">Contact</a>
          </nav>

          <Link href="/login" className="home-nav-cta">
            Sign in
            <span className="signin-icon" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <span className="home-eyebrow">
            <Leaf aria-hidden="true" size={15} />
            Mental wellness, your way
          </span>
          <h1 id="hero-title">
            A stronger mind
            <br />
            starts with
            <br />
            <span>feeling good within.</span>
          </h1>
          <p className="home-hero-description">
            Find more calm in everyday life with private check-ins, thoughtful
            reflection and gentle, science-informed tools for building habits
            that feel right for you.
          </p>

          <div className="home-hero-actions">
            <Link href="/register" className="home-button home-button-primary">
              Begin your journey
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <a href="#about" className="home-story-link">
              <span className="home-play">
                <Play aria-hidden="true" size={14} fill="currentColor" />
              </span>
              Discover Safe Haven
            </a>
          </div>

        </div>

        <div className="home-hero-art" aria-label="A calm space for your wellbeing">
          <Image
            src="/images/Safe%20Haven_%20Feel%20Good%20Within%20(1).png"
            alt="A person taking a peaceful moment in a calm, plant-filled space"
            fill
            priority
            sizes="(max-width: 650px) 90vw, 48vw"
            className="home-manifest-image"
          />
          <div className="home-art-card">
            <span className="home-art-card-mark">
              <Sprout aria-hidden="true" size={19} />
            </span>
            <span className="home-art-card-kicker">A gentle reminder</span>
            <strong>You deserve to feel good from within.</strong>
            <span className="home-art-card-rule" />
            <span className="home-art-card-caption">
              Small steps. Your pace. Your space.
            </span>
          </div>
        </div>
      </section>

      <section className="home-platforms" aria-label="Mental health platforms">
        <p className="home-platform-caption">
          You can also explore these other mental health platforms.
        </p>
        <div className="home-platform-logos" aria-label="BetterHelp, Talkspace, Headspace, and 7 Cups">
          <span className="home-platform-logo home-platform-betterhelp">
            <Image src="/images/BetterHelp.png" alt="" width={52} height={52} />
            <span>BetterHelp</span>
          </span>
          <span className="home-platform-logo home-platform-talkspace">
            <Image src="/images/talkspace.png" alt="" width={52} height={52} />
            <span>Talkspace</span>
          </span>
          <span className="home-platform-logo home-platform-headspace">
            <Image src="/images/Headspace.png" alt="" width={52} height={52} />
            <span>Headspace</span>
          </span>
          <span className="home-platform-logo home-platform-seven-cups">
            <Image src="/images/7%20cups.png" alt="" width={52} height={52} />
            <span>7 Cups</span>
          </span>
        </div>
      </section>

      <section id="about" className="home-section home-about">
        <div className="home-section-heading">
          <span className="home-section-label">A place to begin</span>
          <h2>
            Care that meets you
            <br />
            <span>where you are.</span>
          </h2>
        </div>
        <div className="home-about-copy">
          <p>
            Wellbeing isn’t one-size-fits-all. Safe Haven brings supportive
            everyday tools together in one private space, helping you check in
            with yourself and find what feels helpful.
          </p>
          <Link href="/register" className="home-text-link">
            Find your starting point <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>

      <section id="services" className="home-section home-services">
        <div className="home-services-heading">
          <div>
            <span className="home-section-label">Support for everyday life</span>
            <h2>Tools for your wellbeing.</h2>
          </div>
          <p>
            Thoughtful ways to reflect, reset and reconnect with what matters
            to you.
          </p>
        </div>
        <div className="home-tool-grid">
          {tools.map(({ icon: Icon, title, description, color }, index) => (
            <article className={`home-tool-card home-tool-${color}`} key={title}>
              <span className="home-tool-number">0{index + 1}</span>
              <span className="home-tool-icon">
                <Icon aria-hidden="true" size={24} strokeWidth={1.7} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link href="/register" aria-label={`Explore: ${title}`}>
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="home-section home-closing">
        <div className="home-closing-mark">
          <LockKeyhole aria-hidden="true" size={19} />
          A private space, just for you
        </div>
        <h2>
          Your next step can
          <br />
          <span>start right here.</span>
        </h2>
        <p>
          Begin with one small check-in. There’s no perfect pace and no need to
          have it all figured out.
        </p>
        <Link href="/register" className="home-button home-button-primary">
          Start with Safe Haven
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Link href="/" aria-label="Safe Haven home">
              <BrandLogo className="h-[60px] w-[162px]" />
            </Link>
            <p>A quieter space to reconnect with yourself.</p>
          </div>
          <div className="home-footer-links">
            <span>Explore</span>
            <Link href="/register">Create an account</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/login?next=%2Fresources">Wellbeing resources</Link>
          </div>
          <div className="home-footer-note">
            <span className="home-footer-note-mark">
              <LockKeyhole aria-hidden="true" size={17} />
            </span>
            <p>
              Your journey is personal.
              <br />
              Take it one step at a time.
            </p>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>Safe Haven</span>
          <span>Find your peace, at your pace.</span>
        </div>
      </footer>
    </main>
  );
}
