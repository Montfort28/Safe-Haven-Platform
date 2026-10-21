'use client';

import { useEffect, useRef, useState } from 'react';
import type { GardenCondition, GardenStageId } from '@/lib/mindGardenGrowth';

interface GardenTreeProps {
  stage: GardenStageId;
  condition: GardenCondition;
}

const foliage = ['#496b43', '#5d7c4d', '#718d59', '#849765'];

function FoliageCluster({
  cx,
  cy,
  rx,
  ry,
  shade,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  shade: number;
}) {
  const color = foliage[shade % foliage.length];

  return (
    <g>
      <ellipse cx={cx} cy={cy + 3} rx={rx} ry={ry} fill="#35553a" opacity="0.14" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />
      <ellipse
        cx={cx - rx * 0.16}
        cy={cy - ry * 0.2}
        rx={rx * 0.63}
        ry={ry * 0.62}
        fill={foliage[(shade + 1) % foliage.length]}
      />
      <path
        d={`M${cx - rx * 0.58} ${cy + ry * 0.26} Q${cx} ${cy + ry * 0.58} ${cx + rx * 0.58} ${cy + ry * 0.22}`}
        fill="none"
        stroke="#36553b"
        strokeOpacity=".28"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function TreeArtwork({ stage }: { stage: GardenStageId }) {
  return (
    <svg
      className="garden-tree-artwork"
      viewBox="0 0 480 560"
      role="img"
      aria-label={`${stage} tree`}
      focusable="false"
    >
      <defs>
        <linearGradient id={`bark-${stage}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#65442f" />
          <stop offset=".34" stopColor="#936743" />
          <stop offset=".66" stopColor="#a77a50" />
          <stop offset="1" stopColor="#62432f" />
        </linearGradient>
        <filter id={`tree-shadow-${stage}`} x="-40%" y="-20%" width="180%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <ellipse
        cx="240"
        cy="526"
        rx={stage === 'seedling' ? 30 : stage === 'growing' ? 72 : 125}
        ry="12"
        fill="#34452e"
        opacity=".2"
        filter={`url(#tree-shadow-${stage})`}
      />

      {stage !== 'seedling' && (
        <g fill="none" stroke={`url(#bark-${stage})`} strokeLinecap="round" strokeLinejoin="round">
          {stage === 'growing' && (
            <>
              <path d="M238 520 C235 469 244 416 240 356 C239 339 241 321 242 302" strokeWidth="17" />
              <path d="M240 402 C219 379 200 358 179 335" strokeWidth="8" />
              <path d="M241 377 C263 356 284 337 302 311" strokeWidth="8" />
              <path d="M242 345 C227 328 218 312 214 293" strokeWidth="6" />
            </>
          )}
          {stage === 'flourishing' && (
            <>
              <path d="M236 520 C231 463 248 403 239 345 C235 306 244 269 241 225" strokeWidth="25" />
              <path d="M240 414 C209 388 184 355 150 327" strokeWidth="11" />
              <path d="M241 391 C272 365 302 333 331 296" strokeWidth="11" />
              <path d="M239 352 C207 331 189 299 174 267" strokeWidth="9" />
              <path d="M242 321 C271 301 289 273 302 242" strokeWidth="9" />
              <path d="M241 278 C226 260 218 240 215 218" strokeWidth="7" />
            </>
          )}
          {stage === 'thriving' && (
            <>
              <path d="M235 520 C227 457 251 397 239 337 C232 294 247 249 238 196 C234 169 241 145 241 118" strokeWidth="32" />
              <path d="M240 425 C202 399 174 361 131 329" strokeWidth="13" />
              <path d="M241 411 C280 380 317 342 353 295" strokeWidth="13" />
              <path d="M239 369 C196 344 170 304 147 264" strokeWidth="11" />
              <path d="M242 342 C284 315 312 276 329 231" strokeWidth="11" />
              <path d="M238 299 C203 277 186 240 174 203" strokeWidth="9" />
              <path d="M241 269 C274 246 292 210 301 177" strokeWidth="9" />
              <path d="M240 216 C224 194 216 170 216 145" strokeWidth="7" />
              <path d="M241 189 C258 168 267 144 269 121" strokeWidth="7" />
            </>
          )}
        </g>
      )}

      {stage === 'seedling' && (
        <g>
          <path
            d="M240 520 C235 486 244 453 240 423"
            fill="none"
            stroke={`url(#bark-${stage})`}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path d="M239 488 C222 474 212 461 208 445 M241 481 C258 469 267 455 271 440" fill="none" stroke={`url(#bark-${stage})`} strokeWidth="5" strokeLinecap="round" />
          <ellipse className="garden-canopy" cx="207" cy="442" rx="22" ry="12" fill={foliage[1]} transform="rotate(28 207 442)" />
          <ellipse className="garden-canopy" cx="274" cy="437" rx="23" ry="12" fill={foliage[2]} transform="rotate(-29 274 437)" />
          <ellipse className="garden-canopy" cx="240" cy="418" rx="17" ry="26" fill={foliage[0]} transform="rotate(-8 240 418)" />
        </g>
      )}

      {stage === 'growing' && (
        <g className="garden-canopy">
          <FoliageCluster cx={173} cy={329} rx={37} ry={29} shade={1} />
          <FoliageCluster cx={306} cy={304} rx={39} ry={31} shade={2} />
          <FoliageCluster cx={211} cy={287} rx={34} ry={28} shade={0} />
          <FoliageCluster cx={253} cy={271} rx={43} ry={34} shade={1} />
          <FoliageCluster cx={239} cy={308} rx={36} ry={32} shade={3} />
        </g>
      )}

      {stage === 'flourishing' && (
        <g className="garden-canopy">
          <FoliageCluster cx={146} cy={322} rx={51} ry={39} shade={1} />
          <FoliageCluster cx={337} cy={290} rx={51} ry={40} shade={2} />
          <FoliageCluster cx={169} cy={257} rx={48} ry={38} shade={0} />
          <FoliageCluster cx={309} cy={230} rx={49} ry={38} shade={1} />
          <FoliageCluster cx={213} cy={216} rx={47} ry={37} shade={2} />
          <FoliageCluster cx={266} cy={190} rx={52} ry={42} shade={3} />
          <FoliageCluster cx={239} cy={267} rx={56} ry={42} shade={0} />
        </g>
      )}

      {stage === 'thriving' && (
        <g className="garden-canopy">
          <FoliageCluster cx={126} cy={324} rx={57} ry={44} shade={1} />
          <FoliageCluster cx={357} cy={290} rx={59} ry={45} shade={2} />
          <FoliageCluster cx={145} cy={259} rx={57} ry={43} shade={0} />
          <FoliageCluster cx={331} cy={227} rx={56} ry={43} shade={1} />
          <FoliageCluster cx={172} cy={199} rx={52} ry={41} shade={2} />
          <FoliageCluster cx={300} cy={169} rx={55} ry={43} shade={0} />
          <FoliageCluster cx={215} cy={142} rx={49} ry={39} shade={1} />
          <FoliageCluster cx={265} cy={117} rx={53} ry={42} shade={3} />
          <FoliageCluster cx={241} cy={235} rx={61} ry={47} shade={0} />
          <FoliageCluster cx={232} cy={181} rx={55} ry={45} shade={2} />
          <FoliageCluster cx={240} cy={291} rx={58} ry={45} shade={3} />
          <circle cx="178" cy="202" r="4" fill="#e3c783" />
          <circle cx="321" cy="231" r="4" fill="#e3c783" />
          <circle cx="269" cy="123" r="4" fill="#e3c783" />
        </g>
      )}

      <g fill="none" stroke="#79563b" strokeLinecap="round" opacity=".8">
        <path d="M239 521 C214 524 201 530 188 538" strokeWidth="5" />
        <path d="M242 521 C265 524 280 531 293 539" strokeWidth="5" />
        {stage !== 'seedling' && (
          <>
            <path d="M238 518 C228 526 221 532 216 540" strokeWidth="3" />
            <path d="M245 518 C253 527 260 533 265 540" strokeWidth="3" />
          </>
        )}
      </g>
    </svg>
  );
}

function GardenButterfly({ resting }: { resting: boolean }) {
  return (
    <div className={`garden-butterfly-flight${resting ? ' is-resting' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 40 36" className="garden-butterfly">
        <g className="garden-butterfly-wings">
          <path d="M19 17C12 3 2 3 3 12c.5 5 7 7 15 7Z" fill="#c88967" stroke="#755b48" strokeWidth="1" />
          <path d="M21 17C28 3 38 3 37 12c-.5 5-7 7-15 7Z" fill="#dca17b" stroke="#755b48" strokeWidth="1" />
          <path d="M19 19C12 18 8 24 12 29c3 3 7 0 8-8ZM21 19c7-1 11 5 7 10-3 3-7 0-8-8Z" fill="#dfb28a" stroke="#755b48" strokeWidth="1" />
        </g>
        <path d="M20 15v12M20 16l-4-5m4 5 4-5" stroke="#594c3d" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function GardenTree({ stage, condition }: GardenTreeProps) {
  const [currentStage, setCurrentStage] = useState(stage);
  const [outgoingStage, setOutgoingStage] = useState<GardenStageId | null>(null);
  const [transitionStarted, setTransitionStarted] = useState(false);
  const currentStageRef = useRef(stage);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (stage === currentStageRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    setOutgoingStage(currentStageRef.current);
    setCurrentStage(stage);
    currentStageRef.current = stage;
    setTransitionStarted(false);
    frameRef.current = requestAnimationFrame(() => setTransitionStarted(true));
    timeoutRef.current = setTimeout(() => {
      setOutgoingStage(null);
      setTransitionStarted(false);
      timeoutRef.current = null;
    }, 950);
  }, [stage]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className={`garden-tree-stage is-${condition}`} aria-hidden="true">
      {outgoingStage && (
        <div className={`garden-tree-layer is-outgoing${transitionStarted ? ' is-fading' : ''}`}>
          <TreeArtwork stage={outgoingStage} />
        </div>
      )}
      <div className={`garden-tree-layer is-current${!outgoingStage || transitionStarted ? ' is-visible' : ''}`}>
        <TreeArtwork stage={currentStage} />
      </div>
      <GardenButterfly resting={condition === 'resting'} />
    </div>
  );
}
