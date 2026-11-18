import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import FuzzyText from '@/components/FuzzyText';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <p className="not-found-kicker">Safe Haven</p>
        <div className="not-found-code">
          <FuzzyText
            className="not-found-fuzzy"
            color="#FE7A25"
            fontSize="clamp(8rem, 19vw, 14rem)"
            fontWeight={900}
            colorSplit={0}
            trigger="hover"
            direction="horizontal"
            baseIntensity={0.08}
            hoverIntensity={0.4}
            fuzzRange={22}
            sliceSize={1}
            fps={45}
            transitionDuration={8}
            intro
            introDuration={1200}
            enableHover
            clickEffect={false}
            glitchMode={false}
          >
            404
          </FuzzyText>
        </div>
        <h1 id="not-found-heading">We couldn't find that page</h1>
        <p>
          It may have moved, or the address might be mistyped. Let’s get you
          back to a safe place.
        </p>
        <Link className="not-found-home-link" href="/">
          Return home
          <FaArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </main>
  );
}
