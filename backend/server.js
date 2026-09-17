require('dotenv').config()

const Assessment = require('./models/Assessment')
const multer = require('multer')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const analyzeResume = require("./services/analyzeResume")
const analyzeJobDescription = require("./services/analyzeJobDescription")
const analyzeSkillGap = require("./services/analyzeSkillGap")
const selectClaimsForVerification = require("./services/selectClaimsForVerification")
const evaluateAnswer = require("./services/evaluateAnswer")
const { calculateReadinessScore } = require("./services/calculateReadinessScore")
const generateReadinessReport = require("./services/generateReadinessReport")
const runAssessment = require("./services/orchestrator")
const app = express()

app.use(cors())

app.use((req, res, next) => {
  console.log("REQUEST RECEIVED:", req.method, req.url)
  next()
})

const PORT = 4000

const upload = multer({ dest: "uploads/" })
const pdfparser = require('pdf-parse')
const fs = require('fs')
const crypto = require('crypto')

app.use(express.json())
app.use(express.text())



app.post("/upload", upload.single("resume"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Resume is required"
      })
    }

    if (!req.body.jobDescription) {
      return res.status(400).json({
        message: "Job description is required"
      })
    }

    const githubUrl = req.body.githubUrl

    console.log("GITHUB URL:", githubUrl)


    // Read uploaded PDF

    const dataBuffer = fs.readFileSync(req.file.path)

    const parser = new pdfparser.PDFParse({
      data: dataBuffer
    })

    const result = await parser.getText()

console.log(`result : ${result}`)
    // // Analyze resume

    // const resumeAnalysis = await analyzeResume(result.text)


    // Analyze job description

    // const jobAnalysis = await analyzeJobDescription(
    //   req.body.jobDescription
    // )


    // Analyze skill gap

    // const skillGapAnalysis = await analyzeSkillGap(
    //   resumeAnalysis,
    //   jobAnalysis
    // )

    // console.log("SKILL GAP:", skillGapAnalysis)


    // Select claims for verification

    // const claimsForVerification = await selectClaimsForVerification(
    //   resumeAnalysis.claims,
    //   jobAnalysis,
    //   skillGapAnalysis
    // )

    // console.log(
    //   "CLAIMS FOR VERIFICATION:",
    //   claimsForVerification
    // )


    // Create assessment

  const assessment = {
  id: crypto.randomUUID(),

  resume: result.text,

  jobDescription: req.body.jobDescription,

  githubUrl: githubUrl,
  status: "created"
}

  console.log(assessment)

    
    // Create MongoDB document

    const newAssessment = new Assessment(assessment)



    // Save assessment

    await newAssessment.save()

    console.log("Assessment saved")


    await runAssessment(newAssessment.id)



    const updatedAssessment = await Assessment.findOne({
      id: newAssessment.id
    })

    console.log("========== FINAL DATABASE ASSESSMENT ==========")
    console.log(   ` UPDATE ASSESMENT${updatedAssessment}`)


    // Send response to frontend

   res.status(200).json({
  assessment: await Assessment.findOne({
    id: newAssessment.id
  }),
})

  } catch (error) {

    console.error("UPLOAD ERROR:", error)

    res.status(500).json({

      message: "Failed to process upload",

      error: error.message

    })

  }

})

app.post("/assessment/:id/answer", async (req, res) => {
  console.log("ANSWER SUBMISSION RECEIVED")

  const assessmentId = req.params.id
  const { question, answer } = req.body

  const assessment = await Assessment.findOne({
    id: assessmentId
  })

  if (!assessment) {
    return res.status(404).json({
      message: "Assessment not found"
    })
  }

  const proveItQuestion = assessment.proveItQuestions.find(
    (q) => q.question === question
  )

  if (!proveItQuestion) {
    return res.status(404).json({
      message: "Question not found"
    })
  }

  const claim = proveItQuestion.relatedClaim

  const verificationResult = assessment.verificationResults.find(
    (result) => result.claim === claim
  )

  // Evaluate the question + candidate answer
  const evaluation = await evaluateAnswer(
    answer,
    question,
    claim,
    verificationResult
  )

  // Save answer and evaluation
  proveItQuestion.answer = answer
  proveItQuestion.evaluation = evaluation

  await assessment.save()

  console.log("ANSWER EVALUATED:", evaluation)

  res.json({
    message: "Answer evaluated successfully",
    evaluation
  })
})

app.post("/assessment/:id/finish", async (req, res) => {
  console.log("FINISH ASSESSMENT RECEIVED")

  try {
    const assessmentId = req.params.id

    const assessment = await Assessment.findOne({
      id: assessmentId
    })

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found"
      })
    }

    const readinessScore = calculateReadinessScore(assessment)

    console.log("FINAL READINESS SCORE:", readinessScore)

    const readinessReport = await generateReadinessReport(
      assessment,
      readinessScore
    )

    assessment.readinessScore = readinessScore
    assessment.readinessReport = readinessReport
    assessment.status = "completed"

    await assessment.save()

    console.log("ASSESSMENT COMPLETED")

    res.json({
      message: "Assessment completed successfully",
      readinessScore,
      readinessReport
    })

  } catch (error) {
    console.error("FINISH ASSESSMENT ERROR:", error)

    res.status(500).json({
      message: "Failed to finish assessment",
      error: error.message
    })
  }
})
app.get("/assessment/:id", async (req, res) => {

  console.log("GET ASSESSMENT ROUTE HIT")
  
  const assessment = await Assessment.findOne({
    id: req.params.id
  })

  console.log("Assessment found:", assessment)

  res.status(200).json({
    assessment
  })

})


mongoose.connect(process.env.mongo_URL)

  .then(() => {

    console.log("MongoDB connected")

  })

  .catch((error) => {

    console.log("MongoDB connection failed", error)

  })


app.listen(PORT, () => {  

  console.log(`server is listening ${PORT}`)

})