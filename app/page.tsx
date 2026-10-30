import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight as ArrowRight,
  FaBookOpen as BookOpen,
  FaHeart as Heart,
  FaInstagram as Instagram,
  FaLock as LockKeyhole,
  FaPlay as Play,
  FaSeedling as Sprout,
} from 'react-icons/fa6';
import BrandLogo from '@/components/BrandLogo';
import HomeSignInButton from '@/components/HomeSignInButton';
import HomeMobileNav from '@/components/HomeMobileNav';
import HomeFaq from '@/components/HomeFaq';
import HomeWave from '@/components/HomeWave';

const tools = [
  {
    icon: Heart,
    title: 'Check in with your mood',
    description:
      'Record how you feel, add context like sleep or activities, and review mood patterns over time.',
    color: 'sage',
  },
  {
    icon: BookOpen,
    title: 'Reflect in your journal',
    description:
      'Write about what is on your mind, respond to reflection prompts, and keep track of moments of gratitude.',
    color: 'orange',
  },
  {
    icon: Sprout,
    title: 'Build gentle wellbeing habits',
    description:
      'Try breathing exercises, calming games, and Mind Garden activities in small steps that fit your day.',
    color: 'light',
  },
];

const platformDividerPath =
  'M0 0v47.6l5-2c1 0 11 3 12 0 2 3 6-3 6 0 0-4 12 3 12 0 0 3 15-1 17 0 2-2 5-1 6 0 0-2 6 2 6 0s2 4 4 0c5 2 12-3 16 0 2-2 4-3 4 0 0 2 6-1 6 0 1 4 15-2 17 0h7c0 1 3-3 6 0h17c2 2 3 1 6 0h6c1-2 21-1 24 0 2 1 4 2 6 0 0-1 22 4 24 0 0 0 5-3 5 0 2-2 10 2 12 0 2 2 6 1 6 0 2 3 4-2 6 0 1 0 25-2 25 1l10-1c3 1 6 6 7 0 1 5 4-2 6 0 2-2 4 3 5 0h12c6 1 36 2 36 0 0 2 3 0 6 0h6c5-2 7 4 11 0 2 0 15 2 17 0h13c3-4 5 1 7 0h29c0-3 6 0 6 0h5c0 2 16-1 18 0 1 4 9-1 12 0s6-2 6 0c8-2 3 4 13 0h10c3 4 19 1 19 0 2 0 21 1 23-1 1 4 3-1 6 1 1 2 11-1 12-1 3 3 9 0 12 1 3-4 6 1 6 0h6c0-3 5 1 6-1 0 3 2 1 4 1 3 4 10-1 13 0 3-2 6-1 6 0 2 2 2 0 6 0 1-2 6 2 6 0 2 0 4 5 6 0h18c2 3 4 1 6 0l6-1c3 2 12 3 17 1 14 3 18 1 24 0 2-1 3 3 5 0 6 2 10-1 16 0 1 3 6 0 9 0 0-2 3 2 5 0 6-6 8 7 13 0 0-2 5 2 5 0 3 3 10 0 10 0 1 2 5-2 8 0 3-1 8 3 12 0h6c2 1 10 4 12 0h6c1-1 5 2 6 0 1 2 4-1 6 0 0-2 5 3 6-1 2 1 6 5 5 1 1 1 3-2 6 0 2-1 5 3 6 0 0 1 6 2 6 0 2 3 4-4 6 0 0-2 3 2 6 0 3 0 6 3 6 0 5 3 8-1 13 0 3-4 6 1 6 0h5c0-1 9 2 12 0 1-1 9 3 11 0h6c2 2 4 4 7 0 3 2 5-4 5-1 10 4 15-2 18 2 0-1 6 2 6-2 0 0 6-2 6 1 1 6 12 2 12 0 1 3 4-3 7 2 2-2 5 2 5 0 1 5 4-5 6 0 2-1 4 2 6 0 1 3 1 0 5 0V0H0Z';

function PlatformDivider({ className, fill }: { className: string; fill: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={platformDividerPath} fill={fill} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" aria-label="Safe Haven home" className="home-brand">
            <BrandLogo className="h-[96px] w-[240px]" />
          </Link>

          <nav aria-label="Main navigation" className="home-nav">
            <Link href="/">Home</Link>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#faq">FAQs</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="home-header-actions">
            <a
              className="home-instagram-link"
              href="https://www.instagram.com/safehaven.circle/"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Safe Haven on Instagram"
            >
              <Instagram aria-hidden="true" size={19} />
            </a>
            <HomeSignInButton />
          </div>

          <HomeMobileNav />
        </div>
      </header>

      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <h1 id="hero-title">
            A welcoming space
            <br />
            to check in,
            <br />
            <span>reflect, and reset.</span>
          </h1>
          <p className="home-hero-description">
            Safe Haven brings mood check-ins, journaling, breathing exercises,
            wellbeing games, and a growing Mind Garden together in one place.
            Explore at your own pace and choose what feels useful today.
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
              What you can do here
            </a>
          </div>
        </div>

        <div className="home-hero-art" aria-label="A calm space for your wellbeing">
          <Image
            src="/images/upscaler.png"
            alt="Black-and-white portrait artwork with fine cracks across the face"
            fill
            loading="eager"
            fetchPriority="high"
            quality={100}
            sizes="(max-width: 650px) 90vw, (max-width: 1200px) 48vw, 600px"
            className="home-manifest-image"
          />
          <div className="home-art-card">
            <span className="home-art-card-mark">
              <Sprout aria-hidden="true" size={19} />
            </span>
            <span className="home-art-card-kicker">Your wellbeing, your pace</span>
            <strong>Small moments of care can start here.</strong>
          </div>
        </div>
      </section>

      <section className="home-platforms" aria-label="Mental health platforms">
        <PlatformDivider
          className="home-platforms-divider home-platforms-top-divider"
          fill="var(--brand-cream)"
        />
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
        <PlatformDivider
          className="home-platforms-divider home-platforms-bottom-divider"
          fill="#f3eedc"
        />
      </section>

      <section id="about" className="home-section home-about">
        <div className="home-section-heading">
          <span className="home-section-label">About Safe Haven</span>
          <h2>
            Wellbeing support,
            <br />
            <span>all in one place.</span>
          </h2>
        </div>
        <div className="home-about-copy">
          <p>
            Safe Haven is a digital wellbeing platform for everyday reflection
            and self-care. It gives you a place to record how you feel, write
            down your thoughts, try calming activities, and notice your own
            progress over time. It is designed as a welcoming starting point
            for wellbeing—not a diagnosis or a replacement for professional
            mental health care.
          </p>
          <Link href="/register" className="home-text-link">
            Create your account <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>

      <section id="services" className="home-section home-services">
        <HomeWave
          className="home-wave-services-top"
          color="#dce8d2"
        />
        <div className="home-services-heading">
          <div>
            <span className="home-section-label">What you can expect</span>
            <h2>Three ways to get started.</h2>
          </div>
          <p>
            Start with a mood check-in, make time to write, or try a calming
            activity. You can use one tool at a time and return whenever it
            suits you.
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

      <HomeFaq />

      <section id="contact" className="home-section home-closing">
        <HomeWave
          className="home-wave-closing-top"
          color="#dce8d2"
        />
        <div className="home-closing-mark">
          <LockKeyhole aria-hidden="true" size={19} />
          A gentle place to begin
        </div>
        <h2>
          Take a moment for
          <br />
          <span>your wellbeing.</span>
        </h2>
        <p>
          Create an account to explore mood tracking, journaling, wellbeing
          games, breathing activities, and your Mind Garden.
        </p>
        <Link href="/register" className="home-button home-button-primary">
          Explore Safe Haven
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <footer className="home-footer">
        <div className="home-footer-wordmark" aria-label="Safe Haven">Safe Haven</div>
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Link href="/" aria-label="Safe Haven home" className="footer-brand-link">
              <BrandLogo className="h-[96px] w-[240px]" />
            </Link>
            <p>
              A welcoming space for mood check-ins, journaling, breathing
              activities, and small steps toward everyday wellbeing.
            </p>
          </div>
          <div className="home-footer-links">
            <span>Explore</span>
            <a href="#about">About Safe Haven</a>
            <a href="#services">Wellbeing tools</a>
            <a href="#faq">Frequently asked questions</a>
          </div>
          <div className="home-footer-links">
            <span>Get started</span>
            <Link href="/register">Create an account</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/resources">Wellbeing resources</Link>
          </div>
          <div className="home-footer-connect">
            <span>Stay connected</span>
            <p>Follow along for gentle reminders and updates from Safe Haven.</p>
            <a
              className="home-footer-instagram"
              href="https://www.instagram.com/safehaven.circle/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram aria-hidden="true" size={18} />
              Follow us on Instagram
            </a>
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
