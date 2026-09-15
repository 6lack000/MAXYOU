require("dotenv").config()

const { client } = require("./llmClient")

async function analyzeJobDescription(jobDescription) {
    console.log(jobDescription)
    const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Analyze this job description and extract structured information.

Return ONLY valid JSON in exactly this structure:

{
  "title": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "responsibilities": [],
  "technicalRequirements":[],
  "experience": {
    "minYears": null,
    "maxYears": null
  }
}

Rules:
- Only include information explicitly stated in the job description.
- Do not invent or infer requirements.
- Put explicitly required skills in requiredSkills.
- Put explicitly preferred or "nice to have" skills in preferredSkills.
- Include responsibilities explicitly stated in the job description.
- Put explicitly required technical capabilities, knowledge areas, methods, or engineering requirements in technicalRequirements.
- Examples include machine learning, model development, model deployment, data preprocessing, feature engineering, model evaluation, algorithms, system architecture, and monitoring when they are explicitly required.
- Avoid unnecessary duplication between requiredSkills and technicalRequirements.
- A technology or tool should normally go in requiredSkills, while a capability, method, or engineering task should normally go in technicalRequirements.
- Do not duplicate an item in both requiredSkills and technicalRequirements unless the distinction is necessary.
- If experience requirements are not stated, use null.
- Do not add soft skills unless they are explicitly stated.
- Return ONLY JSON. Do not use Markdown or code fences.

Job Description:
${jobDescription}
`
      }
    ]
  })

try {
  return JSON.parse(response.choices[0].message.content)
} catch (error) {
  console.error("Failed to parse AI response:", response.choices[0].message.content)
  throw new Error("Job description analysis returned invalid JSON")
}

}

// analyzeJobDescription(`
// Junior Full Stack Developer

// Requirements:
// - JavaScript
// - React
// - Node.js
// - Express
// - MongoDB
// - REST APIs
// - Git and GitHub
// - Basic system design
// `)
//   .then(result => console.log(result))
//   .catch(error => console.error(error))
module.exports = analyzeJobDescription