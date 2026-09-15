require("dotenv").config()

const { client } = require("./llmClient")


async function generateQuestion(
  claim,
  jobAnalysis,
  verificationResult,
  skillGap
) {
  console.log("GENERATE QUESTION STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    max_tokens: 1000,

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Generate exactly one targeted "Prove It" question.

Return ONLY valid JSON:

{
  "question": "",
  "reason": "",
  "relatedClaim": "",
  "relatedSkill": ""
}

Rules:
- Ask exactly one question.
- Directly test the resume claim.
- Focus on what the evidence does not clearly prove.
- If verification status is NO_EVIDENCE, ask the candidate to explain the specific implementation or technical decisions behind the claim.
- If verification status is PARTIALLY_SUPPORTED, focus specifically on the unsupported or unclear part of the claim.
- If verification status is NOT_SUPPORTED, ask a neutral question that gives the candidate an opportunity to explain the claimed implementation.
- Connect the question to the job requirements.
- Test actual technical understanding.
- Do not accuse the candidate of lying.
- Do not invent information.
- Do not ask a generic interview question.
- relatedSkill should contain the most relevant job skill or technical requirement being tested. If there is no direct match, use the most relevant transferable technical area.
- Return ONLY JSON.

Resume Claim:
${claim}

Job Requirements:
${JSON.stringify(jobAnalysis)}

Verification:
${JSON.stringify(verificationResult)}

Skill Gap:
${JSON.stringify(skillGap)}
`
      }
    ]
  })


  try {
    const content = response.choices[0].message.content
    return JSON.parse(content)
  } catch (error) {
    console.error(
      "Failed to parse AI response:",
      content
    )

    throw new Error(
      "Question generation returned invalid JSON"
    )
  }
}

module.exports = generateQuestion