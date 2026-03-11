import { motion } from "framer-motion";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

type MovingBorderProps = {
  children: ReactNode;
  borderRadius?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  as?: keyof JSX.IntrinsicElements;
} & ComponentPropsWithoutRef<"button">;

export function MovingBorder({
  children,
  borderRadius = "1.75rem",
  className = "",
  containerClassName = "",
  borderClassName = "",
  duration = 2000,
  as: Component = "button",
  ...rest
}: MovingBorderProps) {
  return (
    <motion.div
      className={`relative flex rounded-[1.75rem] p-[2px] ${containerClassName}`}
      style={{ borderRadius }}
      initial={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`absolute inset-0 rounded-[1.75rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer ${borderClassName}`}
        style={{ borderRadius, animationDuration: `${duration}ms` }}
      />
      <Component
        className={`relative z-10 flex items-center justify-center rounded-[calc(1.75rem-2px)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-white backdrop-blur border border-[var(--border)] ${className}`}
        style={{ borderRadius: "calc(1.75rem - 2px)" }}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </Component>
    </motion.div>
  );
}
