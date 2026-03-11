import { motion } from "framer-motion";

export function CoolBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0f]">
      {/* 渐变光晕 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -left-1/2 top-0 h-[80vh] w-[100vw] rounded-full bg-indigo-500/20 blur-[120px]"
          animate={{
            x: ["0%", "30%", "0%"],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/2 top-1/3 h-[60vh] w-[80vw] rounded-full bg-purple-600/25 blur-[100px]"
          animate={{
            x: ["0%", "-20%", "0%"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {/* 网格线 */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden
      />
      {/* 顶部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]/80" />
    </div>
  );
}
