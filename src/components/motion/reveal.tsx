"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fades and slides content in the first time it scrolls into view.
 *
 * The content is VISIBLE by default, in the server HTML and until scripts run,
 * so it can never get stuck invisible if JavaScript fails to load. After
 * hydration, only elements that are still below the fold are hidden, then
 * revealed by an IntersectionObserver. The look lives in globals.css
 * (`[data-reveal]`).
 *
 * `animateOnMount` also plays the animation for content that is already on
 * screen when it mounts
 */
export function Reveal({
  children,
  delay = 0,
  from = "translateY(24px)",
  origin,
  animateOnMount = false,
  className,
}: {
  children: ReactNode;
  /** Seconds to wait before the animation starts */
  delay?: number;
  /** CSS transform the element animates from */
  from?: string;
  /** CSS transform-origin, e.g. "0 50%" to grow a bar from its left edge */
  origin?: string;
  animateOnMount?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const show = () => {
      el.dataset.reveal = "shown";
    };
    const onScreen = el.getBoundingClientRect().top < window.innerHeight - 80;

    if (onScreen && !animateOnMount) return;

    el.dataset.reveal = "hidden";

    if (onScreen) {
      // Two frames, so the browser paints the hidden state before we animate out of it
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(show);
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
        show();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      show();
    };
  }, [animateOnMount]);

  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-from": from,
    ...(origin ? { "--reveal-origin": origin } : null),
  } as CSSProperties;

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
