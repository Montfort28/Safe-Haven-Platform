import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight as ArrowRight,
  FaBookOpen as BookOpen,
  FaHeart as Heart,
  FaLeaf as Leaf,
  FaLock as LockKeyhole,
  FaPlay as Play,
  FaSeedling as Sprout,
} from 'react-icons/fa6';
import BrandLogo from '@/components/BrandLogo';

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

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" aria-label="Safe Haven home" className="home-brand">
            <BrandLogo className="h-[84px] w-[210px]" />
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
            Everyday wellbeing support
          </span>
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
            src="/images/Safe%20Haven_%20Feel%20Good%20Within%20(1).png"
            alt="A person taking a peaceful moment in a calm, plant-filled space"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 650px) 90vw, 48vw"
            className="home-manifest-image"
          />
          <div className="home-art-card">
            <span className="home-art-card-mark">
              <Sprout aria-hidden="true" size={19} />
            </span>
            <span className="home-art-card-kicker">Your wellbeing, your pace</span>
            <strong>Small moments of care can start here.</strong>
            <span className="home-art-card-rule" />
            <span className="home-art-card-caption">
              Check in. Reflect. Take a next step.
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

      <section id="contact" className="home-section home-closing">
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
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Link href="/" aria-label="Safe Haven home" className="footer-brand-link">
              <BrandLogo className="h-[80px] w-[200px]" />
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
