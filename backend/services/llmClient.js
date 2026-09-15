require("dotenv").config()

const OpenAI = require("openai")

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  maxRetries: 2,
  timeout: 60 * 1000
})

module.exports = {
  client
}