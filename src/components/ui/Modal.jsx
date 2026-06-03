import { useEffect } from "react";
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
    body.style.touchAction = "none";
  } else {
    const scrollY = Number(body.dataset.scrollLockY || 0);
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    body.style.touchAction = "";
    delete body.dataset.scrollLockY;
    window.scrollTo(0, scrollY);
  }
}

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    lockBodyScroll(open);
    return () => lockBodyScroll(false);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-end md:items-center md:justify-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-black/70 touch-none"
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden
          />
          <motion.div
            className="card-elevated relative z-10 flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-accent md:max-h-[min(88dvh,720px)] md:rounded-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-accent/60 px-4 py-3">
              <h2
                id="modal-title"
                className="font-display text-lg font-bold text-white"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 rounded-lg p-2 text-text-secondary hover:bg-bg-mid hover:text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
