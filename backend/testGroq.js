require("dotenv").config()

const OpenAI = require("openai")

console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY)

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
})
async function test() {
  const response = await client.responses.create({
    model: "openai/gpt-oss-120b",
    input: "Say hello in one short sentence."
  })

  console.log(response.output_text) 
}

test()