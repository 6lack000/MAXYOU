require("dotenv").config()

const { client } = require("./llmClient")

async function evaluateAnswer(
  candidateAnswer,
  question,
  claim,
  verificationResult
) {
    const response = await client.chat.completions.create({
  model: "openai/gpt-oss-120b",

  max_tokens: 500,

  response_format: {
    type: "json_object"
  },

  messages: [
    {
      role: "user",
      content: `
Evaluate the candidate's answer to the Prove It question.

Return ONLY valid JSON in exactly this structure:

{
  "score": 0,
  "confidence": 0,
  "strengths": [],
  "weaknesses": [],
  "explanation": ""
}

Rules:
- Score the answer from 0 to 100.
- Confidence must be between 0 and 1.
- Evaluate whether the answer demonstrates actual understanding.
- Compare the answer with the original resume claim.
- Consider what the verification result showed.
- Do not give a high score merely because the answer uses technical terminology.
- Identify technically incorrect or unsupported statements.
- Do not assume information that the candidate did not provide.
- Keep strengths and weaknesses concise.
- Return ONLY JSON.

Prove It Question:
${question}

Resume Claim:
${claim}

Verification Result:
${JSON.stringify(verificationResult, null, 2)}

Candidate Answer:
${candidateAnswer}
`
    }
  ]
})
const result = JSON.parse(
  response.choices[0].message.content
)

return result
}




module.exports = evaluateAnswer

// async function test() {
//   const result = await evaluateAnswer(
//     "I used Supabase Realtime subscriptions to listen for queue changes and update the React state whenever a change occurred.",
    
//     "In SalonQ, how did you handle race conditions or state inconsistencies in the real-time queue?",
    
//     "Built SalonQ with real-time queue sync using Supabase Realtime.",
    
//     {
//       status: "PARTIALLY_SUPPORTED",
//       confidence: 0.6,
//       limitations: [
//         "No clear evidence of the actual queue synchronization logic."
//       ]
//     }
//   )

//   console.log(result)
// }

// test()