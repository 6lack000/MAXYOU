import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ResumeUpload } from "@/components/ui/ResumeUpload"


const App = () => {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [message, setMessage] = useState("")
  const [assessment, setAssessment] = useState(null)
  const [githubUrl, setGithubUrl] = useState("")

  const handleResumeChange = (file)   => {
      console.log("FILE RECEIVED:", file)
      setResume(file)
    }

  const handleSubmit =  async() => {
      console.log("SUBMIT CLICKED")

      console.log(resume)

      const formData = new FormData()
      formData.append("resume", resume)
      formData.append("jobDescription", jobDescription)
      formData.append("githubUrl",githubUrl)
 
      console.log(formData)
      console.log("ABOUT TO FETCH")
      console.log("RESUME:", resume)
      console.log("JOB DESCRIPTION:", jobDescription)
      console.log("githubUrl:", githubUrl)
     
        await   fetch("http://127.0.0.1:4000/upload",{
        method: "POST",
        body: formData
      }).then((response) => response.json())
      .then((data) => {
        console.log("BACKEND DATA:", data)
        console.log("ASSESSMENT:", data.assessment)
        console.log("READINESS SCORE:", data.assessment?.readinessScore)
        setMessage(data.message)
        setAssessment(data.assessment)
      })    

      console.log("FETCH CALLED")
      
    }
  return (
    <>
      <div>
        <ResumeUpload onResumeChange={handleResumeChange} />
      </div>
      <div>
        <textarea  
        value={jobDescription} 
        onChange={(event) => {
          setJobDescription(event.target.value)
        }}
        placeholder="Paste the job description here..."/>
      </div>
      <input
        type="text"
        value={githubUrl}
        onChange={(event) => {
          setGithubUrl(event.target.value)
        }}
        placeholder="GitHub URL (optional)"
      />
      <div>
        <Button onClick={handleSubmit}>submit</Button>
        {assessment && (
    <div>
      <h2>Assessment Results</h2>

      <p>Assessment ID: {assessment.id}</p>

<h3>
  Readiness Score: {
    assessment.readinessScore
      ? assessment.readinessScore.overallScore
      : "Not available"
  }
</h3>
    </div>
)}
        
      </div>
      
    
    </>
  )
}

export default App  