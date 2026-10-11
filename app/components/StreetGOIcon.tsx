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
      style={{
        width: showText ? size * 2.8 : size,
        height: size,
      }}
      aria-label="StreetGO"
    >
      <svg
        viewBox="0 0 520 260"
        width={showText ? size * 2.8 : size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="streetgo-title"
      >
        <title id="streetgo-title">StreetGO</title>

        <defs>
          {/* =========================================
              TOP YELLOW / ORANGE
          ========================================= */}

          <linearGradient
            id="streetgoYellow"
            x1="60"
            y1="35"
            x2="260"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="45%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>

          {/* =========================================
              BLUE / CYAN
          ========================================= */}

          <linearGradient
            id="streetgoBlue"
            x1="145"
            y1="210"
            x2="340"
            y2="55"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="45%" stopColor="#009DFF" />
            <stop offset="100%" stopColor="#1455FF" />
          </linearGradient>

          {/* =========================================
              DARK INNER SHAPE
          ========================================= */}

          <linearGradient
            id="streetgoDark"
            x1="120"
            y1="90"
            x2="280"
            y2="190"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#050505" />
            <stop offset="100%" stopColor="#151515" />
          </linearGradient>

          {/* =========================================
              PLAY BUTTON
          ========================================= */}

          <linearGradient
            id="streetgoPlay"
            x1="120"
            y1="120"
            x2="190"
            y2="175"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="100%" stopColor="#FF7900" />
          </linearGradient>

          {/* =========================================
              SOFT LOGO SHADOW
          ========================================= */}

          <filter
            id="streetgoShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="7"
              stdDeviation="7"
              floodColor="#000000"
              floodOpacity=".35"
            />
          </filter>

          <filter
            id="streetgoGlow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur
              stdDeviation="2"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            STREETGO ICON
        ===================================================== */}

        <g
          transform="translate(15 10)"
          filter="url(#streetgoShadow)"
        >
          {/* -----------------------------------------------
              YELLOW / ORANGE UPPER RIBBON
          ------------------------------------------------ */}

          <path
            d="
              M145 32
              C92 32 54 57 48 91
              C42 125 68 145 106 151
              L174 162
              C194 165 207 174 207 188
              C207 202 194 211 171 211
              H88
              L55 235
              H190
              C239 235 269 210 269 175
              C269 143 246 124 209 118
              L135 107
              C116 104 106 96 108 85
              C110 73 125 66 145 66
              H219
              L250 32
              Z
            "
            fill="url(#streetgoYellow)"
            stroke="#0A0A0A"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* -----------------------------------------------
              BLUE LOWER / RIGHT RIBBON
          ------------------------------------------------ */}

          <path
            d="
              M253 28
              L318 28
              C340 28 356 38 364 52
              L304 111
              C290 125 281 139 281 157
              C281 176 294 188 314 188
              C336 188 352 174 352 154
              C352 143 347 134 339 128
              L374 94
              C397 109 410 132 410 160
              C410 208 372 239 319 239
              C261 239 222 204 222 157
              C222 125 234 101 253 80
              L287 44
              Z
            "
            fill="url(#streetgoBlue)"
            stroke="#07101C"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* -----------------------------------------------
              BLACK INNER CUT / S
          ------------------------------------------------ */}

          <path
            d="
              M247 57
              C228 73 214 91 207 108
              C225 112 242 120 254 132
              C269 147 273 160 273 176
              C273 194 260 208 239 216
              C258 221 279 224 301 224
              C329 224 351 213 365 197
              C347 207 330 211 313 211
              C289 211 273 199 273 180
              C273 158 285 141 304 123
              L347 81
              L310 45
              Z
            "
            fill="url(#streetgoDark)"
          />

          {/* -----------------------------------------------
              PLAY TRIANGLE
          ------------------------------------------------ */}

          <path
            d="
              M126 101
              L126 159
              L174 130
              Z
            "
            fill="url(#streetgoPlay)"
            stroke="#080808"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* small highlight */}
          <path
            d="M72 87C78 63 103 48 132 45"
            stroke="#FFF7A0"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".65"
          />

          {/* blue highlight */}
          <path
            d="M307 39C328 40 345 48 356 61"
            stroke="#8CEEFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".7"
          />
        </g>

        {/* =====================================================
            STREETGO WORDMARK
        ===================================================== */}

        {showText && (
          <g transform="translate(425 0)">
            <text
              x="0"
              y="125"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="54"
              fontWeight="900"
              letterSpacing="-3"
            >
              <tspan fill="#FFFFFF">Street</tspan>
              <tspan fill="#FF8A00">GO</tspan>
            </text>

            <text
              x="3"
              y="151"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="12"
              fontWeight="700"
              letterSpacing="3"
              fill="#FFFFFF"
              opacity=".9"
            >
              CONNECT • WATCH • EARN
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}