'use client'

import { useState } from 'react'

const journey = [
  {
    number: '01',
    title: 'Tell us about your business',
    text: 'We start by understanding your business, your customers and what you want your digital presence to achieve.',
  },
  {
    number: '02',
    title: 'Choose your solution',
    text: 'We recommend the right website, payment, QR, online store or custom software solution for your needs.',
  },
  {
    number: '03',
    title: 'We design and build',
    text: 'Your website or digital system is designed around your business and developed for phones, tablets and computers.',
  },
  {
    number: '04',
    title: 'Testing & approval',
    text: 'We test the important parts of the system with you before the final launch.',
  },
  {
    number: '05',
    title: 'Launch',
    text: 'Once everything is approved, your website goes live and becomes available to your customers.',
  },
  {
    number: '06',
    title: 'Handover',
    text: 'We explain the finished system and provide the appropriate access and information for your business.',
  },
]

const faqs = [
  {
    question: 'Do I own my website?',
    answer:
      'Yes. Your business website is built for your business. During handover, we explain the relevant accounts, access and responsibilities so you know how your system is managed.',
  },
  {
    question: 'Do I have to continue paying StreetGO after launch?',
    answer:
      'No. After the agreed project is completed, you can manage the website yourself or choose an ongoing StreetGO maintenance and support arrangement.',
  },
  {
    question: 'Can StreetGO maintain my website?',
    answer:
      'Yes. If you prefer not to manage technical changes yourself, we can provide ongoing maintenance, updates and technical support.',
  },
  {
    question: 'Can you integrate M-PESA payments?',
    answer:
      'We can build the customer-facing payment experience and integrate supported M-PESA/payment services where the required merchant account, API access and authorization are available.',
  },
  {
    question: 'Can I connect my WhatsApp and social media?',
    answer:
      'Yes. We can connect your website with appropriate business channels such as WhatsApp, Instagram, Facebook, TikTok, YouTube and Google services.',
  },
]

export default function ExplorePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const bookProject = () => {
    const message = encodeURIComponent(
      'Hello StreetGO, I would like to discuss a digital solution for my business.'
    )

    window.open(
      `https://wa.me/254793397916?text=${message}`,
      '_blank'
    )
  }

  return (
    <main className="explorePage">

      {/* NAVIGATION */}

      <nav className="nav">
        <div className="navInner">

          <a href="/services" className="brand">
            STREET<span>GO</span>
          </a>

          <div className={`navLinks ${menuOpen ? 'open' : ''}`}>

            <a href="/services">
              Services
            </a>

            <a href="/explore" className="active">
              How it works
            </a>

            <a href="#handover">
              Handover
            </a>

            <a href="#support">
              Support
            </a>

            <a href="#faq">
              FAQ
            </a>

          </div>

          <button
            className="navCta"
            onClick={bookProject}
          >
            BOOK A PROJECT
          </button>

          <button
            className="menuButton"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation"
          >
            ☰
          </button>

        </div>
      </nav>

      {/* HERO */}

      <section className="hero">

        <div className="container">

          <div className="eyebrow">
            STREETGO / HOW IT WORKS
          </div>

          <h1>
            From idea
            <br />
            to <span>launch.</span>
          </h1>

          <p className="heroText">
            A simple, transparent process for building your
            business website, payment experience or custom
            digital solution.
          </p>

          <div className="heroActions">

            <button
              className="primaryButton"
              onClick={bookProject}
            >
              START A PROJECT
              <span>↗</span>
            </button>

            <a
              href="/services"
              className="secondaryButton"
            >
              VIEW SERVICES
            </a>

          </div>

        </div>

      </section>

      {/* JOURNEY */}

      <section className="section">

        <div className="container">

          <div className="sectionIntro">

            <div className="sectionLabel">
              01 — THE PROCESS
            </div>

            <h2>
              A clear path from
              <br />
              <span>start to finish.</span>
            </h2>

            <p>
              We keep the process straightforward so you
              always know what happens next.
            </p>

          </div>

          <div className="journey">

            {journey.map((item) => (
              <article
                className="journeyItem"
                key={item.number}
              >

                <div className="journeyNumber">
                  {item.number}
                </div>

                <div className="journeyContent">

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                </div>

              </article>
            ))}

          </div>

        </div>

      </section>

      {/* PAYMENT */}

      <section className="paymentSection">

        <div className="container paymentLayout">

          <div>

            <div className="sectionLabel">
              02 — PAYMENTS
            </div>

            <h2>
              Payments built
              <br />
              around your <span>business.</span>
            </h2>

          </div>

          <div className="paymentCopy">

            <p>
              If your business already has an M-PESA PayBill,
              Till or another supported payment account, we
              can design the website experience around it.
            </p>

            <p>
              The actual production integration depends on
              the merchant account, payment provider and
              required API authorization.
            </p>

            <div className="paymentFlow">

              <div>
                <strong>01</strong>
                <span>Merchant account</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Authorization</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Integration</span>
              </div>

              <div>
                <strong>04</strong>
                <span>Testing</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* HANDOVER */}

      <section
        className="section"
        id="handover"
      >

        <div className="container">

          <div className="sectionIntro">

            <div className="sectionLabel">
              03 — HANDOVER
            </div>

            <h2>
              Your business stays
              <br />
              <span>in your control.</span>
            </h2>

            <p>
              When the project is complete, we make the
              transition clear. You should know what has
              been built, what you have access to and what
              happens next.
            </p>

          </div>

          <div className="handoverGrid">

            <HandoverCard
              number="01"
              title="Project completion"
              text="We complete the agreed website, features and integrations and review the final result with you."
            />

            <HandoverCard
              number="02"
              title="Access & information"
              text="We provide the appropriate website, domain, hosting or system access information relevant to your project."
            />

            <HandoverCard
              number="03"
              title="Walkthrough"
              text="We explain the important parts of your website or system so you understand how it works."
            />

            <HandoverCard
              number="04"
              title="Your next choice"
              text="You can manage the website yourself or continue with StreetGO for maintenance and technical support."
            />

          </div>

        </div>

      </section>

      {/* MAINTENANCE */}

      <section
        className="supportSection"
        id="support"
      >

        <div className="container">

          <div className="sectionLabel">
            04 — MAINTENANCE & SUPPORT
          </div>

          <div className="supportHeader">

            <h2>
              Choose how you want
              <br />
              to <span>manage your website.</span>
            </h2>

            <p>
              There is no confusion after launch. Choose the
              option that works best for your business.
            </p>

          </div>

          <div className="supportGrid">

            <div className="supportCard">

              <div className="supportTag">
                OPTION 01
              </div>

              <h3>
                Self-managed
              </h3>

              <p>
                Your business manages the website after
                the agreed handover.
              </p>

              <ul>
                <li>Website access</li>
                <li>Business control</li>
                <li>Manage your own updates</li>
                <li>No ongoing maintenance requirement</li>
              </ul>

            </div>

            <div className="supportCard recommended">

              <div className="recommendedBadge">
                RECOMMENDED FOR BUSY BUSINESSES
              </div>

              <div className="supportTag">
                OPTION 02
              </div>

              <h3>
                StreetGO Maintenance
              </h3>

              <p>
                Let StreetGO handle ongoing technical work
                while you focus on your business.
              </p>

              <ul>
                <li>Technical maintenance</li>
                <li>Website updates</li>
                <li>Content changes</li>
                <li>Technical support</li>
              </ul>

              <button
                onClick={bookProject}
                className="supportButton"
              >
                ASK ABOUT MAINTENANCE
                <span>↗</span>
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* WHAT WE NEED */}

      <section className="section">

        <div className="container">

          <div className="sectionIntro">

            <div className="sectionLabel">
              05 — GETTING STARTED
            </div>

            <h2>
              What we need
              <br />
              <span>from you.</span>
            </h2>

          </div>

          <div className="requirements">

            <Requirement
              number="01"
              title="Business information"
              text="Your business name, services or products, contact details and the information you want customers to see."
            />

            <Requirement
              number="02"
              title="Brand materials"
              text="Your logo, photos, colours, documents or other material you want included."
            />

            <Requirement
              number="03"
              title="Accounts & services"
              text="Where required, the relevant business accounts, domain information or authorized payment-service details."
            />

            <Requirement
              number="04"
              title="Your approval"
              text="We work with you through the important stages and confirm the final result before launch."
            />

          </div>

        </div>

      </section>

      {/* FAQ */}

      <section
        className="faqSection"
        id="faq"
      >

        <div className="container">

          <div className="sectionLabel">
            06 — FAQ
          </div>

          <div className="faqLayout">

            <div>

              <h2>
                Questions?
                <br />
                <span>We've got answers.</span>
              </h2>

              <p>
                If you still have questions about your project,
                contact us directly.
              </p>

              <button
                className="primaryButton"
                onClick={bookProject}
              >
                TALK TO STREETGO
                <span>↗</span>
              </button>

            </div>

            <div className="faqList">

              {faqs.map((faq, index) => {

                const isOpen = openFaq === index

                return (
                  <div
                    className={`faq ${
                      isOpen ? 'faqOpen' : ''
                    }`}
                    key={faq.question}
                  >

                    <button
                      className="faqQuestion"
                      onClick={() =>
                        setOpenFaq(
                          isOpen ? null : index
                        )
                      }
                    >

                      <span>
                        {faq.question}
                      </span>

                      <span className="faqIcon">
                        {isOpen ? '−' : '+'}
                      </span>

                    </button>

                    {isOpen && (
                      <div className="faqAnswer">
                        {faq.answer}
                      </div>
                    )}

                  </div>
                )
              })}

            </div>

          </div>

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="finalCta">

        <div className="container">

          <div className="finalBox">

            <div className="sectionLabel">
              START YOUR PROJECT
            </div>

            <h2>
              Have a business
              <br />
              <span>to build online?</span>
            </h2>

            <p>
              Tell us what you need and we'll help you
              choose the right digital solution.
            </p>

            <button
              className="primaryButton"
              onClick={bookProject}
            >
              BOOK A PROJECT
              <span>↗</span>
            </button>

            <div className="contactRow">

              <div>
                <small>WHATSAPP</small>
                <strong>0793 397 916</strong>
              </div>

              <div>
                <small>EMAIL</small>
                <strong>tundastreet@gmail.com</strong>
              </div>

              <div>
                <small>WEBSITE</small>
                <strong>streetgo.app</strong>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="container footerInner">

          <a
            href="/services"
            className="brand"
          >
            STREET<span>GO</span>
          </a>

          <span className="footerText">
            DIGITAL SOLUTIONS
          </span>

          <div className="footerLinks">

            <a href="/services">
              Services
            </a>

            <a href="/explore">
              How it works
            </a>

            <a href="#faq">
              FAQ
            </a>

          </div>

        </div>

        <div className="container copyright">
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

        .explorePage {
          min-height: 100vh;
          background: #ffffff;
          color: #151916;
          font-family: 'DM Sans', sans-serif;
        }

        .container {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* NAV */

        .nav {
          position: sticky;
          top: 0;
          z-index: 100;

          background:
            rgba(255,255,255,.94);

          backdrop-filter: blur(16px);

          border-bottom:
            1px solid #e6eae7;
        }

        .navInner {
          height: 72px;

          width: min(1200px, calc(100% - 48px));

          margin: auto;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          color: #111411;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 23px;

          font-weight: 700;

          font-style: italic;

          letter-spacing: -1.5px;

          text-decoration: none;
        }

        .brand span {
          color: #69a900;
        }

        .navLinks {
          display: flex;
          gap: 30px;
        }

        .navLinks a {
          position: relative;

          color: #59635d;

          text-decoration: none;

          font-size: 12px;

          font-weight: 600;
        }

        .navLinks a:hover,
        .navLinks a.active {
          color: #5c9309;
        }

        .navLinks a.active::after {
          content: '';

          position: absolute;

          left: 0;
          right: 0;

          bottom: -27px;

          height: 2px;

          background: #72b000;
        }

        .navCta {
          padding:
            10px
            15px;

          border:
            1px solid
            #6aa600;

          background: white;

          border-radius: 6px;

          color: #5d9208;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1px;

          cursor: pointer;
        }

        .menuButton {
          display: none;

          border: none;

          background: none;

          font-size: 24px;

          cursor: pointer;
        }

        /* HERO */

        .hero {
          border-bottom:
            1px solid
            #e6eae7;

          padding:
            105px
            0
            95px;
        }

        .eyebrow,
        .sectionLabel {
          color: #659d0b;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 2px;
        }

        .hero h1 {
          margin:
            20px
            0
            22px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size:
            clamp(54px, 7vw, 82px);

          line-height: .98;

          letter-spacing: -4px;

          font-weight: 600;
        }

        .hero h1 span,
        h2 span {
          color: #67a500;
        }

        .heroText {
          max-width: 590px;

          color: #667169;

          font-size: 16px;

          line-height: 1.7;
        }

        .heroActions {
          display: flex;

          gap: 10px;

          margin-top: 32px;
        }

        .primaryButton,
        .secondaryButton {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 13px;

          min-height: 44px;

          padding:
            0
            19px;

          border-radius: 6px;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1px;

          text-decoration: none;

          cursor: pointer;
        }

        .primaryButton {
          border: 1px solid #69a900;

          background: #69a900;

          color: white;
        }

        .secondaryButton {
          border:
            1px solid
            #d4d9d5;

          background: white;

          color: #3d4640;
        }

        .primaryButton span,
        .secondaryButton span {
          font-size: 15px;
        }

        /* GENERAL */

        .section {
          padding:
            105px
            0;
        }

        .sectionIntro {
          max-width: 650px;

          margin-bottom: 55px;
        }

        h2 {
          margin:
            16px
            0
            18px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size:
            clamp(38px, 5vw, 55px);

          line-height: 1.04;

          letter-spacing: -2.5px;

          font-weight: 600;
        }

        .sectionIntro > p {
          max-width: 570px;

          color: #707a73;

          font-size: 14px;

          line-height: 1.7;

          margin: 0;
        }

        /* JOURNEY */

        .journey {
          border-top:
            1px solid
            #dfe4e0;
        }

        .journeyItem {
          display: grid;

          grid-template-columns:
            100px
            1fr;

          gap: 30px;

          padding:
            28px
            0;

          border-bottom:
            1px solid
            #e5e9e6;
        }

        .journeyNumber {
          color: #69a800;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 12px;

          font-weight: 700;
        }

        .journeyContent {
          display: grid;

          grid-template-columns:
            300px
            1fr;

          gap: 30px;
        }

        .journeyContent h3 {
          margin: 0;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 19px;

          font-weight: 600;
        }

        .journeyContent p {
          margin: 0;

          max-width: 570px;

          color: #707a73;

          font-size: 12px;

          line-height: 1.65;
        }

        /* PAYMENT */

        .paymentSection {
          padding:
            105px
            0;

          background: #f5f7f5;

          border-top:
            1px solid
            #e4e8e5;

          border-bottom:
            1px solid
            #e4e8e5;
        }

        .paymentLayout {
          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 100px;
        }

        .paymentCopy {
          padding-top: 30px;
        }

        .paymentCopy p {
          color: #667169;

          font-size: 13px;

          line-height: 1.75;
        }

        .paymentFlow {
          margin-top: 30px;

          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          border-top:
            1px solid
            #d8ded9;

          border-left:
            1px solid
            #d8ded9;
        }

        .paymentFlow div {
          padding: 17px;

          display: flex;

          flex-direction: column;

          gap: 7px;

          border-right:
            1px solid
            #d8ded9;

          border-bottom:
            1px solid
            #d8ded9;
        }

        .paymentFlow strong {
          color: #6aa500;

          font-size: 9px;
        }

        .paymentFlow span {
          font-size: 11px;

          font-weight: 600;
        }

        /* HANDOVER */

        .handoverGrid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          border-top:
            1px solid
            #dfe4e0;

          border-left:
            1px solid
            #dfe4e0;
        }

        .handoverCard {
          padding: 25px;

          min-height: 245px;

          border-right:
            1px solid
            #dfe4e0;

          border-bottom:
            1px solid
            #dfe4e0;
        }

        .handoverNumber {
          color: #6aa500;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 10px;

          font-weight: 700;
        }

        .handoverCard h3 {
          margin:
            45px
            0
            10px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 17px;
        }

        .handoverCard p {
          color: #707a73;

          font-size: 10px;

          line-height: 1.65;

          margin: 0;
        }

        /* SUPPORT */

        .supportSection {
          padding:
            105px
            0;

          background: #07100b;

          color: white;
        }

        .supportHeader {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 50px;

          margin-top: 10px;

          margin-bottom: 50px;
        }

        .supportHeader h2 {
          margin: 0;
        }

        .supportHeader p {
          max-width: 350px;

          color: #839087;

          font-size: 12px;

          line-height: 1.7;
        }

        .supportGrid {
          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 15px;
        }

        .supportCard {
          position: relative;

          padding: 32px;

          background: #0b1510;

          border:
            1px solid
            #1d3023;

          border-radius: 8px;
        }

        .supportCard.recommended {
          border-color:
            #659d0c;
        }

        .recommendedBadge {
          position: absolute;

          top: 0;
          right: 20px;

          padding:
            7px
            10px;

          background: #70ad00;

          color: #071006;

          border-radius:
            0
            0
            4px
            4px;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .supportTag {
          color: #77b50c;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 2px;
        }

        .supportCard h3 {
          margin:
            18px
            0
            10px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 25px;
        }

        .supportCard > p {
          max-width: 450px;

          color: #87938b;

          font-size: 11px;

          line-height: 1.6;
        }

        .supportCard ul {
          list-style: none;

          padding: 15px 0 0;

          margin: 15px 0 0;

          border-top:
            1px solid
            #1c2b21;
        }

        .supportCard li {
          padding:
            6px
            0;

          color: #aab3ad;

          font-size: 10px;
        }

        .supportCard li::before {
          content: '✓';

          margin-right: 8px;

          color: #83c900;
        }

        .supportButton {
          margin-top: 20px;

          padding:
            12px
            15px;

          background: #70ad00;

          border: none;

          border-radius: 5px;

          color: #071006;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1px;

          cursor: pointer;
        }

        .supportButton span {
          margin-left: 8px;

          font-size: 14px;
        }

        /* REQUIREMENTS */

        .requirements {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          border-top:
            1px solid
            #dfe4e0;

          border-left:
            1px solid
            #dfe4e0;
        }

        .requirement {
          display: grid;

          grid-template-columns:
            55px
            1fr;

          gap: 20px;

          padding: 25px;

          border-right:
            1px solid
            #dfe4e0;

          border-bottom:
            1px solid
            #dfe4e0;
        }

        .requirementNumber {
          color: #6ba600;

          font-size: 10px;

          font-weight: 800;
        }

        .requirement h3 {
          margin: 0 0 7px;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 16px;
        }

        .requirement p {
          margin: 0;

          color: #717b74;

          font-size: 10px;

          line-height: 1.6;
        }

        /* FAQ */

        .faqSection {
          padding:
            105px
            0;

          background: #f5f7f5;

          border-top:
            1px solid
            #e1e6e2;
        }

        .faqLayout {
          display: grid;

          grid-template-columns:
            .8fr
            1.2fr;

          gap: 100px;

          margin-top: 25px;
        }

        .faqLayout > div:first-child p {
          max-width: 340px;

          color: #707a73;

          font-size: 12px;

          line-height: 1.6;

          margin:
            0
            0
            25px;
        }

        .faqList {
          border-top:
            1px solid
            #d7ddd8;
        }

        .faq {
          border-bottom:
            1px solid
            #d7ddd8;
        }

        .faqQuestion {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding:
            20px
            0;

          border: none;

          background: none;

          color: #202520;

          text-align: left;

          font-family:
            'Space Grotesk',
            sans-serif;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;
        }

        .faqIcon {
          color: #6ca600;

          font-size: 20px;

          font-weight: 400;
        }

        .faqAnswer {
          padding:
            0
            35px
            20px
            0;

          color: #69736c;

          font-size: 11px;

          line-height: 1.7;
        }

        /* FINAL CTA */

        .finalCta {
          padding:
            100px
            0;

          background: #ffffff;
        }

        .finalBox {
          padding:
            70px
            50px;

          background: #07100b;

          color: white;

          border-radius: 8px;

          text-align: center;
        }

        .finalBox h2 {
          margin:
            15px
            0;
        }

        .finalBox p {
          max-width: 500px;

          margin:
            0
            auto
            25px;

          color: #87928a;

          font-size: 13px;

          line-height: 1.6;
        }

        .contactRow {
          margin-top: 50px;

          padding-top: 25px;

          border-top:
            1px solid
            #1d2b21;

          display: flex;

          justify-content: center;

          gap: 60px;
        }

        .contactRow div {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }

        .contactRow small {
          color: #627068;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .contactRow strong {
          font-size: 11px;
        }

        /* FOOTER */

        .footer {
          padding:
            35px
            0
            20px;

          background: #030604;

          color: white;
        }

        .footerInner {
          display: flex;

          align-items: center;

          gap: 18px;
        }

        .footer .brand {
          color: white;
        }

        .footerText {
          color: #5d765e;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 2px;
        }

        .footerLinks {
          margin-left: auto;

          display: flex;

          gap: 25px;
        }

        .footerLinks a {
          color: #77837b;

          text-decoration: none;

          font-size: 9px;
        }

        .copyright {
          margin-top: 30px;

          padding-top: 18px;

          border-top:
            1px solid
            #152018;

          color: #465249;

          font-size: 8px;
        }

        /* RESPONSIVE */

        @media (max-width: 850px) {

          .navLinks {
            display: none;

            position: absolute;

            top: 72px;

            left: 0;
            right: 0;

            padding: 20px 24px;

            background: white;

            border-bottom:
              1px solid
              #e1e5e2;

            flex-direction: column;

            gap: 20px;
          }

          .navLinks.open {
            display: flex;
          }

          .navLinks a.active::after {
            display: none;
          }

          .navCta {
            display: none;
          }

          .menuButton {
            display: block;
          }

          .journeyContent {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .handoverGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .paymentLayout,
          .faqLayout {
            grid-template-columns: 1fr;

            gap: 45px;
          }

          .supportHeader {
            align-items: flex-start;

            flex-direction: column;

            gap: 15px;
          }

        }

        @media (max-width: 600px) {

          .container {
            width:
              calc(100% - 34px);
          }

          .hero {
            padding:
              75px
              0
              70px;
          }

          .hero h1 {
            font-size: 52px;

            letter-spacing: -2.5px;
          }

          .heroActions {
            flex-direction: column;
          }

          .section,
          .paymentSection,
          .supportSection,
          .faqSection,
          .finalCta {
            padding:
              75px
              0;
          }

          h2 {
            font-size: 39px;

            letter-spacing: -1.7px;
          }

          .journeyItem {
            grid-template-columns:
              45px
              1fr;

            gap: 15px;
          }

          .handoverGrid,
          .requirements,
          .supportGrid {
            grid-template-columns: 1fr;
          }

          .handoverCard {
            min-height: auto;
          }

          .paymentFlow {
            grid-template-columns: 1fr;
          }

          .finalBox {
            padding:
              50px
              22px;
          }

          .contactRow {
            flex-direction: column;

            gap: 18px;
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

function HandoverCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <article className="handoverCard">

      <div className="handoverNumber">
        {number}
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

function Requirement({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <article className="requirement">

      <div className="requirementNumber">
        {number}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </article>
  )
}