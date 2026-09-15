import React from "react"

export function ResumeUpload({ onResumeChange }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0]

    console.log("========== FILE INPUT ==========")
    console.log("FILE:", file)
    console.log("FILE NAME:", file?.name)
    console.log("FILE TYPE:", file?.type)
    console.log("FILE SIZE:", file?.size)

    if (file) {
      onResumeChange(file)
    }
  }

  return (
    <div>
      <label htmlFor="resume">
        Resume
      </label>

      <input
        id="resume"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      <p>
        Upload your resume in PDF format.
      </p>
    </div>
  )
}