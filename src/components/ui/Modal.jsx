import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    html.dataset.modalOpen = "1";
    body.dataset.modalOpen = "1";
    body.dataset.scrollLockY = String(scrollY);
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const blockBackgroundTouch = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundTouch, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockBackgroundTouch);
      delete html.dataset.modalOpen;
      delete body.dataset.modalOpen;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      const y = Number(body.dataset.scrollLockY || 0);
      delete body.dataset.scrollLockY;
      window.scrollTo(0, y);
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:items-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            ref={panelRef}
            className="relative z-10 flex w-[calc(100vw-1rem)] max-w-md flex-col overflow-hidden rounded-t-2xl border border-accent bg-bg-mid shadow-elevated md:w-full md:rounded-2xl"
            style={{ height: "min(90dvh, 100%)" }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-accent/60 px-4 py-3">
              <h2
                id="modal-title"
                className="min-w-0 flex-1 pr-2 font-display text-lg font-bold text-white"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-text-secondary hover:bg-bg-deepest hover:text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-scroll overscroll-y-contain px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
              style={{ touchAction: "pan-y" }}
            >
              <div className="min-w-0 max-w-full">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
