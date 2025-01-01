import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function JoinRequest() {
  const { projectId } = useParams(); // Capture projectId from URL
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    student_name: "",
    prn: "",
    email_id: "",
    department: "",
    contribution: "",
    resume: null,
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
  };

  const handleSubmit = async (event) => {
  setIsLoading(true);
  event.preventDefault();

  try {
    // Validate the student by sending the student name to the backend
    const validateResponse = await axios.post(
      "http://localhost:8080/validate_student",
      {
        student_name: formData.student_name,
      }
    );

    console.log("Validation Response:", validateResponse); // Log entire response object

    // If the student is valid, proceed to submit the join request
    if (validateResponse.data.isValid) {
      // Proceed with join request submission
      const joinRequest = new FormData();
      joinRequest.append("student_name", formData.student_name);
      joinRequest.append("prn", formData.prn);
      joinRequest.append("email_id", formData.email_id);
      joinRequest.append("department", formData.department);
      joinRequest.append("contribution", formData.contribution);
      joinRequest.append("resume", formData.resume);
      joinRequest.append("project_id", projectId);

      const submitResponse = await axios.post(
        "http://localhost:8080/join_team_request",
        joinRequest,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (submitResponse.data.success) {
        setResponse("Request has been sent successfully.");
      } else {
        setResponse(submitResponse.data.message);
      }
    } else {
      setResponse(validateResponse.data.message || "Please sign up first.");
    }
  } catch (error) {
    setIsLoading(false);
    if (error.response && error.response.data && error.response.data.message) {
      setResponse(error.response.data.message); // Show server message if available
    } else {
      setResponse("Error submitting request.");
    }
    console.error("Error submitting form:", error);
  }
};

  return (
    <section>
      <div className="dark:bg-slate-700 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <h2 className="text-center text-2xl font-bold leading-tight text-black dark:text-white">
            Request to Join Team
          </h2>

          <form onSubmit={handleSubmit} method="POST" className="mt-8 text-gray-900 dark:text-slate-200">
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400"
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
              </div>

              {/* PRN */}
              <div>
                <label htmlFor="prn" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  PRN
                </label>
                <input
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400"
                  type="text"
                  name="prn"
                  value={formData.prn}
                  onChange={handleChange}
                  placeholder="PRN"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400"
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                  placeholder="Email Address"
                />
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Department
                </label>
                <select
                  required
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              {/* Contribution */}
              <div>
                <label htmlFor="contribution" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  How would you like to contribute?
                </label>
                <textarea
                  name="contribution"
                  value={formData.contribution}
                  onChange={handleChange}
                  rows="3"
                  className="flex h-20 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400"
                  placeholder="Your Contribution"
                />
              </div>

              {/* Resume */}
              <div>
                <label htmlFor="resume" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Resume (optional)
                </label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleFileChange}
                  className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-block bg-blue-500 px-5 py-3 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
            >
                Submit Request
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">{response}</div>
        </div>
      </div>
    </section>
  );
}
