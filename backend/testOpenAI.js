require("dotenv").config()

console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY)

const OpenAI = require("openai")

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY 
})

async function test() {
  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    input: "Say hello in one sentence."
  })

  console.log(response.output_text)
}

test()