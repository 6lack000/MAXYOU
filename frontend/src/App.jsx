// import React, { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { ResumeUpload } from "@/components/ui/ResumeUpload"
// import Assessment from "./Assessment"

// const App = () => {
//   const [resume, setResume] = useState(null)
//   const [jobDescription, setJobDescription] = useState("")
//   const [message, setMessage] = useState("")
//   const [assessment, setAssessment] = useState(null)
//   const [githubUrl, setGithubUrl] = useState("")

//   const handleResumeChange = (file) => {
//     console.log("FILE RECEIVED:", file)
//     setResume(file)
//   }

//   const handleSubmit = async () => {
//     console.log("SUBMIT CLICKED")

//     console.log(resume)

//     const formData = new FormData()

//     formData.append("resume", resume)
//     formData.append("jobDescription", jobDescription)
//     formData.append("githubUrl", githubUrl)

//     console.log(formData)
//     console.log("ABOUT TO FETCH")
//     console.log("RESUME:", resume)
//     console.log("JOB DESCRIPTION:", jobDescription)
//     console.log("githubUrl:", githubUrl)

//     await fetch("http://127.0.0.1:4000/upload", {
//       method: "POST",
//       body: formData
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("BACKEND DATA:", data)
//         console.log("ASSESSMENT:", data.assessment)
//         console.log(
//           "READINESS SCORE:",
//           data.assessment?.readinessScore
//         )

//         setMessage(data.message)
//         setAssessment(data.assessment)
//       })

//     console.log("FETCH CALLED")
//   }

//   return (
//     <>
//       <div>
//         <ResumeUpload onResumeChange={handleResumeChange} />
//       </div>

//       <div>
//         <textarea
//           value={jobDescription}
//           onChange={(event) => {
//             setJobDescription(event.target.value)
//           }}
//           placeholder="Paste the job description here..."
//         />
//       </div>

//       <input
//         type="text"
//         value={githubUrl}
//         onChange={(event) => {
//           setGithubUrl(event.target.value)
//         }}
//         placeholder="GitHub URL (optional)"
//       />

//       <div>
//         <Button onClick={handleSubmit}>
//           submit
//         </Button>

//         {assessment && (
//           <Assessment assessment={assessment} />
//         )}
//       </div>
//     </>
//   )
// }

// export default App
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ResumeUpload } from "@/components/ui/ResumeUpload"
import Assessment from "./Assessment"
import "./assessment.css"

const App = () => {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [message, setMessage] = useState("")
  const [assessment, setAssessment] = useState(null)
  const [githubUrl, setGithubUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResumeChange = (file) => {
    console.log("FILE RECEIVED:", file)
    setResume(file)
  }

  const handleSubmit = async () => {
    if (!resume) {
      alert("Please upload your resume.")
      return
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.")
      return
    }

    console.log("SUBMIT CLICKED")

    const formData = new FormData()

    formData.append("resume", resume)
    formData.append("jobDescription", jobDescription)
    formData.append("githubUrl", githubUrl)

    setLoading(true)

    try {
      const response = await fetch(
        "http://127.0.0.1:4000/upload",
        {
          method: "POST",
          body: formData
        }
      )

      const data = await response.json()

      console.log("BACKEND DATA:", data)

      if (!response.ok) {
        alert(data.message || "Something went wrong.")
        return
      }

      setMessage(data.message)
      setAssessment(data.assessment)

    } catch (error) {
      console.error("SUBMIT ERROR:", error)
      alert("Unable to connect to the backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="assessment-page">

      {/* HEADER */}
      <header className="assessment-header">
        <div className="assessment-header-inner">
          <a href="/" className="assessment-logo">
            MAXYOU
          </a>

          <span className="assessment-header-label">
            JOB READINESS ASSESSMENT
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="assessment-main">

        <div className="assessment-container">

          {/* INTRO */}
          <div className="assessment-intro">
            <p className="assessment-label">
              —&nbsp;&nbsp;START YOUR ASSESSMENT
            </p>

            <h1>
              Show us what<br />
              you know.
            </h1>

            <p className="assessment-description">
              Upload your resume and the job description.
              We'll analyze your skills, verify your claims,
              and test what you actually know.
            </p>
          </div>

          {/* FORM */}
          <div className="assessment-form">

            {/* RESUME */}
            <div className="form-section">

              <div className="form-heading">
                <span>01</span>
                <div>
                  <h2>Your resume</h2>
                  <p>Upload your latest resume in PDF format.</p>
                </div>
              </div>

              <div className="resume-upload-wrapper">
                <ResumeUpload
                  onResumeChange={handleResumeChange}
                />
              </div>

              {resume && (
                <p className="file-selected">
                  ✓ {resume.name}
                </p>
              )}

            </div>

            {/* JOB DESCRIPTION */}
            <div className="form-section">

              <div className="form-heading">
                <span>02</span>
                <div>
                  <h2>Job description</h2>
                  <p>Paste the job description you're applying for.</p>
                </div>
              </div>

              <textarea
                className="assessment-textarea"
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value)
                }}
                placeholder="Paste the job description here..."
                rows={9}
              />

            </div>

            {/* GITHUB */}
            <div className="form-section">

              <div className="form-heading">
                <span>03</span>
                <div>
                  <h2>GitHub</h2>
                  <p>
                    Optional. We'll use it to verify relevant claims.
                  </p>
                </div>
              </div>

              <input
                className="assessment-input"
                type="text"
                value={githubUrl}
                onChange={(event) => {
                  setGithubUrl(event.target.value)
                }}
                placeholder="https://github.com/username"
              />

            </div>

            {/* SUBMIT */}
            <div className="assessment-submit">

              <Button
                className="assessment-submit-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Begin assessment  →"}
              </Button>

              <p>
                Your information is used only for this assessment.
              </p>

            </div>

          </div>

          {message && !assessment && (
            <p className="assessment-message">
              {message}
            </p>
          )}

          {/* EXISTING ASSESSMENT */}
          {assessment && (
            <Assessment assessment={assessment} />
          )}

        </div>

      </main>

    </div>
  )
}

export default App