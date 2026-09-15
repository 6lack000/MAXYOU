/**
 * Performance Benchmark Script for MAXYOU Backend
 * Measures response times for the /upload endpoint and individual service steps
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')

// ── Timing helpers ──────────────────────────────────────────

const timers = {}
const results = []

function startTimer(label) {
  timers[label] = process.hrtime.bigint()
}

function endTimer(label) {
  const elapsed = Number(process.hrtime.bigint() - timers[label]) / 1e6 // ms
  results.push({ step: label, timeMs: elapsed })
  console.log(`⏱  ${label}: ${elapsed.toFixed(0)}ms`)
  return elapsed
}

// ── Load services ───────────────────────────────────────────

const analyzeResume = require('./services/analyzeResume')
const analyzeJobDescription = require('./services/analyzeJobDescription')
const analyzeSkillGap = require('./services/analyzeSkillGap')
const selectClaimsForVerification = require('./services/selectClaimsForVerification')
const { calculateReadinessScore } = require('./services/calculateReadinessScore')
const generateQuestion = require('./services/generateQuestion')
const generateReadinessReport = require('./services/generateReadinessReport')

// ── Sample data ─────────────────────────────────────────────

const sampleResume = `
John Doe
Full Stack Developer

Skills: JavaScript, React, Node.js, Express, MongoDB, Python, Docker, AWS

Projects:
- Built a real-time chat application using Socket.io and React with 1000+ concurrent users
- Developed a REST API for an e-commerce platform handling 10K daily transactions
- Created a CI/CD pipeline using GitHub Actions and Docker for automated deployment

Experience:
- Software Engineer at TechCorp (2022-2024)
  - Led development of microservices architecture handling 50K RPM
  - Implemented Redis caching reducing API response time by 60%
  - Built automated testing pipeline with 90% code coverage

Education:
- B.Tech Computer Science, IIT Delhi (2022)
`

const sampleJobDescription = `
Junior Full Stack Developer

Requirements:
- JavaScript
- React
- Node.js
- Express
- MongoDB
- REST APIs
- Git and GitHub
- Basic system design

Preferred:
- Docker
- AWS or cloud experience
- CI/CD knowledge
- Testing experience

Responsibilities:
- Build and maintain web applications
- Write clean, testable code
- Participate in code reviews
- Collaborate with team members
`

// ── Main benchmark ──────────────────────────────────────────

async function runBenchmark() {
  console.log('\n' + '='.repeat(60))
  console.log('  MAXYOU Backend Performance Benchmark')
  console.log('='.repeat(60) + '\n')

  let resumeAnalysis, jobAnalysis, skillGapAnalysis, claimsForVerification

  // Step 1: Analyze Resume
  try {
    startTimer('1. analyzeResume')
    resumeAnalysis = await analyzeResume(sampleResume)
    endTimer('1. analyzeResume')
  } catch (err) {
    endTimer('1. analyzeResume')
    console.error('   ❌ analyzeResume failed:', err.message)
    return
  }

  // Step 2: Analyze Job Description
  try {
    startTimer('2. analyzeJobDescription')
    jobAnalysis = await analyzeJobDescription(sampleJobDescription)
    endTimer('2. analyzeJobDescription')
  } catch (err) {
    endTimer('2. analyzeJobDescription')
    console.error('   ❌ analyzeJobDescription failed:', err.message)
    return
  }

  // Step 3: Analyze Skill Gap
  try {
    startTimer('3. analyzeSkillGap')
    skillGapAnalysis = await analyzeSkillGap(resumeAnalysis, jobAnalysis)
    endTimer('3. analyzeSkillGap')
  } catch (err) {
    endTimer('3. analyzeSkillGap')
    console.error('   ❌ analyzeSkillGap failed:', err.message)
    return
  }

  // Step 4: Select Claims for Verification
  try {
    startTimer('4. selectClaimsForVerification')
    claimsForVerification = await selectClaimsForVerification(
      resumeAnalysis.claims,
      jobAnalysis,
      skillGapAnalysis
    )
    endTimer('4. selectClaimsForVerification')
  } catch (err) {
    endTimer('4. selectClaimsForVerification')
    console.error('   ❌ selectClaimsForVerification failed:', err.message)
    return
  }

  // Step 5: Generate Questions (no GitHub, per claim - sequential)
  const claims = claimsForVerification.claims || []
  try {
    startTimer('5. generateQuestions (all claims, sequential)')
    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i]
      startTimer(`   5.${i + 1} generateQuestion - "${claim.text?.substring(0, 40)}..."`)
      const verificationResult = {
        claim: claim.text,
        status: 'NO_EVIDENCE',
        confidence: 0,
        evidence: [],
        limitations: ['Benchmark test - no GitHub URL provided.']
      }
      await generateQuestion(claim.text, jobAnalysis, verificationResult, skillGapAnalysis)
      endTimer(`   5.${i + 1} generateQuestion - "${claim.text?.substring(0, 40)}..."`)
    }
    endTimer('5. generateQuestions (all claims, sequential)')
  } catch (err) {
    endTimer('5. generateQuestions (all claims, sequential)')
    console.error('   ❌ generateQuestions failed:', err.message)
  }

  // Step 6: Calculate Readiness Score (local, no AI)
  try {
    startTimer('6. calculateReadinessScore (local)')
    const mockAssessment = {
      skillGapAnalysis,
      verificationResults: claims.map(c => ({
        claim: c.text,
        status: 'NO_EVIDENCE',
        confidence: 0,
        evidence: [],
        limitations: []
      })),
      proveItQuestions: claims.map(c => ({
        question: 'test',
        relatedClaim: c.text
      }))
    }
    calculateReadinessScore(mockAssessment)
    endTimer('6. calculateReadinessScore (local)')
  } catch (err) {
    endTimer('6. calculateReadinessScore (local)')
    console.error('   ❌ calculateReadinessScore failed:', err.message)
  }

  // Step 7: Generate Readiness Report
  try {
    startTimer('7. generateReadinessReport')
    const mockAssessment = {
      skillGapAnalysis,
      verificationResults: claims.map(c => ({
        claim: c.text,
        status: 'NO_EVIDENCE',
        confidence: 0,
        evidence: [],
        limitations: []
      })),
      proveItQuestions: claims.map(c => ({
        question: 'test',
        relatedClaim: c.text
      })),
      jobAnalysis,
      resumeAnalysis
    }
    const readinessScore = calculateReadinessScore(mockAssessment)
    await generateReadinessReport(mockAssessment, readinessScore)
    endTimer('7. generateReadinessReport')
  } catch (err) {
    endTimer('7. generateReadinessReport')
    console.error('   ❌ generateReadinessReport failed:', err.message)
  }

  // ── Summary ─────────────────────────────────────────────

  console.log('\n' + '='.repeat(60))
  console.log('  BENCHMARK RESULTS SUMMARY')
  console.log('='.repeat(60))

  const mainSteps = results.filter(r => !r.step.startsWith('   '))
  const totalTime = mainSteps.reduce((sum, r) => sum + r.timeMs, 0)

  console.log('\n┌─────────────────────────────────────────────────┬──────────┐')
  console.log('│ Step                                            │ Time     │')
  console.log('├─────────────────────────────────────────────────┼──────────┤')

  for (const r of mainSteps) {
    const name = r.step.padEnd(49)
    const time = `${(r.timeMs / 1000).toFixed(1)}s`.padStart(8)
    const pct = ((r.timeMs / totalTime) * 100).toFixed(0)
    console.log(`│ ${name} │ ${time} │  ${pct}%`)
  }

  console.log('├─────────────────────────────────────────────────┼──────────┤')
  console.log(`│ ${'TOTAL'.padEnd(49)} │ ${(totalTime / 1000).toFixed(1) + 's'.padStart(1).padStart(8)} │`)
  console.log('└─────────────────────────────────────────────────┴──────────┘')

  // AI calls breakdown
  const aiSteps = mainSteps.filter(r => !r.step.includes('(local)'))
  const aiTime = aiSteps.reduce((sum, r) => sum + r.timeMs, 0)
  const localTime = totalTime - aiTime

  console.log(`\n📊 AI API calls: ${(aiTime / 1000).toFixed(1)}s (${((aiTime / totalTime) * 100).toFixed(0)}% of total)`)
  console.log(`📊 Local compute: ${(localTime / 1000).toFixed(1)}s (${((localTime / totalTime) * 100).toFixed(0)}% of total)`)

  // Parallelizable steps
  console.log('\n🔍 Key Insight: Steps 1 & 2 can run in PARALLEL (currently sequential)')
  if (mainSteps.length >= 2) {
    const step1 = mainSteps.find(r => r.step.startsWith('1.'))
    const step2 = mainSteps.find(r => r.step.startsWith('2.'))
    if (step1 && step2) {
      const saving = Math.min(step1.timeMs, step2.timeMs)
      console.log(`   Potential savings: ~${(saving / 1000).toFixed(1)}s`)
    }
  }

  console.log('\n🔍 Key Insight: Individual question generation calls are sequential per claim')
  const questionSteps = results.filter(r => r.step.includes('generateQuestion'))
  if (questionSteps.length > 1) {
    const qTime = questionSteps
      .filter(r => r.step.startsWith('   '))
      .reduce((sum, r) => sum + r.timeMs, 0)
    const maxQ = Math.max(...questionSteps.filter(r => r.step.startsWith('   ')).map(r => r.timeMs))
    const saving = qTime - maxQ
    console.log(`   Current: ${(qTime / 1000).toFixed(1)}s sequential → Could be ~${(maxQ / 1000).toFixed(1)}s parallel`)
    console.log(`   Potential savings: ~${(saving / 1000).toFixed(1)}s`)
  }

  console.log('\n')
  process.exit(0)
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err)
  process.exit(1)
})
