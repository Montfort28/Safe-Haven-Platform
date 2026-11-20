import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight as ArrowRight,
  FaLock as LockKeyhole,
  FaPlay as Play,
  FaSeedling as Sprout,
} from 'react-icons/fa6';
import {
  FaInstagram,
  FaLinkedinIn as LinkedIn,
} from 'react-icons/fa6';
import { FaTwitter as Twitter } from 'react-icons/fa';
import BrandLogo from '@/components/BrandLogo';
import FoldText from '@/components/FoldText';
import HeroRotatingWord from '@/components/HeroRotatingWord';
import HomeSignInButton from '@/components/HomeSignInButton';
import StaggeredMenu from '@/components/StaggeredMenu';
import BounceCards from '@/components/BounceCards';
import HomeFaq from '@/components/HomeFaq';
import HomeLandingReveal from '../components/HomeLandingReveal';
import HomeScrollEffects from '@/components/HomeScrollEffects';
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
  { label: 'LinkedIn', link: 'https://www.linkedin.com/' },
  { label: 'Twitter', link: 'https://twitter.com/' },
];

const heroFoldMotion = {
  trigger: 'landing',
  foldStyle: 'paper',
  hinge: 'top',
  duration: 0.85,
  staggerFrom: 'start',
  foldAngle: 88,
  perspective: 700,
  creaseShading: 0.35,
  ease: 'power3.out',
} as const;

export default function HomePage() {
  return (
    <main className="home-page">
      <HomeScrollEffects />
      <HomeLandingReveal />
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" aria-label="Safe Haven home" className="home-brand">
            <BrandLogo className="home-header-logo" />
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
              className="home-social-link"
              href="https://www.instagram.com/safehaven.circle/"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Safe Haven on Instagram"
            >
              <FaInstagram aria-hidden="true" size={19} />
            </a>
            <a
              className="home-social-link"
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Safe Haven on LinkedIn"
            >
              <LinkedIn aria-hidden="true" size={19} />
            </a>
            <a
              className="home-social-link"
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Safe Haven on Twitter"
            >
              <Twitter aria-hidden="true" size={19} />
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
            <FoldText
              {...heroFoldMotion}
              className="home-hero-fold-title"
              text={'A welcoming space\nto check in,'}
              splitBy="char"
              stagger={0.045}
              fontSize="clamp(3.05rem, 4.7vw, 4.45rem)"
              fontWeight={700}
              color="#064734"
            />
            <FoldText
              {...heroFoldMotion}
              className="home-hero-fold-title home-hero-fold-title-accent"
              text="reflect, and"
              splitBy="char"
              stagger={0.045}
              fontSize="clamp(3.05rem, 4.7vw, 4.45rem)"
              fontWeight={700}
              color="#25332D"
            />
            <HeroRotatingWord />
          </h1>
          <p className="home-hero-description">
            <FoldText
              {...heroFoldMotion}
              className="home-hero-fold-copy"
              text="Safe Haven brings mood check-ins, journaling, and calming activities together in one place. Explore at your own pace and choose what feels useful today."
              splitBy="word"
              duration={0.65}
              stagger={0.04}
              fontSize="inherit"
              fontWeight="inherit"
              color="inherit"
            />
          </p>

          <div className="home-hero-actions">
            <Link href="/register" className="home-button home-button-primary">
              <FoldText
                {...heroFoldMotion}
                className="home-hero-button-fold"
                text="Begin your journey"
                splitBy="word"
                duration={0.65}
                stagger={0.055}
                fontSize="inherit"
                fontWeight="inherit"
                color="inherit"
              />
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <a href="#about" className="home-story-link">
              <span className="home-play">
                <Play aria-hidden="true" size={14} fill="currentColor" />
              </span>
              <FoldText
                {...heroFoldMotion}
                className="home-hero-button-fold"
                text="What you can do here"
                splitBy="word"
                duration={0.65}
                stagger={0.055}
                fontSize="inherit"
                fontWeight="inherit"
                color="inherit"
              />
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
            data-home-parallax="0.14"
          />
          <div className="home-art-card" data-home-parallax="-0.1">
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
        <p className="home-platform-disclaimer">
          <strong>
            Independent platforms offering additional mental health and wellbeing
            resources. Not affiliated with Safe Haven.
          </strong>
        </p>
        <ul className="home-platform-names" aria-label="Other wellbeing platforms">
          <li className="home-platform-name">BetterHelp</li>
          <li className="home-platform-name">Talkspace</li>
          <li className="home-platform-name">Headspace</li>
          <li className="home-platform-name">7 Cups</li>
        </ul>
      </section>

      <section id="about" className="home-section home-about" data-home-parallax="0.07">
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

      <section id="services" className="home-section home-services" data-home-parallax="0.06">
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
          spread={85}
          rotation={10}
          arc={0}
          pushDistance={470}
          hoverScale={1.06}
          bounciness={0.6}
          animationDelay={0.5}
          animationStagger={0.06}
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

      <section id="contact" className="home-section home-closing" data-home-parallax="0.06">
        <HomeWave className="home-wave-closing-top" color="#dce8d2" />
        <div className="home-closing-content">
          <div className="home-closing-art" aria-hidden="true">
            <Image
              src="/images/CTA 9.png"
              alt=""
              fill
              sizes="(max-width: 850px) 90vw, 52vw"
              className="home-closing-image"
            />
          </div>
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
              <FaInstagram aria-hidden="true" size={18} />
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
