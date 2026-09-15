require("dotenv").config()

const { client } = require("./llmClient")


async function getGithubRepositories(githubUrl) {
  const userName = githubUrl.split("/")[3]
console.log(userName)
  const url = `https://api.github.com/users/${userName}/repos`

  const response = await fetch(url)

  const data = await response.json()

  const repositories = data.map((repo) => {
    return {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      html_url: repo.html_url,
      default_branch: repo.default_branch
    }
  })

  return repositories
}
async function getGithubReadme(username, repoName) {
  console.log("1. FUNCTION STARTED")

  const url = `https://api.github.com/repos/${username}/${repoName}/readme`

  

  const response = await fetch(url)

  

  const data = await response.json()



  const readmeResponse = await fetch(data.download_url)

  const readme = await readmeResponse.text()

  

  return readme
}

async function getGithubFileTree(username, repoName, branch) {
  const url = `https://api.github.com/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`

  const response = await fetch(url)

  const data = await response.json()

  console.log(data.tree)

  const files = data.tree.map((item) => {
    return item.path
  })

  const relevantFiles = files.filter((file) => {
  return !file.startsWith("node_modules/")
    && !file.startsWith("dist/")
    && !file.startsWith(".git/")
})
console.log(relevantFiles)
const codeFiles = relevantFiles.filter((file) => {
  return (
    file.endsWith(".js") ||
    file.endsWith(".jsx") ||
    file.endsWith(".ts") ||
    file.endsWith(".tsx") ||
    file.endsWith(".json") ||
    file.endsWith(".css") ||
    file.endsWith(".html")
  )
})
return codeFiles
}

async function selectRelevantFiles(files, claim) {
  console.log("SELECT RELEVANT FILES STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Select the repository files that are most relevant for verifying this resume claim.

Return ONLY valid JSON in exactly this structure:

{
  "files": []
}

Rules:
- Only select files from the provided file list.
- Select files that could contain evidence for the claim.
- Do not invent file paths.
- Select at most 3 files.
- If no files are relevant, return an empty array.
- Return ONLY JSON.

Resume Claim:
${claim}

Repository Files:
${JSON.stringify(files, null, 2)}
`
      }
    ]
  })

  const result = JSON.parse(response.choices[0].message.content)

  return result
}
async function getGithubFileContent(username, repoName, filePath, branch){
  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${filePath}?ref=${branch}`

  const response = await fetch(url)

  const data = await response.json()

  const content = Buffer
  .from(data.content, "base64")
  .toString("utf-8")

  return content  
}

async function selectRelevantRepository(repositories, claim) {
  console.log("SELECT RELEVANT REPOSITORY STARTED")

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `
Select the repository that is most relevant for verifying the resume claim.

Return ONLY valid JSON in exactly this structure:

{
  "repository": ""
}

Rules:
- Select only a repository from the provided list.
- Do not invent a repository name.
- Choose the repository that is most likely to contain evidence for the claim.
- If no repository is relevant, return an empty string.
- Return ONLY JSON.

Resume Claim:
${claim}

Repositories:
${JSON.stringify(repositories, null, 2)}
`
}
]
})

const result = JSON.parse(response.choices[0].message.content)

return result
}

async function batchSelectRepositories(repositories, claims) {
  console.log("BATCH SELECT REPOSITORIES STARTED")

  const repoSummaries = repositories.map((repo) => ({
    name: repo.name,
    description: repo.description,
    language: repo.language
  }))

  const claimTexts = claims.map((claim) => claim.text)

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `Map each resume claim to the most relevant GitHub repository.

Return ONLY valid JSON:

{
  "mappings": [
    {
      "claim": "",
      "repository": ""
    }
  ]
}

Rules:
- One mapping per claim.
- Only use repository names from the provided list.
- Do not invent repository names.
- If no repository is relevant for a claim, set repository to "".
- Return ONLY JSON.

Claims:
${JSON.stringify(claimTexts)}

Repositories:
${JSON.stringify(repoSummaries)}`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Failed to parse batch repository response:", response.choices[0].message.content)
    throw new Error("Batch repository selection returned invalid JSON")
  }
}

async function batchSelectRelevantFiles(files, claims) {
  console.log("BATCH SELECT RELEVANT FILES STARTED")

  const claimTexts = claims.map((claim) =>
    typeof claim === "string" ? claim : claim.text
  )

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: `Select relevant repository files for each resume claim.

Return ONLY valid JSON:

{
  "claims": [
    {
      "claim": "",
      "files": []
    }
  ]
}

Rules:
- One entry per claim.
- Only select files from the provided file list.
- Do not invent file paths.
- Select at most 3 files per claim.
- If no files are relevant for a claim, return an empty array.
- Return ONLY JSON.

Claims:
${JSON.stringify(claimTexts)}

Repository Files:
${JSON.stringify(files)}`
      }
    ]
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Failed to parse batch file selection response:", response.choices[0].message.content)
    throw new Error("Batch file selection returned invalid JSON")
  }
}

module.exports = {
  getGithubRepositories,
  getGithubReadme,
  getGithubFileTree,
  selectRelevantFiles,
  getGithubFileContent,
  selectRelevantRepository,
  batchSelectRepositories,
  batchSelectRelevantFiles
}
// async function test() {
  //   const repositories = [
//     {
//       name: "salon-serene-queue",
//       description: "Queue management application",
//       language: "TypeScript"
//     },
//     {
//       name: "bank-ledger-system",
//       description: "Bank ledger backend",
//       language: "JavaScript"
//     },
//     {
//       name: "authentication-service",
//       description: "Authentication service",
//       language: "JavaScript"
//     }
//   ]

//   const claim =
//     "Built real-time queue sync using Supabase Realtime."

//   const result = await selectRelevantRepository(
//     repositories,
//     claim
//   )

//   console.log(result)
// }

// test()