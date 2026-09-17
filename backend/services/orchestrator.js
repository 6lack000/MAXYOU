require("dotenv").config()


const analyzeResume = require("./analyzeResume")
const analyzeJobDescription = require("./analyzeJobDescription")
const analyzeSkillGap = require("./analyzeSkillGap")
const {
  getGithubRepositories,
  getGithubFileTree,
  getGithubFileContent,
  batchSelectRepositories,
  batchSelectRelevantFiles
} = require("./githubEvidence")
const { verifyAndGenerateQuestion } = require("./evaluateEvidence")
const { calculateReadinessScore } = require("./calculateReadinessScore")
const generateReadinessReport = require("./generateReadinessReport")

const Assessment = require("../models/Assessment")

async function runAssessment(assessmentId) {
  const assessment = await Assessment.findOne({
    id: assessmentId
  })
   if (!assessment) {
    throw new Error("Assessment not found")
  }

  if (assessment.status === "created") {
    console.time("Resume + JD Analysis")

    const [resumeAnalysis, jobAnalysis] = await Promise.all([
  analyzeResume(assessment.resume),
  analyzeJobDescription(assessment.jobDescription)
  ])
  console.timeEnd("Resume + JD Analysis")

    assessment.resumeAnalysis = resumeAnalysis
    assessment.jobAnalysis = jobAnalysis
    assessment.status = "analyzed"

    await assessment.save()
  }

  // OPTIMIZATION 1: analyzeSkillGap already returns claimsForVerification.
  // No separate selectClaimsForVerification call needed.
  if (assessment.status === "analyzed") {
    console.time("Skill Gap Analysis")

    const skillGapAnalysis = await analyzeSkillGap(
      assessment.resumeAnalysis,
      assessment.jobAnalysis
    )

    console.timeEnd("Skill Gap Analysis")

    assessment.skillGapAnalysis = skillGapAnalysis
    assessment.claimsForVerification = {
      claims: skillGapAnalysis.claimsForVerification
    }
    assessment.status = "claims_selected"

    await assessment.save()
  }

if (assessment.status === "claims_selected") {
  const claims = assessment.claimsForVerification.claims

  if (!assessment.githubUrl) {
    // No GitHub: build NO_EVIDENCE results and generate questions via combined call
    const verificationResults = []
    const proveItQuestions = []

    const jobTitle = assessment.jobAnalysis.title || ""
    const requiredSkills = assessment.jobAnalysis.requiredSkills || []

    for (const claim of claims) {
      console.time("verifyAndGenerateQuestion")
      const result = await verifyAndGenerateQuestion(
        claim.text,
        [],  // no evidence
        jobTitle,
        requiredSkills
      )

      console.timeEnd("verifyAndGenerateQuestion")

      verificationResults.push({
        claim: claim.text,
        ...result.verification
      })

      if (result.proveItQuestion) {
        proveItQuestions.push(result.proveItQuestion)
      }

      console.log("VERIFIED + QUESTION:", claim.text)
    }

    assessment.verificationResults = verificationResults
    assessment.proveItQuestions = proveItQuestions
    
    assessment.status = "awaiting_answers"

    await assessment.save()

    return {
        action: "prove_it",
        verificationResults,
        proveItQuestions
        }
  }

  // ── GitHub path ──────────────────────────────────────────
  console.time("getGithubRepositories")
  const repositories = await getGithubRepositories(
    assessment.githubUrl
  )
  console.timeEnd("getGithubRepositories")

  const username = assessment.githubUrl.split("/")[3]

  // OPTIMIZATION 2: Batch repository selection — 1 LLM call for all claims
  console.time("batchSelectRepositories")
  const repoMapping = await batchSelectRepositories(
    repositories,
    claims
  )
  console.timeEnd("batchSelectRepositories")

  console.log("REPO MAPPING:", repoMapping)

  // Group claims by repository (JavaScript, not LLM)
  const claimsByRepo = {}
  for (const mapping of repoMapping.mappings) {
    const repoName = mapping.repository
    if (!repoName) continue

    // Verify the repository actually exists
    const repoExists = repositories.find(
      (repo) => repo.name === repoName
    )
    if (!repoExists) continue

    if (!claimsByRepo[repoName]) {
      claimsByRepo[repoName] = {
        repository: repoExists,
        claims: []
      }
    }
    claimsByRepo[repoName].claims.push(mapping.claim)
  }

  // Fetch file trees for each unique repository (GitHub API, not LLM)
  const fileTreesByRepo = {}
  for (const repoName of Object.keys(claimsByRepo)) {
    const repo = claimsByRepo[repoName].repository
    console.time("getGithubFileTree")
    fileTreesByRepo[repoName] = await getGithubFileTree(
      username,
      repo.name,
      repo.default_branch
    )
    console.timeEnd("getGithubFileTree")
  }

  // OPTIMIZATION 3: Batch file selection per repository — 1 LLM call per unique repo
  const fileSelectionByRepo = {}
  for (const repoName of Object.keys(claimsByRepo)) {
    const repoClaims = claimsByRepo[repoName].claims
    const files = fileTreesByRepo[repoName]
    
    console.time("batchSelectRelevantFiles")
    const batchResult = await batchSelectRelevantFiles(
      files,
      repoClaims.map((text) => ({ text }))
    )
    console.timeEnd("batchSelectRelevantFiles")

    // Build a lookup: claim text → selected files
    for (const entry of batchResult.claims) {
      fileSelectionByRepo[entry.claim] = {
        repoName: repoName,
        files: entry.files
      }
    }
  }

  console.log("FILE SELECTION:", fileSelectionByRepo)

  // OPTIMIZATION 4: Combined verify + question — 1 LLM call per claim
  const verificationResults = []
  const proveItQuestions = []

  const jobTitle = assessment.jobAnalysis.title || ""
  const requiredSkills = assessment.jobAnalysis.requiredSkills || []

  for (const claim of claims) {
    console.log("VERIFYING CLAIM:", claim.text)

    const selection = fileSelectionByRepo[claim.text]

    if (!selection || selection.files.length === 0) {
      // No files found — call with empty evidence
      console.time("verifyAndGenerateQuestion")
      const result = await verifyAndGenerateQuestion(
        claim.text,
        [],
        jobTitle,
        requiredSkills
      )
      console.timeEnd("verifyAndGenerateQuestion")

      verificationResults.push({
        claim: claim.text,
        ...result.verification
      })

      if (result.proveItQuestion) {
        proveItQuestions.push(result.proveItQuestion)
      }

      console.log("NO FILES - VERIFIED + QUESTION:", claim.text)
      continue
    }

    // Fetch file contents (GitHub API, not LLM)
    const evidence = []
    const repo = claimsByRepo[selection.repoName].repository

    for (const filePath of selection.files) {
      const content = await getGithubFileContent(
        username,
        repo.name,
        filePath,
        repo.default_branch
      )

      evidence.push({
        file: filePath,
        content: content
      })
    }

    console.time("verifyAndGenerateQuestion")
    const result = await verifyAndGenerateQuestion(
      claim.text,
      evidence,
      jobTitle,
      requiredSkills
    )
    console.timeEnd("verifyAndGenerateQuestion")

    verificationResults.push({
      claim: claim.text,
      ...result.verification
    })

    if (result.proveItQuestion) {
      proveItQuestions.push(result.proveItQuestion)
    }

    console.log("VERIFIED + QUESTION:", claim.text)
  }

  console.log("VERIFICATION RESULTS:", verificationResults)
  assessment.verificationResults = verificationResults
  assessment.proveItQuestions = proveItQuestions
  assessment.status = "awaiting_answers"

  await assessment.save()



  return {
    action: "verify_claims",
    verificationResults
  }
}

}
module.exports = runAssessment