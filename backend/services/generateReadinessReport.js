require("dotenv").config()

const { client } = require("./llmClient")

async function generateReadinessReport(assessment, readinessScore) {

  console.log("GENERATE READINESS REPORT STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Generate a concise candidate readiness report for the specific job.

Return ONLY valid JSON in exactly this structure:

{
  "readinessLevel": "",
  "jobMatchExplanation": "",
  "technicalSkillsSummary": "",
  "claimCredibilitySummary": "",
  "proveItPerformanceSummary": "",
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}

Rules:
- Use ONLY the information provided below.
- Do not invent skills, experience, projects, evidence, or candidate behavior.
- Do not recalculate or change the provided scores.
- Do not treat NO_EVIDENCE as proof that a candidate lied.
- Distinguish NO_EVIDENCE from NOT_SUPPORTED.
- If Prove-It questions have not been answered, say that Prove-It performance has not yet been assessed.
- Keep strengths, weaknesses, and recommendations specific to this job.
- Recommendations should be actionable.
- Keep the report concise.
- Return ONLY JSON.
- Do not use Markdown or code fences.

Readiness Scores:
${JSON.stringify(readinessScore, null, 2)}

Skill Gap Analysis:
${JSON.stringify(assessment.skillGapAnalysis, null, 2)}

Verification Results:
${JSON.stringify(assessment.verificationResults, null, 2)}

Prove-It Questions:
${JSON.stringify(assessment.proveItQuestions, null, 2)}

Job Analysis:
${JSON.stringify(assessment.jobAnalysis, null, 2)}

Resume Analysis:
${JSON.stringify(assessment.resumeAnalysis, null, 2)}
`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("FAILED TO PARSE READINESS REPORT")

    console.error("RAW AI RESPONSE:")
    console.log(response.choices[0].message.content)

    throw new Error("Readiness report returned invalid JSON")
  }
}

module.exports = generateReadinessReport