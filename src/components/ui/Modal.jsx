import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function lockBodyScroll(lock) {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (lock) {
    const scrollY = window.scrollY;
    body.dataset.scrollLockY = String(scrollY);
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  } else {
    const scrollY = Number(body.dataset.scrollLockY || 0);
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    delete body.dataset.scrollLockY;
    window.scrollTo(0, scrollY);
  }
}

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    lockBodyScroll(open);
    return () => lockBodyScroll(false);
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center md:items-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-accent bg-bg-mid shadow-elevated md:max-h-[min(88dvh,720px)] md:rounded-2xl"
            style={{ maxHeight: "min(92dvh, 100%)" }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-accent/60 px-4 py-3">
              <h2
                id="modal-title"
                className="pr-2 font-display text-lg font-bold text-white"
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
              className="overflow-y-auto overscroll-y-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
              style={{ maxHeight: "calc(92dvh - 3.25rem)" }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
