'use client';

import { useEffect } from 'react';

type LockedBodyStyles = {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
  htmlOverflow: string;
  scrollY: number;
};

const MODAL_SELECTOR = '[data-modal-lock="true"]';

export default function ModalScrollLock() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    let lockedStyles: LockedBodyStyles | null = null;

    const lockScroll = () => {
      if (lockedStyles) return;

      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      lockedStyles = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
        htmlOverflow: html.style.overflow,
        scrollY,
      };

      html.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const unlockScroll = () => {
      if (!lockedStyles) return;

      const previous = lockedStyles;
      lockedStyles = null;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      html.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, previous.scrollY);
    };

    const syncScrollLock = () => {
      if (body.querySelector(MODAL_SELECTOR)) lockScroll();
      else unlockScroll();
    };

    const observer = new MutationObserver(syncScrollLock);
    observer.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-modal-lock'],
    });
    syncScrollLock();

    return () => {
      observer.disconnect();
      unlockScroll();
    };
  }, []);

  return null;
}
