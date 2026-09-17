const mongoose = require('mongoose')

const assessmentSchema = new mongoose.Schema({
  id: String,
  resume: String,
  jobDescription: String,

  githubUrl: {
  type: String
  },

  resumeAnalysis: {
    type: Object
  },

  jobAnalysis: {
  type: Object
  }, 
  
  skillGapAnalysis: {
  type: Object
  },
  
  
  claimsForVerification: {
  type: Object
},
verificationResults: [
  {
    claim: String,
    status: String,
    confidence: Number,
    evidence: Array,
    limitations: Array
  }
],
  proveItQuestions: [
    {
      question: String,
      reason: String,
      relatedClaim: String,
      relatedSkill: String,

      answer: {
        type: String,
        default: null
      },

      evaluation: {
        score: Number,
        confidence: Number,
        strengths: Array,
        weaknesses: Array,
        explanation: String
      }
    }
],
status: {
    type: String,
    default: "created"
  },
readinessScore: {
  type: Object
},
readinessReport: {
  type: Object
}
})


const Assessment = mongoose.model('Assessment', assessmentSchema)

module.exports = Assessment