import { useState } from "react"

function Assessment({ assessment }) {
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [finished, setFinished] = useState(false)
  const [finalResult, setFinalResult] = useState(null)

  const handleAnswerChange = (index, value) => {
    setAnswers((previous) => ({
      ...previous,
      [index]: value
    }))
  }

  const handleAnswerSubmit = async (question, index) => {
    const answer = answers[index]

    if (!answer || !answer.trim()) {
      alert("Please write an answer first.")
      return
    }

    console.log("SUBMITTING ANSWER")
    console.log("QUESTION:", question.question)
    console.log("ANSWER:", answer)

    try {
      const response = await fetch(
        `http://127.0.0.1:4000/assessment/${assessment.id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: question.question,
            answer: answer
          })
        }
      )

      const data = await response.json()

      console.log("ANSWER EVALUATION:", data)

      if (!response.ok) {
        alert(data.message || "Failed to submit answer")
        return
      }

      setEvaluations((previous) => ({
        ...previous,
        [index]: data.evaluation
      }))

      console.log("EVALUATION SAVED:", data.evaluation)

    } catch (error) {
      console.error("ANSWER SUBMIT ERROR:", error)
      alert("Something went wrong while submitting the answer.")
    }
  }

const handleFinishAssessment = async () => {
  console.log("FINISH ASSESSMENT CLICKED")

  try {
    const response = await fetch(
      `http://127.0.0.1:4000/assessment/${assessment.id}/finish`,
      {
        method: "POST"
      }
    )

    const data = await response.json()

    console.log("FINAL ASSESSMENT:", data)

    if (!response.ok) {
      alert(data.message || "Failed to finish assessment")
      return
    }
    setFinalResult(data)
    setFinished(true)

    console.log("FINAL READINESS SCORE:", data.readinessScore)
    console.log("FINAL REPORT:", data.readinessReport)

  } catch (error) {
    console.error("FINISH ASSESSMENT ERROR:", error)
    alert("Something went wrong while finishing the assessment.")
  }
}
  if (!assessment) {
    return <p>Loading assessment...</p>
  }

  return (
    <div>
      <h1>Prove It</h1>

      {assessment.proveItQuestions?.map((question, index) => (
        <div key={index}>
          <h2>Question {index + 1}</h2>

          <p>{question.question}</p>

          <textarea
            value={answers[index] || ""}
            onChange={(event) =>
              handleAnswerChange(index, event.target.value)
            }
            placeholder="Write your answer..."
            rows={6}
          />

          <button
            onClick={() => handleAnswerSubmit(question, index)}
          >
            Submit Answer
          </button>

          {evaluations[index] && (
            <div>
              <h3>Evaluation</h3>

              <p>
                Score: {evaluations[index].score}/100
              </p>

              <p>
                Confidence: {evaluations[index].confidence}
              </p>

              <h4>Strengths</h4>

              <ul>
                {evaluations[index].strengths?.map(
                  (strength, strengthIndex) => (
                    <li key={strengthIndex}>
                      {strength}
                    </li>
                  )
                )}
              </ul>

              <h4>Weaknesses</h4>

              <ul>
                {evaluations[index].weaknesses?.map(
                  (weakness, weaknessIndex) => (
                    <li key={weaknessIndex}>
                      {weakness}
                    </li>
                  )
                )}
              </ul>

              <h4>Explanation</h4>

              <p>
                {evaluations[index].explanation}
              </p>
            </div>
          )}
        </div>
      ))}

      <hr />

      <button onClick={handleFinishAssessment}>
        Finish Assessment
      </button>

      {finished && finalResult && (
        <div>
          <h2>Final Assessment Result</h2>

          <h3>
            Readiness Score:{" "}
            {finalResult.readinessScore.overallScore.toFixed(2)}
          </h3>

          <p>
            Job Match:{" "}
            {finalResult.readinessScore.jobMatchScore.toFixed(2)}
          </p>

          <p>
            Technical Skills:{" "}
            {finalResult.readinessScore.technicalSkillsScore.toFixed(2)}
          </p>

          <p>
            Claim Credibility:{" "}
            {finalResult.readinessScore.claimCredibilityScore.toFixed(2)}
          </p>

          <p>
            Prove-It:{" "}
            {finalResult.readinessScore.proveItScore.score.toFixed(2)}
          </p>

          <h3>Report</h3>

          <p>
            Readiness Level:{" "}
            {finalResult.readinessReport.readinessLevel}
          </p>

          <p>
            {finalResult.readinessReport.jobMatchExplanation}
          </p>

          <p>
            {finalResult.readinessReport.technicalSkillsSummary}
          </p>

          <p>
            {finalResult.readinessReport.claimCredibilitySummary}
          </p>
        </div>
      )}
    </div>
  )
}

export default Assessment