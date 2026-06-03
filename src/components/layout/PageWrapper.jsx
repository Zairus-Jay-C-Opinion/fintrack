import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 overflow-y-auto p-4 md:p-8"
    >
      {children}
    </motion.div>
  );
}
