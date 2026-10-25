"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Right-hand panel on desktop, bottom sheet on mobile.
 *
 * Built on the native <dialog> element, which gives us for free:
 *  - a focus trap and returning focus to the trigger on close
 *  - Esc to close, and an inert page behind the panel
 * The slide animations live in globals.css (.drawer-panel).
 *
 * `open` is controlled by the parent. Closing plays the exit animation first,
 * so the parent should keep the content mounted until it finishes.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (dialog.open) {
      // Start the exit animation; onAnimationEnd finishes the close
      dialog.setAttribute("data-closing", "");
    }
  }, [open]);

  // Never leave the page scroll-locked if the drawer unmounts while open
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function finishClose() {
    const dialog = dialogRef.current;
    if (!dialog?.hasAttribute("data-closing")) return;
    dialog.close();
    dialog.removeAttribute("data-closing");
    document.body.style.overflow = "";
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // A click on the dialog itself (not the panel) is a click on the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onAnimationEnd={(e) => {
        if (e.target === panelRef.current) finishClose();
      }}
      className="drawer fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-fg"
    >
      <div
        ref={panelRef}
        className={[
          "drawer-panel fixed inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-surface",
          "md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-110 md:rounded-none md:rounded-l-3xl",
        ].join(" ")}
      >
        {/* Grab handle: a visual cue that the sheet can be dismissed (mobile only) */}
        <div
          aria-hidden
          className="mx-auto mt-3 h-1 w-10 rounded-full bg-hover md:hidden"
        />

        <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-4 sm:px-6 md:pt-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p className="num mt-0.5 text-xs text-faint">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <X aria-hidden className="size-5" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 pb-8 sm:px-6">{children}</div>
      </div>
    </dialog>
  );
}
