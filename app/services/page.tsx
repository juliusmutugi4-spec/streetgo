'use client'

import { useState } from 'react'

const websitePackages = [
  {
    name: 'STARTER',
    price: 'From KSh 15,000',
    description: 'For small businesses getting their professional presence online.',
    features: [
      'Professional business website',
      'Mobile responsive design',
      'Business contact details',
      'WhatsApp integration',
      'Google Maps integration',
      'Social media links',
      'Basic SEO setup',
    ],
  },
  {
    name: 'BUSINESS',
    price: 'From KSh 30,000',
    description: 'For growing businesses that need a stronger digital presence.',
    featured: true,
    features: [
      'Everything in Starter',
      'Multiple business pages',
      'Product / service catalogue',
      'Contact & enquiry forms',
      'WhatsApp lead integration',
      'Social media integration',
      'Google Business integration',
      'Advanced SEO setup',
    ],
  },
  {
    name: 'ADVANCED',
    price: 'Custom quote',
    description: 'For businesses that need custom systems and integrations.',
    features: [
      'Everything in Business',
      'Custom business functionality',
      'Customer accounts',
      'Online ordering',
      'Payment integration',
      'QR payment experience',
      'Admin dashboard',
      'Custom software integration',
    ],
  },
]

const paymentPackages = [
  {
    level: '01',
    title: 'PAYMENT STARTER',
    description:
      'A simple payment experience for businesses that want customers to easily initiate M-PESA payments.',
    features: [
      'M-PESA payment interface',
      'Customer phone number entry',
      'STK Push workflow where supported',
      'Payment status handling',
      'Mobile-friendly payment page',
    ],
  },
  {
    level: '02',
    title: 'BUSINESS PAYMENTS',
    description:
      'A more complete payment experience connected to the business website.',
    features: [
      'STK Push integration',
      'Payment confirmation',
      'Order/payment reference',
      'Payment status tracking',
      'Business payment pages',
      'QR payment entry point',
    ],
  },
  {
    level: '03',
    title: 'ADVANCED PAYMENTS',
    description:
      'Custom payment systems for businesses with more complex requirements.',
    features: [
      'Advanced payment workflow',
      'QR payment experience',
      'Order management',
      'Transaction records',
      'Admin payment dashboard',
      'Custom business integrations',
      'API/callback integration',
    ],
  },
]

const integrations = [
  {
    icon: 'WA',
    title: 'WhatsApp',
    text: 'Let customers contact your business directly from your website.',
  },
  {
    icon: 'IG',
    title: 'Instagram',
    text: 'Connect your Instagram presence and send customers to your social pages.',
  },
  {
    icon: 'FB',
    title: 'Facebook',
    text: 'Connect your Facebook business presence and customer channels.',
  },
  {
    icon: 'TK',
    title: 'TikTok',
    text: 'Connect your TikTok presence and turn viewers into customers.',
  },
  {
    icon: 'G',
    title: 'Google',
    text: 'Connect your website with Google Search, Maps and Business tools.',
  },
  {
    icon: 'YT',
    title: 'YouTube',
    text: 'Showcase your videos and connect your business content.',
  },
]

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const bookProject = () => {
    const message = encodeURIComponent(
      'Hello StreetGO, I would like to book a website / digital solution for my business.'
    )

    window.open(
      `https://wa.me/254793397916?text=${message}`,
      '_blank'
    )
  }

  return (
    <main className="site">

      {/* NAVIGATION */}

      <nav className="nav">

        <div className="navInner">

          <a href="#top" className="logo">
            STREET<span>GO</span>
          </a>

          <div className={`navLinks ${menuOpen ? 'open' : ''}`}>
            <a href="#services" onClick={() => setMenuOpen(false)}>
              Services
            </a>

            <a href="#websites" onClick={() => setMenuOpen(false)}>
              Websites
            </a>

            <a href="#payments" onClick={() => setMenuOpen(false)}>
              Payments
            </a>

            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </div>

          <button
            className="navButton"
            onClick={bookProject}
          >
            BOOK A PROJECT
          </button>

          <button
            className="menuButton"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>

      </nav>

      {/* HERO */}

      <section className="hero" id="top">

        <div className="heroGlow" />

        <div className="heroInner">

          <div className="heroBadge">
            <span />
            DIGITAL SOLUTIONS FOR MODERN BUSINESS
          </div>

          <h1>
            Your business.
            <br />
            <span>Built for the digital world.</span>
          </h1>

          <p>
            We design professional websites, payment experiences,
            QR solutions and custom digital systems that help
            businesses attract customers and grow.
          </p>

          <div className="heroActions">

            <button
              className="primaryButton"
              onClick={bookProject}
            >
              BOOK YOUR PROJECT
              <span>↗</span>
            </button>

<a
  href="/explore"
  className="secondaryButton"
>
  EXPLORE SERVICES
</a>

          </div>

          <div className="heroTrust">

            <div>
              <strong>WEB</strong>
              <span>DEVELOPMENT</span>
            </div>

            <div>
              <strong>PAY</strong>
              <span>INTEGRATION</span>
            </div>

            <div>
              <strong>QR</strong>
              <span>SOLUTIONS</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>DIGITAL ACCESS</span>
            </div>

          </div>

        </div>

      </section>

      {/* INTRO */}

      <section className="section introSection" id="services">

        <div className="sectionHeader">

          <div className="sectionNumber">
            01 — WHAT WE DO
          </div>

          <h2>
            Everything your
            <br />
            <span>business needs online.</span>
          </h2>

          <p>
            From a simple business website to advanced payment
            and custom software solutions, we build digital
            experiences around the way your business works.
          </p>

        </div>

        <div className="serviceGrid">

          <ServiceCard
            number="01"
            icon="◈"
            title="Business Websites"
            text="Professional websites designed to make your business look credible, modern and easy to find."
          />

          <ServiceCard
            number="02"
            icon="₿"
            title="M-PESA Solutions"
            text="Payment experiences designed around your business and its approved M-PESA integration."
          />

          <ServiceCard
            number="03"
            icon="▦"
            title="QR Solutions"
            text="Connect customers to payments, services, products or your business information with QR."
          />

          <ServiceCard
            number="04"
            icon="◎"
            title="Online Stores"
            text="Turn your website into a digital shop where customers can explore products and place orders."
          />

          <ServiceCard
            number="05"
            icon="⌁"
            title="Custom Software"
            text="Business systems built around your workflow instead of forcing your business into a generic system."
          />

          <ServiceCard
            number="06"
            icon="↗"
            title="Digital Integration"
            text="Connect your website with WhatsApp, Google, social media, payments and other business tools."
          />

        </div>

      </section>

      {/* WEBSITES */}

      <section className="section darkSection" id="websites">

        <div className="sectionHeader">

          <div className="sectionNumber">
            02 — WEBSITE DEVELOPMENT
          </div>

          <h2>
            Choose the right
            <br />
            <span>website for your business.</span>
          </h2>

          <p>
            Start small and grow. Every website is responsive,
            professionally designed and built around your business.
          </p>

        </div>

        <div className="pricingGrid">

          {websitePackages.map((pkg) => (
            <div
              className={`priceCard ${
                pkg.featured ? 'featured' : ''
              }`}
              key={pkg.name}
            >

              {pkg.featured && (
                <div className="popular">
                  MOST POPULAR
                </div>
              )}

              <div className="priceTop">
                <div className="packageName">
                  {pkg.name}
                </div>

                <div className="price">
                  {pkg.price}
                </div>

                <p>
                  {pkg.description}
                </p>
              </div>

              <div className="features">

                {pkg.features.map((feature) => (
                  <div
                    className="feature"
                    key={feature}
                  >
                    <span>✓</span>
                    {feature}
                  </div>
                ))}

              </div>

              <button
                className={
                  pkg.featured
                    ? 'cardButton green'
                    : 'cardButton'
                }
                onClick={bookProject}
              >
                GET STARTED
                <span>↗</span>
              </button>

            </div>
          ))}

        </div>

      </section>

      {/* PAYMENTS */}

      <section className="section paymentSection" id="payments">

        <div className="paymentHeader">

          <div className="sectionNumber">
            03 — PAYMENT SOLUTIONS
          </div>

          <h2>
            From simple payments
            <br />
            to <span>advanced systems.</span>
          </h2>

          <p>
            We can build the customer-facing payment experience
            your business needs, subject to the appropriate
            merchant/API authorization and payment provider
            requirements.
          </p>

        </div>

        <div className="paymentGrid">

          {paymentPackages.map((payment) => (
            <div
              className="paymentCard"
              key={payment.level}
            >

              <div className="paymentNumber">
                {payment.level}
              </div>

              <h3>
                {payment.title}
              </h3>

              <p>
                {payment.description}
              </p>

              <div className="paymentFeatures">

                {payment.features.map((feature) => (
                  <div
                    key={feature}
                    className="paymentFeature"
                  >
                    <span>+</span>
                    {feature}
                  </div>
                ))}

              </div>

              <button
                onClick={bookProject}
                className="textButton"
              >
                DISCUSS THIS SOLUTION
                <span>↗</span>
              </button>

            </div>
          ))}

        </div>

        <div className="paymentNote">

          <div className="noteIcon">
            i
          </div>

          <div>
            <strong>
              Payment integrations are configured per business.
            </strong>

            <p>
              The merchant must have the required payment
              account and authorization. We then build the
              website/payment experience around the approved
              integration.
            </p>
          </div>

        </div>

      </section>

      {/* SOCIAL */}

      <section className="section socialSection">

        <div className="sectionHeader">

          <div className="sectionNumber">
            04 — SOCIAL & DIGITAL INTEGRATION
          </div>

          <h2>
            Put your business
            <br />
            <span>where your customers are.</span>
          </h2>

          <p>
            Your website should not live alone. We connect your
            digital presence across the platforms your customers
            already use.
          </p>

        </div>

        <div className="integrationGrid">

          {integrations.map((integration) => (
            <div
              className="integration"
              key={integration.title}
            >

              <div className="integrationIcon">
                {integration.icon}
              </div>

              <div>

                <h3>
                  {integration.title}
                </h3>

                <p>
                  {integration.text}
                </p>

              </div>

              <span className="integrationArrow">
                ↗
              </span>

            </div>
          ))}

        </div>

      </section>

      {/* PROCESS */}

      <section className="processSection">

        <div className="processInner">

          <div className="sectionNumber">
            05 — HOW IT WORKS
          </div>

          <h2>
            Simple process.
            <br />
            <span>Professional result.</span>
          </h2>

          <div className="processGrid">

            <Process
              number="01"
              title="Tell us about your business"
              text="We learn what you sell, who your customers are and what you need online."
            />

            <Process
              number="02"
              title="Choose your solution"
              text="We recommend the right website, payment or digital package for your needs."
            />

            <Process
              number="03"
              title="We build it"
              text="Our team designs and develops your digital solution around your business."
            />

            <Process
              number="04"
              title="Launch & grow"
              text="Your solution goes live and becomes part of your everyday business."
            />

          </div>

<div className="exploreAction">
  <a href="/explore" className="exploreButton">
    EXPLORE THE FULL PROCESS
    <span>↗</span>
  </a>
</div>


        </div>

      </section>






      {/* CTA */}

      <section className="cta" id="contact">

        <div className="ctaGlow" />

        <div className="ctaInner">

          <div className="ctaBadge">
            READY WHEN YOU ARE
          </div>

          <h2>
            Let's build something
            <br />
            <span>your customers remember.</span>
          </h2>

          <p>
            Tell us what your business needs.
            We'll help you choose the right digital solution.
          </p>

          <button
            className="ctaButton"
            onClick={bookProject}
          >
            BOOK YOUR PROJECT
            <span>↗</span>
          </button>

          <div className="contactDetails">

            <div>
              <small>WHATSAPP</small>
              <strong>0793 397 916</strong>
            </div>

            <div>
              <small>EMAIL</small>
              <strong>tundastreet@gmail.com</strong>
            </div>

            <div>
              <small>WEB</small>
              <strong>streetgo.app</strong>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footerInner">

          <div className="footerLogo">
            STREET<span>GO</span>
          </div>

          <div className="footerTag">
            DIGITAL SOLUTIONS
          </div>

          <div className="footerLinks">

            <a href="#services">
              Services
            </a>

            <a href="#websites">
              Websites
            </a>

            <a href="#payments">
              Payments
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>

        </div>

        <div className="copyright">
          © {new Date().getFullYear()} StreetGO. Digital solutions for modern business.
        </div>

      </footer>

      <style jsx>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap'
        );

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .site {
          min-height: 100vh;
          background: #030604;
          color: #f7faf7;
          font-family: 'DM Sans', sans-serif;
        }

        /* NAV */

        .nav {
          position: sticky;
          top: 0;
          z-index: 100;

          background:
            rgba(3, 6, 4, 0.88);

          backdrop-filter: blur(18px);

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }

        .navInner {
          max-width: 1250px;
          height: 76px;

          margin: auto;
          padding: 0 28px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: 'Space Grotesk', sans-serif;

          color: white;

          font-size: 27px;
          font-weight: 700;

          font-style: italic;

          letter-spacing: -1.5px;

          text-decoration: none;
        }

        .logo span {
          color: #8cdb00;
        }

        .navLinks {
          display: flex;
          gap: 35px;
        }

        .navLinks a {
          color: #89948e;
          text-decoration: none;

          font-size: 13px;
          font-weight: 600;

          transition: color .2s;
        }

        .navLinks a:hover {
          color: #8cdb00;
        }

        .navButton {
          border: 1px solid #6fb900;

          background: transparent;
          color: #8cdb00;

          padding: 11px 17px;

          border-radius: 8px;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1px;

          cursor: pointer;
        }

        .menuButton {
          display: none;

          background: none;
          border: none;
          color: white;
          font-size: 25px;
        }

        /* HERO */

        .hero {
          position: relative;
          overflow: hidden;

          min-height: 690px;

          display: flex;
          align-items: center;

          border-bottom:
            1px solid
            rgba(255,255,255,0.06);
        }

        .heroGlow {
          position: absolute;

          width: 700px;
          height: 700px;

          left: 50%;
          top: -280px;

          transform: translateX(-50%);

          background:
            radial-gradient(
              circle,
              rgba(112,214,0,.12),
              transparent 65%
            );

          filter: blur(15px);
        }

        .heroInner {
          position: relative;

          max-width: 1000px;

          margin: auto;

          padding: 100px 25px;

          text-align: center;
        }

        .heroBadge {
          display: inline-flex;

          align-items: center;

          gap: 10px;

          padding: 8px 13px;

          border:
            1px solid
            rgba(112,214,0,.3);

          border-radius: 100px;

          color: #8bdc00;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 2px;
        }

        .heroBadge span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #8bdc00;
        }

        .hero h1 {
          margin:
            30px
            0
            20px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: clamp(48px, 7vw, 86px);

          line-height: .98;

          letter-spacing: -4px;

          font-weight: 600;
        }

        .hero h1 span {
          color: #8cdb00;
        }

        .heroInner > p {
          max-width: 650px;

          margin: auto;

          color: #89958e;

          font-size: 16px;

          line-height: 1.7;
        }

        .heroActions {
          margin-top: 35px;

          display: flex;

          justify-content: center;

          gap: 12px;
        }

        .primaryButton,
        .secondaryButton,
        .ctaButton {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 14px;

          padding: 15px 22px;

          border-radius: 9px;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 1px;

          cursor: pointer;

          text-decoration: none;
        }

        .primaryButton,
        .ctaButton {
          border: none;

          background: #8cdb00;

          color: #061005;
        }

        .primaryButton span,
        .ctaButton span {
          font-size: 17px;
        }

        .secondaryButton {
          border:
            1px solid
            rgba(255,255,255,.14);

          color: #d8ded9;

          background:
            rgba(255,255,255,.03);
        }

        .heroTrust {
          margin-top: 75px;

          display: flex;

          justify-content: center;

          gap: 55px;
        }

        .heroTrust div {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .heroTrust strong {
          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 17px;
        }

        .heroTrust span {
          color: #59645e;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }

        /* SECTIONS */

        .section {
          max-width: 1250px;

          margin: auto;

          padding:
            120px
            28px;
        }

        .sectionHeader {
          max-width: 700px;

          margin-bottom: 55px;
        }

        .sectionNumber {
          color: #78ba08;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2.5px;

          margin-bottom: 17px;
        }

        .sectionHeader h2,
        .paymentHeader h2,
        .processInner h2,
        .cta h2 {
          margin: 0;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: clamp(38px, 5vw, 58px);

          line-height: 1.03;

          letter-spacing: -2.5px;

          font-weight: 600;
        }

        .sectionHeader h2 span,
        .paymentHeader h2 span,
        .processInner h2 span,
        .cta h2 span {
          color: #8cdb00;
        }

        .sectionHeader > p,
        .paymentHeader > p {
          margin-top: 20px;

          color: #7d8982;

          font-size: 14px;

          line-height: 1.7;

          max-width: 650px;
        }

        /* SERVICE CARDS */

        .serviceGrid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 15px;
        }

        .serviceCard {
          min-height: 230px;

          padding: 28px;

          background:
            linear-gradient(
              145deg,
              #0a120e,
              #060c08
            );

          border:
            1px solid
            rgba(255,255,255,.07);

          border-radius: 15px;

          transition:
            transform .25s,
            border-color .25s;
        }

        .serviceCard:hover {
          transform: translateY(-5px);

          border-color:
            rgba(112,214,0,.35);
        }

        .serviceTop {
          display: flex;

          justify-content: space-between;

          color: #61705f;
        }

        .serviceNumber {
          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .serviceIcon {
          color: #8cdb00;

          font-size: 25px;
        }

        .serviceCard h3 {
          margin:
            38px
            0
            10px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 21px;
        }

        .serviceCard p {
          margin: 0;

          color: #7c8881;

          font-size: 12px;

          line-height: 1.6;
        }

        /* DARK SECTION */

        .darkSection {
          max-width: none;

          padding-left: max(28px, calc((100% - 1194px) / 2));
          padding-right: max(28px, calc((100% - 1194px) / 2));

          background:
            #070c09;

          border-top:
            1px solid
            rgba(255,255,255,.05);

          border-bottom:
            1px solid
            rgba(255,255,255,.05);
        }

        .pricingGrid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 18px;
        }

        .priceCard {
          position: relative;

          padding: 32px;

          min-height: 490px;

          background: #0b130f;

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius: 16px;

          display: flex;

          flex-direction: column;
        }

        .priceCard.featured {
          border-color:
            rgba(140,219,0,.65);

          box-shadow:
            0 0 45px
            rgba(112,214,0,.07);
        }

        .popular {
          position: absolute;

          top: 0;
          right: 25px;

          padding: 7px 10px;

          background: #8cdb00;

          color: #071006;

          border-radius:
            0
            0
            6px
            6px;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .packageName {
          color: #7ab814;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .price {
          margin-top: 15px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 27px;

          font-weight: 600;
        }

        .priceTop p {
          min-height: 62px;

          color: #727e76;

          font-size: 11px;

          line-height: 1.6;
        }

        .features {
          margin-top: 12px;

          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .feature {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #aab4ae;

          font-size: 11px;
        }

        .feature span {
          color: #8cdb00;

          font-weight: 900;
        }

        .cardButton {
          margin-top: auto;

          width: 100%;

          padding: 13px;

          background: transparent;

          border:
            1px solid
            rgba(255,255,255,.12);

          border-radius: 8px;

          color: white;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.5px;

          cursor: pointer;
        }

        .cardButton.green {
          background: #8cdb00;

          color: #061005;

          border-color: #8cdb00;
        }

        .cardButton span {
          margin-left: 8px;

          font-size: 15px;
        }

        /* PAYMENTS */

        .paymentSection {
          max-width: none;

          padding-left: max(28px, calc((100% - 1194px) / 2));
          padding-right: max(28px, calc((100% - 1194px) / 2));

          background:
            radial-gradient(
              circle at 80% 30%,
              rgba(112,214,0,.07),
              transparent 30%
            ),
            #030604;
        }

        .paymentHeader {
          max-width: 730px;

          margin-bottom: 50px;
        }

        .paymentGrid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 18px;
        }

        .paymentCard {
          padding: 30px;

          border:
            1px solid
            rgba(112,214,0,.18);

          background:
            linear-gradient(
              145deg,
              #0a120d,
              #050a07
            );

          border-radius: 15px;
        }

        .paymentNumber {
          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(140,219,0,.35);

          border-radius: 9px;

          color: #8cdb00;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 11px;

          font-weight: 700;
        }

        .paymentCard h3 {
          margin:
            27px
            0
            10px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 19px;
        }

        .paymentCard > p {
          color: #78847d;

          font-size: 11px;

          line-height: 1.6;

          min-height: 65px;
        }

        .paymentFeatures {
          margin-top: 22px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(255,255,255,.07);

          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .paymentFeature {
          color: #a7b0aa;

          font-size: 10px;
        }

        .paymentFeature span {
          margin-right: 8px;

          color: #8cdb00;
        }

        .textButton {
          margin-top: 28px;

          border: none;

          background: none;

          color: #8cdb00;

          padding: 0;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

          cursor: pointer;
        }

        .textButton span {
          margin-left: 8px;

          font-size: 15px;
        }

        .paymentNote {
          margin-top: 30px;

          display: flex;

          gap: 15px;

          padding: 20px;

          background:
            rgba(112,214,0,.045);

          border:
            1px solid
            rgba(112,214,0,.12);

          border-radius: 12px;
        }

        .noteIcon {
          width: 28px;
          height: 28px;

          flex: 0 0 auto;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #8cdb00;

          color: #061005;

          font-weight: 900;
        }

        .paymentNote strong {
          font-size: 11px;
        }

        .paymentNote p {
          margin:
            5px
            0
            0;

          color: #77837b;

          font-size: 10px;

          line-height: 1.5;
        }

        /* SOCIAL */

        .socialSection {
          padding-bottom: 100px;
        }

        .integrationGrid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;
        }

        .integration {
          display: flex;

          align-items: center;

          gap: 15px;

          padding: 20px;

          background: #080e0a;

          border:
            1px solid
            rgba(255,255,255,.07);

          border-radius: 12px;
        }

        .integrationIcon {
          width: 44px;
          height: 44px;

          flex: 0 0 auto;

          display: flex;

          justify-content: center;
          align-items: center;

          border-radius: 11px;

          background:
            rgba(112,214,0,.08);

          color: #8cdb00;

          font-size: 12px;

          font-weight: 900;
        }

        .integration h3 {
          margin: 0;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 14px;
        }

        .integration p {
          margin:
            4px
            0
            0;

          color: #6e7972;

          font-size: 9px;

          line-height: 1.4;
        }

        .integrationArrow {
          margin-left: auto;

          color: #6c9d10;

          font-size: 17px;
        }

        /* PROCESS */

        .processSection {
          padding:
            110px
            28px;

          background:
            #071009;

          border-top:
            1px solid
            rgba(255,255,255,.05);
        }

        .processInner {
          max-width: 1194px;

          margin: auto;
        }

        .processGrid {
          margin-top: 60px;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 25px;
        }

        .processItem {
          position: relative;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(112,214,0,.3);
        }

        .processNumber {
          color: #8cdb00;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .processItem h3 {
          margin:
            18px
            0
            8px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 16px;
        }

        .processItem p {
          margin: 0;

          color: #718078;

          font-size: 10px;

          line-height: 1.6;
        }

        /* CTA */

        .cta {
          position: relative;

          overflow: hidden;

          padding:
            130px
            25px;

          text-align: center;

          background:
            #020403;
        }

        .ctaGlow {
          position: absolute;

          width: 650px;
          height: 350px;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%);

          background:
            radial-gradient(
              ellipse,
              rgba(112,214,0,.13),
              transparent 65%
            );

          pointer-events: none;
        }

        .ctaInner {
          position: relative;

          max-width: 800px;

          margin: auto;
        }

        .ctaBadge {
          color: #8cdb00;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 3px;
        }

        .cta h2 {
          margin-top: 18px;
        }

        .cta p {
          max-width: 550px;

          margin:
            20px
            auto
            30px;

          color: #7e8982;

          font-size: 14px;

          line-height: 1.6;
        }

        .ctaButton {
          padding:
            16px
            26px;
        }

        .contactDetails {
          margin-top: 60px;

          padding-top: 25px;

          border-top:
            1px solid
            rgba(255,255,255,.07);

          display: flex;

          justify-content: center;

          gap: 65px;
        }

        .contactDetails div {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }

        .contactDetails small {
          color: #58645d;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .contactDetails strong {
          font-size: 12px;
        }

        /* FOOTER */

        .footer {
          padding:
            45px
            28px
            25px;

          background: #010302;

          border-top:
            1px solid
            rgba(255,255,255,.06);
        }

        .footerInner {
          max-width: 1194px;

          margin: auto;

          display: flex;

          align-items: center;

          gap: 20px;
        }

        .footerLogo {
          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 23px;

          font-weight: 700;

          font-style: italic;
        }

        .footerLogo span {
          color: #8cdb00;
        }

        .footerTag {
          color: #6f9e1b;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .footerLinks {
          margin-left: auto;

          display: flex;

          gap: 25px;
        }

        .footerLinks a {
          color: #68736d;

          font-size: 10px;

          text-decoration: none;
        }

        .copyright {
          max-width: 1194px;

          margin:
            35px
            auto
            0;

          padding-top: 20px;

          border-top:
            1px solid
            rgba(255,255,255,.05);

          color: #465149;

          font-size: 9px;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {

          .navLinks {
            display: none;

            position: absolute;

            top: 76px;
            left: 0;
            right: 0;

            padding: 20px;

            background: #050906;

            flex-direction: column;

            border-bottom:
              1px solid
              rgba(255,255,255,.08);
          }

          .navLinks.open {
            display: flex;
          }

          .menuButton {
            display: block;
          }

          .navButton {
            display: none;
          }

          .serviceGrid,
          .pricingGrid,
          .paymentGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .integrationGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .processGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 600px) {

          .navInner {
            padding: 0 18px;
          }

          .hero {
            min-height: 620px;
          }

          .heroInner {
            padding: 80px 20px;
          }

          .hero h1 {
            font-size: 48px;
            letter-spacing: -2.5px;
          }

          .heroActions {
            flex-direction: column;
          }

          .heroTrust {
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 50px;
          }

          .section,
          .darkSection,
          .paymentSection {
            padding:
              80px
              20px;
          }

          .sectionHeader h2,
          .paymentHeader h2,
          .processInner h2,
          .cta h2 {
            font-size: 38px;
            letter-spacing: -1.5px;
          }

          .serviceGrid,
          .pricingGrid,
          .paymentGrid,
          .integrationGrid,
          .processGrid {
            grid-template-columns: 1fr;
          }

          .priceCard {
            min-height: auto;
          }

          .contactDetails {
            flex-direction: column;
            gap: 20px;
          }

          .footerInner {
            flex-wrap: wrap;
          }

          .footerLinks {
            width: 100%;
            margin-left: 0;
            flex-wrap: wrap;
          }

        }

      `}</style>

    </main>
  )
}

function ServiceCard({
  number,
  icon,
  title,
  text,
}: {
  number: string
  icon: string
  title: string
  text: string
}) {
  return (
    <article className="serviceCard">

      <div className="serviceTop">

        <span className="serviceNumber">
          {number}
        </span>

        <span className="serviceIcon">
          {icon}
        </span>

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  )
}

function Process({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="processItem">

      <div className="processNumber">
        {number}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  )
}