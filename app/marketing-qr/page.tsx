'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const SERVICES = [
  {
    number: '01',
    title: 'Business Websites',
    description: 'Professional digital presence for modern businesses.',
  },
  {
    number: '02',
    title: 'M-PESA Solutions',
    description: 'Payment experiences built around your business.',
  },
  {
    number: '03',
    title: 'QR Payment Solutions',
    description: 'Fast, simple customer payment experiences.',
  },
  {
    number: '04',
    title: 'Online Stores',
    description: 'Modern e-commerce for products and services.',
  },
  {
    number: '05',
    title: 'Custom Software',
    description: 'Technology designed around your workflow.',
  },
]

export default function MarketingQRPage() {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    const destination = 'https://streetgo.app/services'

    QRCode.toDataURL(destination, {
      width: 1200,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#050706',
        light: '#ffffff',
      },
    })
      .then((url: string) => {
        setQrUrl(url)
      })
      .catch((error: Error) => {
        console.error('QR generation failed:', error)
      })
  }, [])

  return (
    <main className="page">

      <div className="fontLoader" />

      <section className="card">

        {/* Decorative layers */}
        <div className="ambient ambientOne" />
        <div className="ambient ambientTwo" />

        <div className="gridPattern" />

        {/* =========================
            LEFT SIDE
        ========================== */}

        <section className="left">

          <header className="header">

            <div className="logo">
              STREET<span>GO</span>
            </div>

            <div className="tagline">
              <div className="tagLine" />
              <span>DIGITAL SOLUTIONS</span>
              <div className="tagLine" />
            </div>

          </header>

          <div className="hero">

            <div className="eyebrow">
              <span className="eyebrowDot" />
              BUSINESS TECHNOLOGY
            </div>

            <h1>
              We build.
              <br />
              We integrate.
              <br />
              <span>You grow.</span>
            </h1>

            <p>
              Powerful digital solutions that help businesses
              build their presence, connect with customers
              and operate smarter.
            </p>

          </div>

          {/* SERVICES */}

          <div className="services">

            {SERVICES.map((service) => (
              <div
                className="service"
                key={service.number}
              >

                <div className="number">
                  {service.number}
                </div>

                <div className="serviceInfo">

                  <div className="serviceTitle">
                    {service.title}
                  </div>

                  <div className="serviceDescription">
                    {service.description}
                  </div>

                </div>

                <div className="arrow">
                  ↗
                </div>

              </div>
            ))}

          </div>

          {/* CONTACT */}

          <footer className="contact">

            <div className="contactBlock">

              <div className="contactIcon">
                WA
              </div>

              <div>
                <div className="label">
                  WHATSAPP
                </div>

                <div className="value">
                  0793 397 916
                </div>
              </div>

            </div>

            <div className="contactDivider" />

            <div className="contactBlock">

              <div className="contactIcon">
                @
              </div>

              <div>
                <div className="label">
                  EMAIL
                </div>

                <div className="value email">
                  tundastreet@gmail.com
                </div>
              </div>

            </div>

          </footer>

        </section>

        {/* =========================
            RIGHT SIDE
        ========================== */}

        <section className="right">

          <div className="rightContent">

            <div className="scanEyebrow">
              <span />
              ONE SCAN AWAY
              <span />
            </div>

            <h2>
              Discover
              <br />
              <strong>StreetGO.</strong>
            </h2>

            <p className="scanText">
              Scan the QR code to explore our
              services and see what we can build
              for your business.
            </p>

            {/* QR */}

            <div className="qrContainer">

              <div className="qrCorners cornerTL" />
              <div className="qrCorners cornerTR" />
              <div className="qrCorners cornerBL" />
              <div className="qrCorners cornerBR" />

              <div className="qrWhite">

                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="StreetGO services QR code"
                    className="qr"
                  />
                ) : (
                  <div className="loading">
                    Preparing...
                  </div>
                )}

              </div>

            </div>

            <div className="scanLabel">
              <span className="scanIcon">
                ↑
              </span>

              <div>
                <div className="scanLabelTitle">
                  SCAN TO EXPLORE
                </div>

                <div className="scanLabelText">
                  streetgo.app/services
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT FOOTER */}

          <div className="rightFooter">

            <div className="footerMark">
              ST<span>G</span>
            </div>

            <div className="footerText">
              <div>
                STREET<span>GO</span>
              </div>

              <small>
                DIGITAL SOLUTIONS
              </small>
            </div>

            <div className="footerArrow">
              ↗
            </div>

          </div>

        </section>

      </section>

      <style jsx>{`

        /* =========================================
           MODERN FONT
        ========================================== */

        @import url(
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap'
        );

        * {
          box-sizing: border-box;
        }

        /* =========================================
           PAGE
        ========================================== */

        .page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          justify-content: center;
          align-items: center;

          padding: 50px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(112, 214, 0, 0.13),
              transparent 27%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(112, 214, 0, 0.08),
              transparent 25%
            ),
            #020403;

          font-family: 'Inter', sans-serif;
        }

        /* =========================================
           CARD
        ========================================== */

        .card {
          position: relative;

          width: 1200px;
          height: 685px;

          display: grid;
          grid-template-columns: 57% 43%;

          overflow: hidden;

          border-radius: 30px;

          background:
            linear-gradient(
              135deg,
              #030604 0%,
              #071009 48%,
              #020403 100%
            );

          border:
            1px solid
            rgba(132, 220, 0, 0.5);

          box-shadow:
            0 45px 100px rgba(0, 0, 0, 0.7),
            0 0 100px rgba(112, 214, 0, 0.05);

          color: white;
        }

        /* =========================================
           AMBIENT LIGHT
        ========================================== */

        .ambient {
          position: absolute;

          width: 400px;
          height: 400px;

          border-radius: 50%;

          filter: blur(90px);

          pointer-events: none;
        }

        .ambientOne {
          left: -200px;
          top: -180px;

          background:
            rgba(112, 214, 0, 0.12);
        }

        .ambientTwo {
          left: 250px;
          bottom: -250px;

          background:
            rgba(112, 214, 0, 0.07);
        }

        /* =========================================
           SUBTLE GRID
        ========================================== */

        .gridPattern {
          position: absolute;

          inset: 0;

          opacity: 0.035;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.3) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.3) 1px,
              transparent 1px
            );

          background-size: 35px 35px;

          pointer-events: none;
        }

        /* =========================================
           LEFT
        ========================================== */

        .left {
          position: relative;

          z-index: 3;

          padding:
            52px
            45px
            32px
            62px;
        }

        /* =========================================
           LOGO
        ========================================== */

        .logo {
          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 68px;

          line-height: 0.85;

          font-weight: 700;

          font-style: italic;

          letter-spacing: -5px;

          color: white;
        }

        .logo span {
          color: #8bdc00;
        }

        .tagline {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 16px;

          color: #8bdc00;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 4px;
        }

        .tagLine {
          width: 42px;
          height: 2px;

          background: #8bdc00;
        }

        /* =========================================
           HERO
        ========================================== */

        .hero {
          margin-top: 35px;
        }

        .eyebrow {
          display: flex;

          align-items: center;

          gap: 9px;

          margin-bottom: 13px;

          color: #8bdc00;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 3px;
        }

        .eyebrowDot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #8bdc00;

          box-shadow:
            0 0 10px
            rgba(139,220,0,0.8);
        }

        .hero h1 {
          margin: 0;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 34px;

          line-height: 1.04;

          letter-spacing: -1.5px;

          font-weight: 600;
        }

        .hero h1 span {
          color: #8bdc00;
        }

        .hero p {
          width: 510px;

          max-width: 100%;

          margin:
            14px
            0
            0;

          color: #89968d;

          font-size: 12px;

          line-height: 1.55;
        }

        /* =========================================
           SERVICES
        ========================================== */

        .services {
          width: 540px;

          max-width: 100%;

          margin-top: 20px;
        }

        .service {
          min-height: 48px;

          display: flex;

          align-items: center;

          border-bottom:
            1px solid
            rgba(139, 220, 0, 0.13);

          transition:
            background 0.2s ease;
        }

        .number {
          width: 38px;

          color: #72ad15;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 1px;
        }

        .serviceInfo {
          flex: 1;
        }

        .serviceTitle {
          color: #ffffff;

          font-size: 14px;

          font-weight: 700;
        }

        .serviceDescription {
          margin-top: 2px;

          color: #657269;

          font-size: 8px;

          letter-spacing: 0.1px;
        }

        .arrow {
          color: #73b500;

          font-size: 17px;

          opacity: 0.75;
        }

        /* =========================================
           CONTACT
        ========================================== */

        .contact {
          display: flex;

          align-items: center;

          gap: 22px;

          margin-top: 19px;
        }

        .contactBlock {
          display: flex;

          align-items: center;

          gap: 9px;
        }

        .contactDivider {
          width: 1px;
          height: 28px;

          background:
            rgba(255,255,255,0.10);
        }

        .contactIcon {
          width: 29px;
          height: 29px;

          display: flex;

          justify-content: center;
          align-items: center;

          border:
            1px solid
            rgba(139,220,0,0.45);

          border-radius: 50%;

          color: #8bdc00;

          font-size: 7px;

          font-weight: 900;
        }

        .label {
          color: #5f6c64;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 1.6px;
        }

        .value {
          margin-top: 2px;

          color: white;

          font-size: 12px;

          font-weight: 700;
        }

        .email {
          font-size: 10px;
        }

        /* =========================================
           RIGHT
        ========================================== */

        .right {
          position: relative;

          z-index: 5;

          margin:
            18px
            18px
            82px
            0;

          padding:
            36px
            45px;

          display: flex;

          flex-direction: column;

          align-items: center;

          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #f3f6f0 100%
            );

          border-radius:
            42px
            0
            0
            42px;

          color: #050705;

          box-shadow:
            -25px
            0
            50px
            rgba(0,0,0,0.18);
        }

        .rightContent {
          display: flex;

          flex-direction: column;

          align-items: center;

          width: 100%;
        }

        .scanEyebrow {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #6c9e17;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 2.5px;
        }

        .scanEyebrow span {
          width: 25px;
          height: 1px;

          background: #7cb528;
        }

        .right h2 {
          margin:
            10px
            0
            0;

          text-align: center;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 33px;

          line-height: 0.98;

          letter-spacing: -1.5px;

          font-weight: 700;
        }

        .right h2 strong {
          color: #609d08;
        }

        .scanText {
          width: 290px;

          margin:
            11px
            auto
            0;

          color: #737d77;

          text-align: center;

          font-size: 10px;

          line-height: 1.5;
        }

        /* =========================================
           QR
        ========================================== */

        .qrContainer {
          position: relative;

          width: 300px;
          height: 300px;

          margin-top: 18px;

          display: flex;

          justify-content: center;
          align-items: center;
        }

        .qrWhite {
          width: 268px;
          height: 268px;

          padding: 8px;

          display: flex;

          justify-content: center;
          align-items: center;

          background: white;

          border-radius: 16px;

          box-shadow:
            0
            14px
            35px
            rgba(0,0,0,0.10);
        }

        .qr {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .loading {
          color: #777;

          font-size: 11px;
        }

        /* QR decorative corners */

        .qrCorners {
          position: absolute;

          width: 22px;
          height: 22px;

          border-color: #70ad10;

          border-style: solid;
        }

        .cornerTL {
          left: 0;
          top: 0;

          border-width: 3px 0 0 3px;

          border-radius: 6px 0 0 0;
        }

        .cornerTR {
          right: 0;
          top: 0;

          border-width: 3px 3px 0 0;

          border-radius: 0 6px 0 0;
        }

        .cornerBL {
          left: 0;
          bottom: 0;

          border-width: 0 0 3px 3px;

          border-radius: 0 0 0 6px;
        }

        .cornerBR {
          right: 0;
          bottom: 0;

          border-width: 0 3px 3px 0;

          border-radius: 0 0 6px 0;
        }

        /* =========================================
           SCAN LABEL
        ========================================== */

        .scanLabel {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 12px;
        }

        .scanIcon {
          width: 28px;
          height: 28px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #e7f2da;

          color: #639e08;

          font-size: 17px;

          font-weight: 800;
        }

        .scanLabelTitle {
          color: #6a9e0d;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .scanLabelText {
          margin-top: 2px;

          color: #151915;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 11px;

          font-weight: 600;
        }

        /* =========================================
           RIGHT FOOTER
        ========================================== */

        .rightFooter {
          position: absolute;

          left: 0;
          right: 0;
          bottom: -82px;

          height: 82px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 15px;

          background:
            linear-gradient(
              135deg,
              #030603,
              #091109
            );

          border-top:
            2px solid
            #70d600;
        }

        .footerMark {
          width: 38px;
          height: 38px;

          display: flex;

          justify-content: center;
          align-items: center;

          border:
            1px solid
            rgba(139,220,0,0.55);

          border-radius: 10px;

          color: white;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 15px;

          font-weight: 800;
        }

        .footerMark span {
          color: #8bdc00;
        }

        .footerBrand {
          color: white;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 23px;

          font-weight: 700;

          font-style: italic;
        }

        .footerBrand span {
          color: #8bdc00;
        }

        .footerText small {
          display: block;

          margin-top: 2px;

          color: #8bdc00;

          font-size: 6px;

          letter-spacing: 3px;
        }

        .footerArrow {
          color: #8bdc00;

          font-size: 23px;

          transform: rotate(-25deg);
        }

        /* =========================================
           TABLET
        ========================================== */

        @media (max-width: 1050px) {

          .page {
            padding: 20px;
          }

          .card {
            width: 900px;
            height: 514px;
          }

          .left {
            padding:
              36px
              30px
              25px
              40px;
          }

          .logo {
            font-size: 51px;
          }

          .tagline {
            font-size: 8px;
            letter-spacing: 3px;
          }

          .hero {
            margin-top: 23px;
          }

          .hero h1 {
            font-size: 24px;
          }

          .hero p {
            font-size: 9px;
          }

          .services {
            margin-top: 13px;
          }

          .service {
            min-height: 36px;
          }

          .serviceTitle {
            font-size: 11px;
          }

          .serviceDescription {
            font-size: 7px;
          }

          .contact {
            margin-top: 10px;
          }

          .right {
            padding: 25px;
            margin-top: 12px;
          }

          .right h2 {
            font-size: 21px;
          }

          .scanText {
            width: 230px;
            font-size: 8px;
          }

          .qrContainer {
            width: 220px;
            height: 220px;
            margin-top: 10px;
          }

          .qrWhite {
            width: 195px;
            height: 195px;
          }

        }

        /* =========================================
           PHONE
        ========================================== */

        @media (max-width: 700px) {

          .page {
            padding: 10px;
          }

          .card {
            width: 100%;
            height: auto;

            display: block;

            border-radius: 20px;
          }

          .left {
            padding: 30px 24px;
          }

          .logo {
            font-size: 45px;
          }

          .hero {
            margin-top: 27px;
          }

          .hero h1 {
            font-size: 27px;
          }

          .hero p {
            font-size: 11px;
          }

          .services {
            margin-top: 20px;
          }

          .service {
            min-height: 54px;
          }

          .serviceTitle {
            font-size: 14px;
          }

          .serviceDescription {
            font-size: 8px;
          }

          .contact {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .contactDivider {
            display: none;
          }

          .right {
            margin: 0;

            padding:
              35px
              20px
              105px;

            border-radius:
              0
              0
              20px
              20px;
          }

          .qrContainer {
            width: 290px;
            height: 290px;
          }

          .qrWhite {
            width: 260px;
            height: 260px;
          }

          .rightFooter {
            bottom: 0;
          }

        }

        /* =========================================
           PRINT
        ========================================== */

        @media print {

          @page {
            size: landscape;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .page {
            width: 1200px;
            height: 685px;

            min-height: 685px;

            padding: 0;

            background: white;
          }

          .card {
            width: 1200px;
            height: 685px;

            max-width: none;

            border-radius: 0;

            box-shadow: none;
          }

        }

      `}</style>
    </main>
  )
}

function Service({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="service">

      <div className="number">
        {number}
      </div>

      <div className="serviceInfo">

        <div className="serviceTitle">
          {title}
        </div>

        <div className="serviceDescription">
          {description}
        </div>

      </div>

      <div className="arrow">
        ↗
      </div>

    </div>
  )
}