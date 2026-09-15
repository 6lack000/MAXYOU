require("dotenv").config()

const { client } = require("./llmClient")

function limitEvidence(evidence, maxTotalCharacters = 8000) {
  if (!evidence || evidence.length === 0) {
    return []
  }

  const charactersPerFile = Math.floor(
    maxTotalCharacters / evidence.length
  )

  return evidence.map((item) => {
    if (item.content.length <= charactersPerFile) {
      return item
    }

    const half = Math.floor(charactersPerFile / 2)

    return {
      file: item.file,
      content:
        item.content.slice(0, half) +
        "\n\n...[CONTENT TRUNCATED]...\n\n" +
        item.content.slice(-half)
    }
  })
}


async function evaluateEvidence(claim, evidence) {
  console.log("EVALUATE EVIDENCE STARTED")

  const limitedEvidence = limitEvidence(evidence)
  console.log(
    "ORIGINAL EVIDENCE CHARACTERS:",
    JSON.stringify(evidence).length
  )
  console.log(
    "EVIDENCE CHARACTERS:",
    JSON.stringify(evidence).length
)

  console.log(
  "LIMITED EVIDENCE CHARACTERS:",
  JSON.stringify(limitedEvidence).length
)

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Evaluate whether the provided repository evidence supports the resume claim.

Return ONLY valid JSON in exactly this structure:

{
  "status": "",
  "confidence": 0,
  "evidence": [],
  "limitations": []
}

Allowed status values:
- SUPPORTED
- PARTIALLY_SUPPORTED
- NOT_SUPPORTED
- NO_EVIDENCE

Rules:
- Evaluate only the provided evidence.
- Do not assume code exists outside the provided evidence.
- Do not treat the resume claim itself as evidence.
- SUPPORTED means the evidence directly demonstrates the important parts of the claim.
- PARTIALLY_SUPPORTED means the evidence supports some important parts but not the complete claim.
- NOT_SUPPORTED means the provided evidence contradicts the claim or demonstrates something materially different.
- NO_EVIDENCE means the provided evidence is insufficient to evaluate the claim.
- Missing evidence must not automatically be treated as NOT_SUPPORTED.
- confidence must be a number between 0 and 1.
- In evidence, explain which provided file supports or fails to support the claim.
- In limitations, explain important missing information or uncertainty.
- Return ONLY JSON.

Resume Claim:
${claim}

Repository Evidence:
${JSON.stringify(limitedEvidence, null, 2)}
`
      }
    ]
  })

  return JSON.parse(response.choices[0].message.content)
}

async function verifyAndGenerateQuestion(claim, evidence, jobTitle, relatedRequirements) {
  console.log("VERIFY AND GENERATE QUESTION STARTED")

  const limitedEvidence = limitEvidence(evidence)
  
  console.log(
  "LIMITED EVIDENCE CHARACTERS:",
  JSON.stringify(limitedEvidence).length
)

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `Evaluate whether the repository evidence supports the resume claim, and generate a Prove-It question if the evidence is insufficient.

Return ONLY valid JSON:

{
  "verification": {
    "status": "",
    "confidence": 0,
    "evidence": [],
    "limitations": []
  },
  "proveItQuestion": {
    "question": "",
    "reason": "",
    "relatedClaim": "",
    "relatedSkill": ""
  }
}

Verification rules:
- Allowed status values: SUPPORTED, PARTIALLY_SUPPORTED, NOT_SUPPORTED, NO_EVIDENCE.
- Evaluate only the provided evidence.
- Do not assume code exists outside the provided evidence.
- confidence must be between 0 and 1.
- In evidence array, briefly explain which file supports or fails to support the claim.
- In limitations, note missing information.

Question rules:
- If status is SUPPORTED, set proveItQuestion to null.
- If status is PARTIALLY_SUPPORTED, NOT_SUPPORTED, or NO_EVIDENCE, generate exactly one question.
- The question must directly test the resume claim.
- Connect the question to the job requirement.
- Do not accuse the candidate.
- Do not invent information.
- relatedClaim must be the exact claim text.
- relatedSkill should be the most relevant job requirement being tested.
- Return ONLY JSON.

Resume Claim:
${claim}

Job Title: ${jobTitle}
Related Requirements: ${JSON.stringify(relatedRequirements)}

Repository Evidence:
${JSON.stringify(limitedEvidence)}`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Failed to parse verify+question response:", response.choices[0].message.content)
    throw new Error("Verify and generate question returned invalid JSON")
  }
}

module.exports = { evaluateEvidence, verifyAndGenerateQuestion }