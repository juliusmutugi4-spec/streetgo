
'use client'

interface SplashScreenProps {
  progress: number
  status: string
}

const particles = [
  [4, 10, 2], [10, 28, 1], [16, 76, 2], [23, 43, 1],
  [29, 88, 2], [35, 19, 1], [41, 67, 2], [48, 34, 1],
  [54, 91, 2], [61, 12, 1], [67, 58, 2], [73, 82, 1],
  [79, 25, 2], [85, 70, 1], [92, 41, 2], [97, 89, 1],
  [7, 55, 1], [19, 8, 2], [33, 52, 1], [57, 47, 2],
  [70, 8, 1], [88, 15, 2], [95, 63, 1],
]

export default function SplashScreen({
  progress,
  status,
}: SplashScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden bg-[#030507] select-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >

      {/* =====================================================
          WOBBLING MATERIAL
      ====================================================== */}

      <div className="absolute inset-[-8%] animate-[materialDrift_7s_ease-in-out_infinite]">

        {/* GREEN MATERIAL */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-emerald-950
            via-emerald-700
            to-emerald-400
            opacity-95
            animate-[greenWarp_5s_ease-in-out_infinite]
          "
          style={{
            clipPath:
              'polygon(0% 0%, 62% 0%, 59% 8%, 64% 16%, 58% 25%, 63% 34%, 57% 43%, 62% 52%, 56% 61%, 61% 70%, 55% 79%, 60% 88%, 54% 100%, 0% 100%)',
          }}
        />

        {/* YELLOW MATERIAL */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-bl
            from-yellow-200
            via-yellow-400
            to-yellow-600
            opacity-90
            animate-[yellowWarp_6s_ease-in-out_infinite]
          "
          style={{
            clipPath:
              'polygon(62% 0%, 100% 0%, 100% 100%, 54% 100%, 60% 88%, 55% 79%, 61% 70%, 56% 61%, 62% 52%, 57% 43%, 63% 34%, 58% 25%, 64% 16%, 59% 8%)',
          }}
        />

        {/* DARK TRANSPARENT FABRIC SHADOWS */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-black/20
            via-transparent
            to-black/45
            mix-blend-multiply
          "
        />

        {/* DIAGONAL WAVY SEAM */}
        <div
          className="
            absolute
            top-[-10%]
            bottom-[-10%]
            left-[60%]
            w-[7px]
            bg-black/20
            blur-[2px]
            animate-[seamWobble_4s_ease-in-out_infinite]
          "
        />

      </div>

      {/* =====================================================
          MATERIAL TEXTURE
      ====================================================== */}

      <div
        className="
          absolute inset-0
          opacity-[0.13]
          pointer-events-none
          animate-[textureMove_3s_linear_infinite]
        "
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              105deg,
              rgba(255,255,255,0.10) 0px,
              rgba(255,255,255,0.10) 1px,
              transparent 1px,
              transparent 7px
            ),
            repeating-linear-gradient(
              15deg,
              rgba(0,0,0,0.10) 0px,
              rgba(0,0,0,0.10) 1px,
              transparent 1px,
              transparent 9px
            )
          `,
        }}
      />

      {/* =====================================================
          DARK BLINKING PARTICLES
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {particles.map(([left, top, size], index) => (
          <span
            key={index}
            className="
              absolute
              rounded-full
              bg-black
              animate-[darkParticle_2.5s_ease-in-out_infinite]
            "
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size + 2}px`,
              height: `${size + 2}px`,
              animationDelay: `${(index % 8) * 0.35}s`,
            }}
          />
        ))}

      </div>

      {/* =====================================================
          DARK VIGNETTE
      ====================================================== */}

      <div
        className="
          absolute inset-0
          pointer-events-none
          bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.45)_100%)]
        "
      />

      {/* =====================================================
          CENTER CONTENT
      ====================================================== */}

      <div className="absolute inset-0 z-20 flex items-center justify-center">

        <div className="flex flex-col items-center">

          {/* LOGO */}

          <h1
            className="
              text-5xl
              font-black
              tracking-tight
              text-white
              drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]
              animate-[logoWobble_2.8s_ease-in-out_infinite]
            "
          >
            street
            <span className="text-emerald-400 font-extrabold">
              go
            </span>
          </h1>

          {/* STATUS */}

          <div className="
            mt-8
            flex
            w-48
            items-center
            justify-between
            text-[10px]
            font-bold
            uppercase
            tracking-[0.25em]
            text-black/60
          ">
            <span>{status}</span>

            <span className="font-mono tracking-normal">
              {progress}%
            </span>
          </div>

          {/* LOADING BAR */}

          <div className="
            mt-3
            h-[3px]
            w-48
            overflow-hidden
            rounded-full
            bg-black/30
          ">

            <div
              className="
                h-full
                rounded-full
                bg-black
                shadow-[0_0_12px_rgba(0,0,0,0.5)]
                transition-all
                duration-300
                ease-out
              "
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style jsx>{`

        /* Whole material slowly bends */
        @keyframes materialDrift {
          0% {
            transform:
              translate3d(0, 0, 0)
              rotate(0deg)
              scale(1.02);
          }

          25% {
            transform:
              translate3d(-12px, 8px, 0)
              rotate(-0.7deg)
              scale(1.035);
          }

          50% {
            transform:
              translate3d(10px, -12px, 0)
              rotate(0.8deg)
              scale(1.025);
          }

          75% {
            transform:
              translate3d(-8px, -5px, 0)
              rotate(-0.5deg)
              scale(1.04);
          }

          100% {
            transform:
              translate3d(0, 0, 0)
              rotate(0deg)
              scale(1.02);
          }
        }

        /* Green side behaves like flexible material */
        @keyframes greenWarp {
          0% {
            transform: skewX(0deg) translateX(0);
          }

          25% {
            transform: skewX(-1.5deg) translateX(-8px);
          }

          50% {
            transform: skewX(1deg) translateX(6px);
          }

          75% {
            transform: skewX(-1deg) translateX(-5px);
          }

          100% {
            transform: skewX(0deg) translateX(0);
          }
        }

        /* Yellow side moves independently */
        @keyframes yellowWarp {
          0% {
            transform: skewX(0deg) translateX(0);
          }

          25% {
            transform: skewX(1.5deg) translateX(8px);
          }

          50% {
            transform: skewX(-1deg) translateX(-6px);
          }

          75% {
            transform: skewX(1deg) translateX(5px);
          }

          100% {
            transform: skewX(0deg) translateX(0);
          }
        }

        /* The diagonal boundary wiggles */
        @keyframes seamWobble {
          0% {
            transform: translateX(0) rotate(0deg);
          }

          25% {
            transform: translateX(-8px) rotate(-1deg);
          }

          50% {
            transform: translateX(7px) rotate(1deg);
          }

          75% {
            transform: translateX(-5px) rotate(-0.6deg);
          }

          100% {
            transform: translateX(0) rotate(0deg);
          }
        }

        /* Fabric texture slowly moves */
        @keyframes textureMove {
          0% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(12px, -8px);
          }

          100% {
            transform: translate(0, 0);
          }
        }

        /* Dark particles blink */
        @keyframes darkParticle {
          0% {
            opacity: 0.08;
            transform: scale(0.6);
          }

          25% {
            opacity: 0.55;
            transform: scale(1.2);
          }

          50% {
            opacity: 0.15;
            transform: scale(0.7);
          }

          75% {
            opacity: 0.45;
            transform: scale(1);
          }

          100% {
            opacity: 0.08;
            transform: scale(0.6);
          }
        }

        /* Logo subtly follows the material movement */
        @keyframes logoWobble {
          0% {
            transform: rotate(0deg) translateY(0);
          }

          25% {
            transform: rotate(-0.5deg) translateY(-1px);
          }

          50% {
            transform: rotate(0.5deg) translateY(1px);
          }

          75% {
            transform: rotate(-0.3deg) translateY(-1px);
          }

          100% {
            transform: rotate(0deg) translateY(0);
          }
        }

      `}</style>

    </div>
  )
}
