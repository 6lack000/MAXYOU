require("dotenv").config()

const { client } = require("./llmClient")

async function analyzeSkillGap(resumeAnalysis, jobAnalysis) {
    console.log("SKILL GAP ANALYSIS STARTED")
    const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Compare the candidate's resume analysis with the job description analysis.

RReturn ONLY valid JSON in exactly this structure:

{
  "matchedSkills": [],
  "missingSkills": [],
  "preferredSkillMatches": [],
  "matchedTechnicalRequirements": [],
  "missingTechnicalRequirements": [],
  "experienceMatch": {
    "matchesRequirement": false,
    "reason": ""
  },
  "claimsForVerification": [
    {
      "text": "",
      "reason": ""
    }
  ]
}

Rules:
- Compare the candidate's skills, experience, and claims with the job requirements.

Rules for claimsForVerification:
-If Resume Analysis contains at least 2 concrete technical claims,
-select at least 2 claims.
- Select claims ONLY from the claims provided in Resume Analysis.
- Select claims that are relevant to the job OR provide meaningful evidence of the candidate's technical ability.
- Prioritize claims connected to required skills, technical requirements, or important responsibilities.
- Consider matched and missing technical requirements when deciding which claims are valuable to verify.
- Consider strong technical claims involving architecture, implementation, concurrency, security, scalability, real-time systems, algorithms, debugging, or technical decision-making.
- Prioritize claims where verification would meaningfully increase confidence in the candidate.
- Do not select generic skill-list statements such as "Python" or "JavaScript".
- Do not select vague or unverifiable statements.
- Do not invent claims.
- Use the claim text exactly as provided in Resume Analysis.
- Select between 2 and 5 claims when suitable claims exist.
- Return an empty array only when there are genuinely no meaningful technical claims to verify.
- For each selected claim, explain why verifying it is useful.
- Return ONLY JSON.

Resume Analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}
`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Failed to parse AI response:", response.choices[0].message.content)
    throw new Error("Skill gap analysis returned invalid JSON")
  }
}

module.exports = analyzeSkillGap