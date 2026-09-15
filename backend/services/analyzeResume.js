require("dotenv").config()

const { client } = require("./llmClient")

async function analyzeResume(resumeText) {
  console.log("ANALYZE RESUME STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Analyze this resume and extract structured information.

Return ONLY valid JSON in exactly this structure:

{
  "skills": [],
  "projects": [
    {
      "name": "",
      "technologies": []
    }
  ],
  "experience": [
    {
      "role": "",
      "organization": "",
      "technologies": []
    }
  ],
  "claims": [
    {
      "text": "",
      "category": "",
      "relatedSkills": [],
      "source": ""
    }
  ]
}

Rules:
- Only include information actually present in the resume.
- Do not invent skills, projects, experience, or claims.
- A claim must be a meaningful statement that could potentially be verified later.
- Do not treat generic qualities like "hardworking" as claims.
- Use empty arrays when the resume does not contain that information.
- Keep claim text short.
- Select at most 5 claims.
- Keep each claim under 20 words.
- Keep each claim focused on a concrete technical action or achievement.
- Return ONLY JSON.
- Do not use Markdown or code fences.

Resume:
${resumeText}
`
      }
    ]
  })

  try {
    const output = response.choices[0].message.content

    return JSON.parse(output)

  } catch (error) {
    console.error("FAILED TO PARSE RESUME RESPONSE")

    console.error("RAW AI RESPONSE:")
    console.log(response.choices[0].message.content)

    console.error("PARSE ERROR:")
    console.error(error)

    throw new Error("Resume analysis returned invalid JSON")
  }
}

module.exports = analyzeResume