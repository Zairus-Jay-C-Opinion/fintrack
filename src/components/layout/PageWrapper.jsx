import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative z-10 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-3 pb-28 sm:p-4 md:p-8 md:pb-10 [-webkit-overflow-scrolling:touch]"
    >
      {children}
    </motion.div>
  );
}
