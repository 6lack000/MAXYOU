require("dotenv").config()

const { client } = require("./llmClient")


async function selectClaimsForVerification(
  claims,
  jobAnalysis,
  skillGapAnalysis
) {
  console.log("SELECT CLAIMS STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Select the resume claims that should be verified for this specific job.

Return ONLY valid JSON in exactly this structure:

{
  "claims": [
    {
      "text": "",
      "reason": "",
      "relatedSkills": []
    }
  ]
}

Rules:
- Select claims that are relevant to the job OR provide meaningful evidence of the candidate's technical ability.
- Prioritize claims related to required skills and important job responsibilities.
- Consider matched and missing technical requirements when deciding which claims are valuable to verify.
- If there are no claims directly related to the job, select the strongest technical claims from the resume that can still reveal transferable engineering ability.
- Prefer concrete claims about projects, implementations, systems, algorithms, architecture, debugging, scalability, security, or technical decisions.
- Do not select generic skill-list statements such as "Python" or "JavaScript".
- Do not select vague or unverifiable statements.
- Do not invent claims.
- Use the claim text exactly as provided.
- Select between 2 and 5 claims when suitable claims exist.
- Return an empty array only when there are genuinely no meaningful technical claims to verify.


Resume Claims:
${JSON.stringify(claims, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

Skill Gap Analysis:
${JSON.stringify(skillGapAnalysis, null, 2)}
`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Failed to parse AI response:", response.choices[0].message.content)
    throw new Error("Claim selection returned invalid JSON")
  }
}

module.exports = selectClaimsForVerification