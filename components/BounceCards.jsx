'use client';

import { Children, useEffect, useRef } from 'react';
import './BounceCards.css';

const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function BounceCards({
  children,
  className = '',
  containerHeight = 660,
  spread = 82,
  rotation = 10,
  arc = 12,
  pushDistance = 160,
  hoverScale = 1.04,
  bounciness = 0.6,
  animationDelay = 0.2,
  animationStagger = 0.07,
  enableHover = true,
}) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const settingsRef = useRef(null);
  const items = Children.toArray(children);
  settingsRef.current = {
    spread,
    rotation,
    arc,
    pushDistance,
    hoverScale: clamp(hoverScale, 0.5, 2),
    bounciness: clamp(bounciness, 0, 1),
    animationDelay: Math.max(0, animationDelay),
    animationStagger: Math.max(0, animationStagger),
    enableHover,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !items.length) return undefined;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = { hovered: -1, time: 0, visible: false, layer: -1, lastInput: 'pointer', touchStartedAt: 0 };
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const bodies = [];
    let slots = [];
    let frameId = 0;
    let last = performance.now();
    let alive = true;

    const createSlots = () => {
      const rootWidth = root.getBoundingClientRect().width;
      const firstCard = cardRefs.current[0];
      const cardWidth = firstCard?.offsetWidth ?? rootWidth * 0.68;
      const cardHeight = firstCard?.offsetHeight ?? cardWidth;
      const radians = (settingsRef.current.rotation * Math.PI) / 180;
      const visualWidth = Math.abs(Math.cos(radians)) * cardWidth + Math.abs(Math.sin(radians)) * cardHeight;
      const maxSpread = items.length > 1 ? Math.max(0, (rootWidth - visualWidth) / (items.length - 1)) : 0;
      const actualSpread =
        rootWidth <= 640
          ? Math.min(settingsRef.current.spread * 0.55, maxSpread + 12)
          : Math.min(settingsRef.current.spread, maxSpread);
      const middle = (items.length - 1) / 2;
      const reach = Math.max(1, middle);

      slots = items.map((_, index) => {
        const offset = index - middle;
        return {
          x: offset * actualSpread,
          y: settingsRef.current.arc * (offset / reach) ** 2,
          rotate: settingsRef.current.rotation * PATTERN[index % PATTERN.length],
        };
      });
    };

    const body = index => {
      if (!bodies[index]) {
        const slot = slots[index] ?? { x: 0, y: 0, rotate: 0 };
        bodies[index] = {
          x: slot.x,
          y: slot.y,
          rotate: slot.rotate,
          scale: 0,
          vx: 0,
          vy: 0,
          vr: 0,
          vs: 0,
        };
      }
      return bodies[index];
    };

    const step = (value, velocity, target, stiffness, damping, delta) => {
      const nextVelocity = velocity + ((target - value) * stiffness - velocity * damping) * delta;
      return [value + nextVelocity * delta, nextVelocity];
    };

    const schedule = () => {
      if (!frameId && alive && state.visible) {
        last = performance.now();
        frameId = requestAnimationFrame(animate);
      }
    };

    const animate = now => {
      frameId = 0;
      if (!alive || !state.visible) return;

      const settings = settingsRef.current;
      const delta = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      state.time += delta;

      const hovered = settings.enableHover ? state.hovered : -1;
      const popStiffness = 170;
      const popDamping = 2 * (1 - 0.85 * settings.bounciness) * Math.sqrt(popStiffness);
      const moveStiffness = 210;
      const moveDamping = 2 * (motion.matches ? 1 : 0.72) * Math.sqrt(moveStiffness);
      const substeps = Math.ceil(delta / (1 / 240));
      const subDelta = delta / substeps;
      let moving = 0;

      for (let index = 0; index < slots.length; index += 1) {
        const element = cardRefs.current[index];
        if (!element) continue;

        const card = body(index);
        const slot = slots[index];
        const appeared = motion.matches || state.time >= settings.animationDelay + index * settings.animationStagger;
        let targetX = slot.x;
        let targetY = slot.y;
        let targetRotate = slot.rotate;
        let targetScale = appeared ? 1 : 0;

        if (hovered >= 0 && appeared) {
          const responsivePushDistance = Math.min(
            settings.pushDistance * (motion.matches ? 0.85 : 1),
            root.clientWidth * 0.6,
          );
          if (index === hovered) {
            targetY -= motion.matches ? 4 : 14;
            targetRotate = motion.matches ? slot.rotate * 0.55 : 0;
            targetScale = motion.matches ? Math.min(settings.hoverScale, 1.015) : settings.hoverScale;
          } else {
            targetX += Math.sign(index - hovered) * responsivePushDistance;
          }
        }

        for (let substep = 0; substep < substeps; substep += 1) {
          [card.x, card.vx] = step(card.x, card.vx, targetX, moveStiffness, moveDamping, subDelta);
          [card.y, card.vy] = step(card.y, card.vy, targetY, moveStiffness, moveDamping, subDelta);
          [card.rotate, card.vr] = step(card.rotate, card.vr, targetRotate, moveStiffness, moveDamping, subDelta);
          if (motion.matches) {
            card.scale = targetScale;
            card.vs = 0;
          } else {
            [card.scale, card.vs] = step(card.scale, card.vs, targetScale, popStiffness, popDamping, subDelta);
          }
        }

        moving +=
          Math.abs(card.vx) +
          Math.abs(card.vy) +
          Math.abs(card.vr) +
          Math.abs(card.vs) * 100 +
          Math.abs(targetX - card.x) +
          Math.abs(targetY - card.y) +
          Math.abs(targetRotate - card.rotate) +
          Math.abs(targetScale - card.scale) * 100 +
          (appeared ? 0 : 1);

        element.style.transform = `translate(-50%, -50%) translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
      }

      if (state.layer !== hovered) {
        state.layer = hovered;
        cardRefs.current.forEach((element, index) => {
          if (!element) return;
          element.toggleAttribute('data-active', index === hovered);
        });
      }

      if (moving > 0.02) frameId = requestAnimationFrame(animate);
    };

    const activate = () => {
      if (state.visible) return;
      state.visible = true;
      state.time = 0;
      root.setAttribute('data-ready', '');
      createSlots();
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) activate();
    }, { threshold: 0.12 });
    const resizeObserver = new ResizeObserver(() => {
      createSlots();
      schedule();
    });

    const getCardIndexAtPoint = event => {
      const bounds = root.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left - bounds.width / 2;
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      slots.forEach((slot, index) => {
        const distance = Math.abs(pointerX - slot.x);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (state.hovered >= 0) {
        const currentDistance = Math.abs(pointerX - slots[state.hovered].x);
        const laneGap = slots.length > 1 ? Math.abs(slots[1].x - slots[0].x) : 0;
        const hysteresis = Math.min(12, Math.max(3, laneGap * 0.18));
        if (currentDistance <= nearestDistance + hysteresis) return state.hovered;
      }

      return nearestIndex;
    };

    const onPointerMove = event => {
      if (!canHover || event.pointerType === 'touch') return;
      const next = getCardIndexAtPoint(event);
      if (next !== state.hovered) {
        state.lastInput = 'pointer';
        state.hovered = next;
        schedule();
      }
    };

    const onPointerDown = event => {
      if (event.pointerType === 'touch' || !canHover) {
        state.lastInput = 'touch';
        state.touchStartedAt = performance.now();
        state.hovered = ((state.hovered < 0 ? 0 : state.hovered) + 1) % slots.length;
      } else {
        state.lastInput = 'pointer';
        state.hovered = getCardIndexAtPoint(event);
      }
      schedule();
    };

    const onPointerLeave = () => {
      if (!canHover || state.lastInput === 'touch') return;
      if (state.hovered !== -1) {
        state.hovered = -1;
        schedule();
      }
    };

    const onFocusIn = event => {
      if (performance.now() - state.touchStartedAt < 500) return;
      state.lastInput = 'keyboard';
      const card = event.target instanceof Element ? event.target.closest('.bounce-cards__card') : null;
      const next = card ? cardRefs.current.indexOf(card) : -1;
      if (next >= 0) {
        state.hovered = next;
        schedule();
      }
    };

    const onFocusOut = event => {
      if (performance.now() - state.touchStartedAt < 500) return;
      if (event.relatedTarget && root.contains(event.relatedTarget)) return;
      state.hovered = -1;
      schedule();
    };

    const onResize = () => {
      createSlots();
      schedule();
    };

    observer.observe(root);
    resizeObserver.observe(root);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    window.addEventListener('resize', onResize);
    motion.addEventListener('change', schedule);
    createSlots();

    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('resize', onResize);
      motion.removeEventListener('change', schedule);
    };
  }, [items.length]);

  return (
    <div
      ref={rootRef}
      className={`bounce-cards${className ? ` ${className}` : ''}`}
      style={{ '--bounce-cards-height': `${containerHeight}px` }}
    >
      {items.map((item, index) => (
        <div
          key={item.key ?? index}
          ref={element => {
            cardRefs.current[index] = element;
          }}
          className="bounce-cards__card"
          style={{ '--bounce-card-index': index, zIndex: items.length - index }}
          role="group"
          aria-label={`Wellbeing idea ${index + 1}`}
          tabIndex={0}
        >
          {item}
        </div>
      ))}
    </div>
  );
}