"use client"

import { motion, AnimatePresence } from "framer-motion"

type Member = {
  id: string
  member_number: number
}

type Props = {
  member: Member
  nextRecipient?: Member | null
}

export default function ProfessionalMemberBadge({
  member,
  nextRecipient,
}: Props) {
  const isActive = nextRecipient?.id === member.id

  return (
    <motion.span
      whileHover={{ scale: isActive ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isActive
          ? {
              scale: [1, 1.08, 1],
              backgroundColor: [
                "rgba(59, 130, 246, 0.20)",
                "rgba(168, 85, 247, 0.22)",
                "rgba(16, 185, 129, 0.20)",
                "rgba(59, 130, 246, 0.20)",
              ],
              borderColor: [
                "rgba(96, 165, 250, 0.85)",
                "rgba(192, 132, 252, 0.85)",
                "rgba(52, 211, 153, 0.85)",
                "rgba(96, 165, 250, 0.85)",
              ],
              color: [
                "rgba(147, 197, 253, 1)",
                "rgba(216, 180, 254, 1)",
                "rgba(110, 231, 183, 1)",
                "rgba(147, 197, 253, 1)",
              ],
              boxShadow: [
                "0 0 10px 2px rgba(59, 130, 246, 0.35)",
                "0 0 22px 5px rgba(168, 85, 247, 0.35)",
                "0 0 18px 4px rgba(16, 185, 129, 0.35)",
                "0 0 10px 2px rgba(59, 130, 246, 0.35)",
              ],
            }
          : {
              scale: 1,
              backgroundColor: "rgba(15, 23, 42, 1)",
              borderColor: "rgba(30, 41, 59, 1)",
              color: "rgba(148, 163, 184, 1)",
              boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
            }
      }
      transition={
        isActive
          ? {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {
              type: "spring",
              stiffness: 300,
              damping: 25,
            }
      }
      className="
        relative flex h-9 w-9 shrink-0
        items-center justify-center
        overflow-visible rounded-xl border
        text-[11px] font-black tracking-wider
        select-none
      "
    >
      {/* Advanced animated outer ring for the next recipient */}
      <AnimatePresence>
        {isActive && (
          <>
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: [0.25, 0.8, 0.25],
                scale: [1, 1.35, 1],
              }}
              exit={{
                opacity: 0,
                scale: 0.7,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute inset-[-5px]
                rounded-xl
                border border-blue-400/50
              "
            />

            {/* Animated light flare */}
            <motion.span
              initial={{
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0.15, 0.5, 0.15],
                rotate: 360,
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="
                pointer-events-none
                absolute inset-[-2px]
                rounded-xl
                bg-gradient-to-r
                from-blue-500/20
                via-purple-500/20
                to-emerald-400/20
                blur-sm
              "
            />

            {/* Internal highlight */}
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1, 0.8],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute inset-0
                rounded-xl
                bg-gradient-to-br
                from-white/20
                via-transparent
                to-transparent
              "
            />
          </>
        )}
      </AnimatePresence>

      {/* Member number */}
      <motion.span
        layout
        className="relative z-10 font-mono"
      >
        #{member.member_number}
      </motion.span>

      {/* NEXT indicator */}
      <AnimatePresence>
        
      </AnimatePresence>
    </motion.span>
  )
}