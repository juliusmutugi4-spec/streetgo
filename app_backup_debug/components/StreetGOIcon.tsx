"use client"

type StreetGOIconProps = {
  size?: number
  className?: string
  showText?: boolean
}

export default function StreetGOIcon({
  size = 64,
  className = "",
  showText = false,
}: StreetGOIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: showText ? size * 1.12 : size }}
      aria-label="StreetGO"
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={showText ? size * 1.12 : size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="streetgo-title"
      >
        <title id="streetgo-title">StreetGO</title>

        <defs>
          {/* Green S */}
          <linearGradient id="sgGreen" x1="130" y1="80" x2="350" y2="350">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="45%" stopColor="#00e879" />
            <stop offset="100%" stopColor="#00a95c" />
          </linearGradient>

          {/* White G */}
          <linearGradient id="sgWhite" x1="300" y1="230" x2="410" y2="430">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#eeeeee" />
            <stop offset="100%" stopColor="#bdbdbd" />
          </linearGradient>

          {/* Red */}
          <linearGradient id="sgRed" x1="420" y1="350" x2="470" y2="470">
            <stop offset="0%" stopColor="#ff4b4b" />
            <stop offset="100%" stopColor="#c40000" />
          </linearGradient>

          {/* Outer glow */}
          <filter id="sgGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Letter glow */}
          <filter id="letterGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur
              in="shadow"
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="ringGradient" x1="80" y1="80" x2="430" y2="430">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="48%" stopColor="#00e879" />
            <stop offset="78%" stopColor="#ff2424" />
            <stop offset="100%" stopColor="#ff2424" />
          </linearGradient>
        </defs>

        {/* =========================
            OUTER APP ICON
        ========================= */}

        <rect
          x="7"
          y="7"
          width="498"
          height="498"
          rx="74"
          fill="#030506"
          stroke="#7b1717"
          strokeWidth="4"
        />

        {/* subtle inner border */}
        <rect
          x="16"
          y="16"
          width="480"
          height="480"
          rx="66"
          stroke="#ff3030"
          strokeOpacity=".22"
          strokeWidth="2"
        />

        {/* =========================
            MOTION LINES
        ========================= */}

        <g opacity=".9">
          <path
            d="M68 212H190"
            stroke="url(#sgGreen)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <path
            d="M54 238H169"
            stroke="url(#sgGreen)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M73 264H152"
            stroke="url(#sgGreen)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* =========================
            MAIN CIRCLE
        ========================= */}

        <circle
          cx="256"
          cy="235"
          r="164"
          stroke="url(#ringGradient)"
          strokeWidth="8"
          opacity=".95"
          filter="url(#sgGlow)"
        />

        <circle
          cx="256"
          cy="235"
          r="151"
          stroke="#ffffff"
          strokeOpacity=".08"
          strokeWidth="2"
        />

        {/* =========================
            STREETGO S
        ========================= */}

        <path
          d="
            M363 111
            H183
            C139 111 113 137 113 169
            C113 203 139 220 177 224
            L290 236
            C313 238 323 247 323 261
            C323 277 309 286 285 286
            H131
            L105 324
            H297
            C348 324 382 297 382 257
            C382 219 354 200 312 196
            L201 185
            C179 183 168 176 168 164
            C168 151 181 144 203 144
            H337
            Z
          "
          fill="url(#sgGreen)"
          stroke="#04140d"
          strokeWidth="8"
          strokeLinejoin="round"
          filter="url(#sgGlow)"
        />

        {/* S highlight */}
        <path
          d="M190 126H350"
          stroke="#ffffff"
          strokeOpacity=".42"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* =========================
            G
        ========================= */}

        <path
          d="
            M286 293
            C286 338 318 371 361 371
            C391 371 414 360 431 342
            L431 384
            C410 402 383 412 349 412
            C278 412 237 366 237 310
            C237 294 241 279 247 266
            H302
            C292 274 286 282 286 293
            Z
          "
          fill="url(#sgWhite)"
          stroke="#171717"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        <path
          d="
            M354 315
            H438
            V365
            H401
            V346
            H354
            Z
          "
          fill="url(#sgWhite)"
          stroke="#171717"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* =========================
            RED ACCENT
        ========================= */}

        <path
          d="M417 405H451"
          stroke="url(#sgRed)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* =========================
            STREETGO TEXT
        ========================= */}

        {showText && (
          <g>
            <text
              x="256"
              y="451"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="38"
              fontWeight="900"
              fontStyle="italic"
              letterSpacing="6"
              fill="#ffffff"
            >
              STREET
              <tspan fill="#ff2525">GO</tspan>
            </text>

            <text
              x="256"
              y="478"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="13"
              fontWeight="700"
              letterSpacing="7"
              fill="#00d982"
            >
              CONNECT • SHARE • GROW
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}