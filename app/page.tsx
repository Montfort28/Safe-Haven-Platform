import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight as ArrowRight,
  FaInstagram as Instagram,
  FaLock as LockKeyhole,
  FaPlay as Play,
  FaSeedling as Sprout,
} from 'react-icons/fa6';
import BrandLogo from '@/components/BrandLogo';
import HomeSignInButton from '@/components/HomeSignInButton';
import StaggeredMenu from '@/components/StaggeredMenu';
import BounceCards from '@/components/BounceCards';
import HomeFaq from '@/components/HomeFaq';
import HomeWave from '@/components/HomeWave';
import { ScrollStackItem } from '@/components/ScrollStack';

const mobileMenuItems = [
  { label: 'Home', link: '/' },
  { label: 'About', link: '#about' },
  { label: 'Services', link: '#services' },
  { label: 'FAQs', link: '#faq' },
  { label: 'Contact', link: '#contact' },
  { label: 'Sign in', link: '/login' },
];

const mobileMenuSocials = [
  { label: 'Instagram', link: 'https://www.instagram.com/safehaven.circle/' },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" aria-label="Safe Haven home" className="home-brand">
            <BrandLogo className="h-[76px] w-[190px]" withName />
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

          <div className="home-mobile-nav">
            <StaggeredMenu
              className="home-staggered-menu"
              items={mobileMenuItems}
              socialItems={mobileMenuSocials}
              colors={['#064734', '#FE7A25', '#006732', '#202B27']}
              menuButtonColor="#064734"
              openMenuButtonColor="#FE7A25"
              accentColor="#FE7A25"
              isFixed
            />
          </div>
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

        <div
          className="home-hero-art"
          aria-label="A calm space for your wellbeing"
        >
          <Image
            src="/images/new.png"
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
            <span className="home-art-card-kicker">
              Your wellbeing, your pace
            </span>
            <strong>Small moments of care can start here.</strong>
          </div>
        </div>
      </section>

      <section className="home-platforms" aria-label="Mental health platforms">
        <p className="home-platform-caption">
          You can also explore these other mental health platforms.
        </p>
        <ul className="home-platform-names" aria-label="Other wellbeing platforms">
          <li className="home-platform-name">BetterHelp</li>
          <li className="home-platform-name">Talkspace</li>
          <li className="home-platform-name">Headspace</li>
          <li className="home-platform-name">7 Cups</li>
        </ul>
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
            progress over time. It is designed as a welcoming starting point for
            wellbeing, not a diagnosis or a replacement for professional mental
            health care.
          </p>
          <Link href="/register" className="home-text-link">
            Create your account <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>

      <section id="services" className="home-section home-services">
        <HomeWave className="home-wave-services-top" color="#dce8d2" />
        <div className="home-services-heading">
          <div>
            <span className="home-section-label">What you can expect</span>
            <h2>
              Five ways to <span>get started.</span>
            </h2>
          </div>
          <p>
            Check in, reflect, breathe, play, or tend your Mind Garden. Explore
            one tool at a time and return whenever it suits you.
          </p>
        </div>
        <BounceCards
          className="home-tool-stack"
          containerHeight={660}
          spread={82}
          rotation={10}
          arc={12}
          pushDistance={160}
          hoverScale={1.04}
          bounciness={0.6}
          animationDelay={0.2}
          animationStagger={0.07}
          enableHover
        >
          <ScrollStackItem itemClassName="home-tool-card">
            <div className="home-tool-card__content" data-mark="01">
              <span className="home-tool-card__eyebrow">
                <span className="home-tool-card__number">01</span> Check in
              </span>
              <span className="home-tool-card__action" aria-hidden="true">
                <ArrowRight className="home-tool-card__arrow" />
              </span>
              <h3>Check in with your mood</h3>
              <p>
                Notice how you feel, name what is present, and make space for
                your emotions without judgment.
              </p>
            </div>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="home-tool-card home-tool-card--sage">
            <div className="home-tool-card__content" data-mark="02">
              <span className="home-tool-card__eyebrow">
                <span className="home-tool-card__number">02</span> Reflect
              </span>
              <span className="home-tool-card__action" aria-hidden="true">
                <ArrowRight className="home-tool-card__arrow" />
              </span>
              <h3>Make room for your thoughts</h3>
              <p>
                Use gentle journal prompts to reflect, practice gratitude, and
                keep track of the moments that matter to you.
              </p>
            </div>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="home-tool-card">
            <div className="home-tool-card__content" data-mark="03">
              <span className="home-tool-card__eyebrow">
                <span className="home-tool-card__number">03</span> Breathe
              </span>
              <span className="home-tool-card__action" aria-hidden="true">
                <ArrowRight className="home-tool-card__arrow" />
              </span>
              <h3>Pause and come back to now</h3>
              <p>
                Try a calming breathing activity and give yourself a moment to
                slow down and reset.
              </p>
            </div>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="home-tool-card home-tool-card--sage">
            <div className="home-tool-card__content" data-mark="04">
              <span className="home-tool-card__eyebrow">
                <span className="home-tool-card__number">04</span> Play
              </span>
              <span className="home-tool-card__action" aria-hidden="true">
                <ArrowRight className="home-tool-card__arrow" />
              </span>
              <h3>Explore wellbeing your way</h3>
              <p>
                Find approachable activities and games that make caring for
                yourself feel a little lighter.
              </p>
            </div>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="home-tool-card">
            <div className="home-tool-card__content" data-mark="05">
              <span className="home-tool-card__eyebrow">
                <span className="home-tool-card__number">05</span> Grow
              </span>
              <span className="home-tool-card__action" aria-hidden="true">
                <ArrowRight className="home-tool-card__arrow" />
              </span>
              <h3>Tend your Mind Garden</h3>
              <p>
                Build small, supportive habits and celebrate the progress you
                make, one day at a time.
              </p>
            </div>
          </ScrollStackItem>
        </BounceCards>
      </section>

      <HomeFaq />

      <section id="contact" className="home-section home-closing">
        <HomeWave className="home-wave-closing-top" color="#dce8d2" />
        <div className="home-closing-content">
          <div className="home-closing-copy">
            <div className="home-closing-mark">
              <LockKeyhole aria-hidden="true" size={19} />A gentle place to begin
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
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-wordmark" aria-hidden="true">
          Safe Haven
        </div>
        <div className="home-footer-inner">
          <div className="home-footer-links">
            <span>Safe Haven</span>
            <Link href="/">Home</Link>
            <a href="#about">About Safe Haven</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="home-footer-links">
            <span>Explore</span>
            <a href="#services">Wellbeing tools</a>
            <a href="#faq">Frequently asked questions</a>
            <Link href="/resources">Wellbeing resources</Link>
          </div>
          <div className="home-footer-links">
            <span>Get started</span>
            <Link href="/register">Create an account</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <div className="home-footer-connect">
            <span>Contact</span>
            <p>
              Follow along for gentle reminders and updates from Safe Haven.
            </p>
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
          <span>
            © {new Date().getFullYear()} Safe Haven. All rights reserved.
          </span>
          <span>Find your peace, at your pace.</span>
        </div>
      </footer>
    </main>
  );
}
