'use client'

import Image from 'next/image'

interface SplashScreenProps {
  progress: number
  status: string
}

export default function SplashScreen({
  progress,
  status,
}: SplashScreenProps) {
  const safeProgress = Math.min(
    100,
    Math.max(0, Math.round(progress))
  )

  return (
    <main
      className="streetgo-splash"
      role="progressbar"
      aria-valuenow={safeProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="StreetGO loading"
    >
      {/* =========================================================
          CINEMATIC MASTER ARTWORK
          ---------------------------------------------------------
          Put the generated reference image here:

          /public/streetgo-splash.png
      ========================================================== */}

      <Image
        src="/streetgo-splash.png"
        alt=""
        fill
        priority
        quality={100}
        sizes="100vw"
        className="master-artwork"
      />

      {/* =========================================================
          CINEMATIC DEPTH
      ========================================================== */}

      <div className="artwork-depth" />

      <div className="artwork-vignette" />

      <div className="cinematic-glow" />

      {/* =========================================================
          SUBTLE MOVING LIGHT
      ========================================================== */}

      <div className="light-sweep" />

      {/* =========================================================
          FLOATING MICRO PARTICLES
      ========================================================== */}

      <div className="particles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* =========================================================
          LIVE LOADING INTERFACE
      ========================================================== */}

      <section className="loading-interface">

        {/* Small top brand marker */}
        <div className="brand-marker">
          <span className="marker-line" />
          <span className="marker-text">
            STREETGO
          </span>
          <span className="marker-line" />
        </div>

        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="brand-lockup">

          <div className="brand-wordmark">
            <span className="street">
              street
            </span>

            <span className="go">
              go
            </span>
          </div>

          <div className="brand-underline" />

        </div>

        {/* =====================================================
            TAGLINE
        ====================================================== */}

        <div className="tagline">

          <span>
            CONNECT
          </span>

          <i />

          <span>
            CREATE
          </span>

          <i />

          <span>
            EARN
          </span>

        </div>

        {/* =====================================================
            LOADING PANEL
        ====================================================== */}

        <div className="loading-panel">

          <div className="loading-header">

            <span className="loading-status">
              {status || 'LOADING STREETGO...'}
            </span>

            <span className="loading-percentage">
              {safeProgress}%
            </span>

          </div>

          {/* Main progress rail */}
          <div className="progress-rail">

            <div
              className="progress-value"
              style={{
                width: `${safeProgress}%`,
              }}
            >
              <div className="progress-light" />
            </div>

          </div>

          {/* Progress ticks */}
          <div className="progress-ticks">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

        </div>

        {/* =====================================================
            BOTTOM SYSTEM STATUS
        ====================================================== */}

        <div className="system-status">

          <div>
            <span className="status-dot" />
            <span>SYSTEM READY</span>
          </div>

          <div>
            <span>STREETGO</span>
            <span className="separator">/</span>
            <span>KENYA</span>
          </div>

        </div>

      </section>

      {/* =========================================================
          BOTTOM BRANDING
      ========================================================== */}

      <div className="bottom-signature">
        <span>STREETGO</span>
        <span className="signature-dot" />
        <span>MOVE FORWARD</span>
      </div>

      <style jsx>{`

        /* =====================================================
           ROOT
        ====================================================== */

        .streetgo-splash {
          position: fixed;
          inset: 0;

          z-index: 99999;

          overflow: hidden;

          background:
            #031a13;

          isolation: isolate;

          user-select: none;
        }

        /* =====================================================
           MASTER ARTWORK
        ====================================================== */

        .master-artwork {
          position: absolute !important;

          inset: 0 !important;

          width: 100% !important;
          height: 100% !important;

          object-fit: cover;

          object-position: center;

          z-index: -20;

          transform:
            scale(1.012);

          animation:
            artworkBreathing 14s
            ease-in-out
            infinite;

          will-change:
            transform;
        }

        /* =====================================================
           ARTWORK DEPTH
        ====================================================== */

        .artwork-depth {
          position: absolute;

          inset: 0;

          z-index: -15;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(0, 20, 15, 0.20),
              transparent 35%,
              transparent 68%,
              rgba(255, 215, 50, 0.06)
            );

          mix-blend-mode:
            multiply;

          opacity:
            0.65;
        }

        /* =====================================================
           CINEMATIC VIGNETTE
        ====================================================== */

        .artwork-vignette {
          position: absolute;

          inset: 0;

          z-index: -10;

          pointer-events: none;

          background:
            radial-gradient(
              ellipse at center,
              transparent 32%,
              rgba(0,0,0,0.06) 52%,
              rgba(0,0,0,0.26) 78%,
              rgba(0,0,0,0.55) 100%
            );
        }

        /* =====================================================
           CENTER GLOW
        ====================================================== */

        .cinematic-glow {
          position: absolute;

          left: 50%;
          top: 50%;

          width: min(60vw, 900px);
          height: min(60vh, 700px);

          transform:
            translate(-50%, -50%);

          z-index: -5;

          pointer-events: none;

          background:
            radial-gradient(
              ellipse,
              rgba(255,255,255,0.055),
              transparent 65%
            );

          filter:
            blur(45px);

          animation:
            centerGlow 7s
            ease-in-out
            infinite;
        }

        /* =====================================================
           MOVING LIGHT
        ====================================================== */

        .light-sweep {
          position: absolute;

          top: -30%;
          left: -35%;

          width: 45%;
          height: 160%;

          z-index: 2;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.035),
              rgba(255,255,255,0.09),
              rgba(255,255,255,0.025),
              transparent
            );

          transform:
            rotate(18deg)
            translateX(-150%);

          filter:
            blur(8px);

          animation:
            cinematicSweep 10s
            ease-in-out
            infinite;
        }

        /* =====================================================
           PARTICLES
        ====================================================== */

        .particles {
          position: absolute;

          inset: 0;

          z-index: 3;

          pointer-events: none;

          overflow: hidden;
        }

        .particles span {
          position: absolute;

          width: 2px;
          height: 2px;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.7);

          opacity: 0;

          box-shadow:
            0 0 8px rgba(255,255,255,0.5);

          animation:
            particleRise 6s
            ease-in-out
            infinite;
        }

        .particles span:nth-child(1) {
          left: 12%;
          top: 70%;
          animation-delay: 0s;
        }

        .particles span:nth-child(2) {
          left: 24%;
          top: 40%;
          animation-delay: 1.2s;
        }

        .particles span:nth-child(3) {
          left: 38%;
          top: 76%;
          animation-delay: 2.1s;
        }

        .particles span:nth-child(4) {
          left: 52%;
          top: 24%;
          animation-delay: 0.7s;
        }

        .particles span:nth-child(5) {
          left: 67%;
          top: 67%;
          animation-delay: 2.7s;
        }

        .particles span:nth-child(6) {
          left: 79%;
          top: 32%;
          animation-delay: 1.8s;
        }

        .particles span:nth-child(7) {
          left: 88%;
          top: 76%;
          animation-delay: 3.2s;
        }

        .particles span:nth-child(8) {
          left: 44%;
          top: 52%;
          animation-delay: 4s;
        }

        /* =====================================================
           MAIN INTERFACE
        ====================================================== */

        .loading-interface {
          position: absolute;

          inset: 0;

          z-index: 10;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding:
            40px;

          pointer-events: none;
        }

        /* =====================================================
           TOP MARKER
        ====================================================== */

        .brand-marker {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 12px;

          margin-bottom: 28px;

          opacity: 0.82;
        }

        .marker-line {
          width: 34px;

          height: 1px;

          background:
            rgba(255,255,255,0.55);
        }

        .marker-text {
          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 8px;

          font-weight: 800;

          letter-spacing:
            0.42em;

          color:
            rgba(255,255,255,0.78);
        }

        /* =====================================================
           LOGO
        ====================================================== */

        .brand-lockup {
          position: relative;

          display: flex;

          flex-direction: column;

          align-items: center;
        }

        .brand-wordmark {
          display: flex;

          align-items: baseline;

          justify-content: center;

          line-height: 0.85;

          letter-spacing:
            -0.075em;

          filter:
            drop-shadow(
              0 12px 32px
              rgba(0,0,0,0.30)
            );
        }

        .street {
          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              64px,
              10vw,
              138px
            );

          font-weight:
            950;

          color:
            #ffffff;

          text-shadow:
            0 2px 0 rgba(255,255,255,0.25),
            0 8px 28px rgba(0,0,0,0.35);
        }

        .go {
          position: relative;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              64px,
              10vw,
              138px
            );

          font-weight:
            950;

          background:
            linear-gradient(
              180deg,
              #8affca 0%,
              #27e79d 38%,
              #00b878 100%
            );

          background-clip:
            text;

          -webkit-background-clip:
            text;

          color:
            transparent;

          -webkit-text-fill-color:
            transparent;

          text-shadow:
            0 0 30px
            rgba(25,230,150,0.18);
        }

        /* =====================================================
           LOGO UNDERLINE
        ====================================================== */

        .brand-underline {
          position: relative;

          width: 54px;

          height: 2px;

          margin-top: 18px;

          border-radius: 99px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #f5d76e,
              transparent
            );

          box-shadow:
            0 0 14px
            rgba(250,204,21,0.55);
        }

        .brand-underline::after {
          content: '';

          position: absolute;

          left: 50%;

          top: 50%;

          width: 4px;
          height: 4px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            #fff4ae;

          box-shadow:
            0 0 10px
            rgba(255,237,130,0.95);
        }

        /* =====================================================
           TAGLINE
        ====================================================== */

        .tagline {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 18px;

          margin-top: 24px;

          color:
            rgba(255,255,255,0.88);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            0.38em;

          text-shadow:
            0 2px 10px
            rgba(0,0,0,0.3);
        }

        .tagline i {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background:
            #facc15;

          box-shadow:
            0 0 10px
            rgba(250,204,21,0.9);
        }

        /* =====================================================
           LOADING PANEL
        ====================================================== */

        .loading-panel {
          width:
            min(520px, 76vw);

          margin-top:
            clamp(45px, 7vh, 75px);
        }

        .loading-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 11px;

          color:
            rgba(255,255,255,0.9);
        }

        .loading-status {
          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.27em;

          text-transform:
            uppercase;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          max-width:
            75%;
        }

        .loading-percentage {
          font-family:
            'Courier New',
            monospace;

          font-size:
            11px;

          font-weight:
            800;

          letter-spacing:
            0.08em;

          color:
            #ffffff;
        }

        /* =====================================================
           PROGRESS RAIL
        ====================================================== */

        .progress-rail {
          position: relative;

          width: 100%;

          height: 5px;

          overflow: hidden;

          border-radius:
            999px;

          background:
            rgba(0,0,0,0.32);

          border:
            1px solid
            rgba(255,255,255,0.16);

          box-shadow:
            inset 0 1px 3px
            rgba(0,0,0,0.35),

            0 5px 20px
            rgba(0,0,0,0.18);
        }

        .progress-value {
          position: relative;

          height: 100%;

          min-width: 0;

          border-radius:
            inherit;

          background:
            linear-gradient(
              90deg,
              #00bd7b 0%,
              #22d994 40%,
              #8be56b 75%,
              #facc15 100%
            );

          box-shadow:
            0 0 16px
            rgba(34,217,148,0.75);

          transition:
            width 600ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .progress-light {
          position: absolute;

          top: 0;
          right: -60px;

          width: 90px;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.9),
              transparent
            );

          filter:
            blur(2px);

          animation:
            progressShimmer
            2.4s
            ease-in-out
            infinite;
        }

        /* =====================================================
           PROGRESS TICKS
        ====================================================== */

        .progress-ticks {
          display: flex;

          justify-content:
            space-between;

          margin-top: 7px;

          padding:
            0 2px;

          opacity:
            0.28;
        }

        .progress-ticks span {
          width: 1px;

          height: 3px;

          background:
            rgba(255,255,255,0.8);
        }

        /* =====================================================
           SYSTEM STATUS
        ====================================================== */

        .system-status {
          position: absolute;

          left: 40px;
          right: 40px;
          bottom: 32px;

          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          color:
            rgba(255,255,255,0.48);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            7px;

          font-weight:
            700;

          letter-spacing:
            0.25em;
        }

        .system-status > div {
          display: flex;

          align-items: center;

          gap: 8px;
        }

        .status-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            #4ade80;

          box-shadow:
            0 0 9px
            rgba(74,222,128,0.9);

          animation:
            statusPulse
            2s
            ease-in-out
            infinite;
        }

        .separator {
          opacity:
            0.35;
        }

        /* =====================================================
           BOTTOM SIGNATURE
        ====================================================== */

        .bottom-signature {
          position: absolute;

          left: 50%;

          bottom: 31px;

          transform:
            translateX(-50%);

          z-index: 20;

          display: flex;

          align-items: center;

          gap: 9px;

          color:
            rgba(255,255,255,0.30);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            6px;

          font-weight:
            800;

          letter-spacing:
            0.38em;

          white-space:
            nowrap;
        }

        .signature-dot {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background:
            rgba(250,204,21,0.65);
        }

        /* =====================================================
           ANIMATIONS
        ====================================================== */

        @keyframes artworkBreathing {

          0%,
          100% {
            transform:
              scale(1.012);
          }

          50% {
            transform:
              scale(1.025);
          }
        }

        @keyframes centerGlow {

          0%,
          100% {
            opacity:
              0.35;

            transform:
              translate(-50%, -50%)
              scale(0.95);
          }

          50% {
            opacity:
              0.75;

            transform:
              translate(-50%, -50%)
              scale(1.05);
          }
        }

        @keyframes cinematicSweep {

          0% {
            transform:
              rotate(18deg)
              translateX(-180%);
          }

          48% {
            transform:
              rotate(18deg)
              translateX(250%);
          }

          100% {
            transform:
              rotate(18deg)
              translateX(250%);
          }
        }

        @keyframes particleRise {

          0% {
            opacity:
              0;

            transform:
              translateY(15px)
              scale(0.6);
          }

          30% {
            opacity:
              0.25;
          }

          70% {
            opacity:
              0.08;
          }

          100% {
            opacity:
              0;

            transform:
              translateY(-55px)
              scale(1);
          }
        }

        @keyframes progressShimmer {

          0% {
            transform:
              translateX(-40px);

            opacity:
              0;
          }

          30% {
            opacity:
              1;
          }

          70% {
            opacity:
              1;
          }

          100% {
            transform:
              translateX(80px);

            opacity:
              0;
          }
        }

        @keyframes statusPulse {

          0%,
          100% {
            opacity:
              0.45;

            transform:
              scale(0.85);
          }

          50% {
            opacity:
              1;

            transform:
              scale(1.1);
          }
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 640px) {

          .loading-interface {
            padding:
              24px;
          }

          .master-artwork {
            object-position:
              54% center;
          }

          .brand-marker {
            margin-bottom:
              20px;
          }

          .marker-text {
            font-size:
              6px;

            letter-spacing:
              0.32em;
          }

          .marker-line {
            width:
              22px;
          }

          .brand-wordmark {
            transform:
              scale(0.88);
          }

          .tagline {
            gap:
              10px;

            margin-top:
              17px;

            font-size:
              7px;

            letter-spacing:
              0.25em;
          }

          .tagline i {
            width:
              3px;

            height:
              3px;
          }

          .loading-panel {
            width:
              82vw;

            margin-top:
              45px;
          }

          .loading-status {
            font-size:
              7px;

            letter-spacing:
              0.18em;
          }

          .loading-percentage {
            font-size:
              9px;
          }

          .system-status {
            left:
              20px;

            right:
              20px;

            bottom:
              21px;

            font-size:
              5px;

            letter-spacing:
              0.18em;
          }

          .bottom-signature {
            bottom:
              20px;

            font-size:
              5px;

            letter-spacing:
              0.25em;
          }
        }

        /* =====================================================
           SMALL HEIGHT DEVICES
        ====================================================== */

        @media (max-height: 650px) {

          .brand-marker {
            margin-bottom:
              14px;
          }

          .tagline {
            margin-top:
              12px;
          }

          .loading-panel {
            margin-top:
              28px;
          }

          .brand-underline {
            margin-top:
              10px;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          .master-artwork,
          .cinematic-glow,
          .light-sweep,
          .particles span,
          .progress-light,
          .status-dot {
            animation:
              none !important;
          }

          .progress-value {
            transition:
              none !important;
          }
        }

      `}
      </style>
    </main>
  )
}
