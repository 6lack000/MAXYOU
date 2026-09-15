function calculateProveItScore(proveItQuestions) {

  const answeredQuestions = proveItQuestions.filter(
  (question) =>
    question.evaluation &&
    typeof question.evaluation.score === "number" &&
    Number.isFinite(question.evaluation.score)
)

  if (answeredQuestions.length === 0) {
    return {
      score: 0,
      assessed: false
    }
  }

  const totalScore = answeredQuestions.reduce(
    (sum, question) => sum + question.evaluation.score,
    0
  )

  return {
    score: totalScore / answeredQuestions.length,
    assessed: true
  }
}
function calculateJobMatchScore(skillGapAnalysis) {

  const matchedSkills = skillGapAnalysis.matchedSkills || []
  const missingSkills = skillGapAnalysis.missingSkills || []

  const totalRequiredSkills =
    matchedSkills.length + missingSkills.length

  let skillMatchScore = 0

  if (totalRequiredSkills > 0) {
    skillMatchScore =
      (matchedSkills.length / totalRequiredSkills) * 100
  }

  const experienceMatch =
    skillGapAnalysis.experienceMatch?.matchesRequirement

  if (experienceMatch === false) {
    skillMatchScore = skillMatchScore * 0.8
  }

  return skillMatchScore
}

function calculateTechnicalSkillsScore(skillGapAnalysis) {

  const matchedSkills = skillGapAnalysis.matchedSkills || []
  const missingSkills = skillGapAnalysis.missingSkills || []

  const totalSkills =
    matchedSkills.length + missingSkills.length

  if (totalSkills === 0) {
    return 0
  }

  return (matchedSkills.length / totalSkills) * 100
}

function calculateClaimCredibilityScore(verificationResults) {

  if (!verificationResults || verificationResults.length === 0) {
    return 0
  }

  const statusScores = {
    SUPPORTED: 100,
    PARTIALLY_SUPPORTED: 60,
    NO_EVIDENCE: 50,
    NOT_SUPPORTED: 0
  }

  const totalScore = verificationResults.reduce(
    (sum, result) => {
      return sum + (statusScores[result.status] ?? 50)
    },
    0
  )

  return totalScore / verificationResults.length
}

function calculateOverallReadinessScore(
  jobMatchScore,
  technicalSkillsScore,
  claimCredibilityScore,
  proveItResult
) {

  let weightedScore =
    (jobMatchScore * 0.30) +
    (technicalSkillsScore * 0.25) +
    (claimCredibilityScore * 0.20)

  if (proveItResult.assessed) {
    weightedScore += proveItResult.score * 0.25

    return weightedScore
  }

  return weightedScore / 0.75
}

function calculateReadinessScore(assessment) {

  const jobMatchScore = calculateJobMatchScore(
    assessment.skillGapAnalysis
  )

  const technicalSkillsScore = calculateTechnicalSkillsScore(
    assessment.skillGapAnalysis
  )

  const claimCredibilityScore = calculateClaimCredibilityScore(
    assessment.verificationResults
  )

  const proveItResult = calculateProveItScore(
    assessment.proveItQuestions
  )

  const overallScore = calculateOverallReadinessScore(
    jobMatchScore,
    technicalSkillsScore,
    claimCredibilityScore,
    proveItResult
  )

  return {
    overallScore,
    jobMatchScore,
    technicalSkillsScore,
    claimCredibilityScore,
    proveItScore: proveItResult
  }
}


module.exports = {
  calculateProveItScore,
  calculateJobMatchScore,
  calculateTechnicalSkillsScore,
  calculateClaimCredibilityScore,
  calculateOverallReadinessScore,
  calculateReadinessScore
}