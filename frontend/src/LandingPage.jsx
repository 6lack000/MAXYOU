import React, { useEffect, useRef } from 'react'
import './landing.css'

const LandingPage = ({ onStartAssessment }) => {
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing">
      {/* ─── HEADER ─── */}
      <header className="landing-header" id="landing-header">
        <div className="header-inner">
          <a href="/" className="logo" aria-label="MAXYOU home">MAXYOU</a>
          <nav className="header-nav" aria-label="Primary navigation">
            <button onClick={scrollToHow} className="nav-link" type="button">How it works</button>
            <a href="#" className="nav-btn" id="sign-in-btn">Sign in</a>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <p className="hero-label reveal">—&nbsp;&nbsp;AI-POWERED JOB READINESS</p>
          <h1 className="hero-headline reveal">
            PROVE WHAT<br />YOU KNOW.
          </h1>
          <p className="hero-subtitle reveal">Not just what your resume claims.</p>
          <p className="hero-copy reveal">
            Your resume is only the beginning. We verify your skills, examine your evidence, and test what you actually know.
          </p>
          <div className="hero-cta reveal">
            <a onClick={onStartAssessment} className="btn-primary" id="hero-cta-btn">Start assessment&nbsp;&nbsp;→</a>
            <span className="cta-note">Free · No credit card required</span>
          </div>
        </div>
      </section>

      {/* ─── ASSESSMENT JOURNEY ─── */}
      <section className="journey" id="journey">
        <div className="journey-inner reveal">
          <p className="section-label">—&nbsp;&nbsp;ASSESSMENT JOURNEY</p>
          <div className="journey-track">
            <div className="journey-line" aria-hidden="true"></div>
            {[
              { num: '01', title: 'Resume', desc: 'Parsed & analyzed' },
              { num: '02', title: 'Job Match', desc: 'Skills mapped' },
              { num: '03', title: 'Evidence', desc: 'Claims verified' },
              { num: '04', title: 'Prove It', desc: 'Knowledge tested' },
              { num: '05', title: 'Readiness', desc: 'Report generated' },
            ].map((step) => (
              <div className="journey-node" key={step.num}>
                <span className="journey-dot" aria-hidden="true"></span>
                <span className="journey-num">{step.num}</span>
                <span className="journey-title">{step.title}</span>
                <span className="journey-desc">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TAGLINE BAR ─── */}
      <section className="tagline-bar reveal">
        <div className="tagline-inner">
          <div className="tagline-text">
            <p className="tagline-main">Every step is evidence-based.</p>
            <p className="tagline-sub">Not generated. Not guessed.</p>
          </div>
          <a onClick={onStartAssessment} className="btn-outline" id="tagline-cta-btn">Start assessment&nbsp;&nbsp;→</a>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how" id="how-it-works">
        <div className="how-inner">
          <p className="section-label reveal">—&nbsp;&nbsp;HOW IT WORKS</p>
          <h2 className="how-headline reveal">Four steps.<br />Real results.</h2>
          <div className="how-grid">
            {[
              {
                num: '01',
                title: 'Upload',
                text: 'Upload your resume and the job description. MAXYOU parses both — mapping what you claim against what the role actually demands.',
              },
              {
                num: '02',
                title: 'Verify',
                text: 'Analyze skills and verify important resume claims using available evidence — GitHub repositories, project links, and work samples.',
              },
              {
                num: '03',
                title: 'Prove It',
                text: 'Answer targeted questions based on your claims, job requirements, and the evidence found. No multiple choice. Real answers.',
              },
              {
                num: '04',
                title: 'Get Your Report',
                text: 'Receive a job-readiness score and detailed explanation of strengths, weaknesses, and where to improve before the interview.',
              },
            ].map((step) => (
              <div className="how-card reveal" key={step.num}>
                <span className="how-num">{step.num}</span>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIFFERENTIATION ─── */}
      <section className="diff" id="differentiation">
        <div className="diff-inner">
          <p className="section-label reveal">—&nbsp;&nbsp;THE DIFFERENCE</p>
          <div className="diff-layout">
            <div className="diff-left reveal">
              <h2 className="diff-headline">
                Most hiring tools match resumes to jobs.<br />
                <span className="diff-accent">MAXYOU goes further.</span>
              </h2>
            </div>
            <div className="diff-right reveal">
              <div className="diff-steps">
                {[
                  { label: 'Match the claim.', desc: 'Align what you say with what the job requires.' },
                  { label: 'Find the evidence.', desc: 'Surface real proof from GitHub, projects, and work history.' },
                  { label: 'Test the skill.', desc: 'Ask targeted questions only you can answer.' },
                  { label: 'Measure the readiness.', desc: 'Produce a clear, evidence-backed readiness score.' },
                ].map((item, i) => (
                  <div className="diff-step" key={i}>
                    <p className="diff-step-label">{item.label}</p>
                    <p className="diff-step-desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SAMPLE REPORT ─── */}
      <section className="report" id="sample-report">
        <div className="report-inner">
          <p className="section-label reveal">—&nbsp;&nbsp;SAMPLE REPORT</p>
          <div className="report-card reveal">
            <div className="report-header">
              <div>
                <h3 className="report-title">Job Readiness Report</h3>
                <p className="report-meta">Senior Frontend Engineer · Accel Corp</p>
              </div>
              <div className="report-score-block">
                <span className="report-score">84</span>
                <span className="report-score-max">/ 100</span>
              </div>
            </div>
            <div className="report-skills">
              {[
                { name: 'React & Component Architecture', score: 92, status: 'Verified', pct: 92 },
                { name: 'TypeScript', score: 88, status: 'Verified', pct: 88 },
                { name: 'System Design', score: 71, status: 'Partial', pct: 71 },
                { name: 'Performance Optimization', score: 65, status: 'Needs work', pct: 65 },
                { name: 'Testing & QA', score: 58, status: 'Gap found', pct: 58 },
              ].map((skill) => (
                <div className="report-row" key={skill.name}>
                  <span className="report-skill-name">{skill.name}</span>
                  <div className="report-bar-wrap">
                    <div className="report-bar" style={{ width: `${skill.pct}%` }}></div>
                  </div>
                  <span className="report-skill-score">{skill.score}</span>
                  <span className={`report-badge ${skill.status === 'Verified' ? 'badge-verified' : skill.status === 'Partial' ? 'badge-partial' : 'badge-gap'}`}>
                    {skill.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="report-summary">
              <p>
                <strong>Summary:</strong> Strong fundamentals in React and TypeScript verified through GitHub activity. Gap identified in testing discipline — recommend focusing on Jest/Vitest patterns before the interview. System design answers were solid in scope but lacked depth on trade-off reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="final-cta" id="final-cta">
        <div className="final-cta-inner">
          <p className="section-label section-label--light reveal">—&nbsp;&nbsp;GET STARTED&nbsp;&nbsp;—</p>
          <h2 className="final-cta-headline reveal">
            Ready to prove<br />your skills?
          </h2>
          <p className="final-cta-sub reveal">Stop letting your resume speak for you. Let your knowledge do it.</p>
          <a onClick={onStartAssessment} className="btn-primary btn-primary--light reveal" id="final-cta-btn">Start assessment&nbsp;&nbsp;→</a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="footer-logo">MAXYOU</span>
          <span className="footer-copy">© 2026 MAXYOU · Prove what you know.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
