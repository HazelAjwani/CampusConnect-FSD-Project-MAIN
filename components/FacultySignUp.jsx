import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import axios from "axios";
import Loading from "./Loading";

export default function FacultySignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email_id: "",
    department: "",
    area_of_interest: [],
    designation: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [areaOfInt, setAreaOfInt] = useState([]);
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const applyAreaOfInterest = async () => {
      try {
        const r = await axios.get("http://localhost:8080/all_areas");
        setAreaOfInt(r.data || []); // Fallback to an empty array if no data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    applyAreaOfInterest();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const combinedAreaOfInterest = [
      formData.area_of_interest[0],
      formData.area_of_interest[1],
    ];
    
    const updatedFormData = { ...formData, area_of_interest: combinedAreaOfInterest };

    console.log("Form Data:", formData); // Debugging line
  
    try {
      const r = await axios.post("http://localhost:8080/create_faculty", formData);
      const data = r.data;
  
      setResponse(data.message || "Sign up successful");
      if (data.message === "Faculty sign up successful") {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setResponse(error.response.data.message);
      } else {
        setResponse("An error occurred. Please try again.");
      }
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleAreaOfInterestChange = (event, index) => {
    const value = event.target.value;
    const updatedAreaOfInterest = [...formData.area_of_interest];
    updatedAreaOfInterest[index] = value;
    setFormData({ ...formData, area_of_interest: updatedAreaOfInterest });
  };

  return (
    <section>
      <div className="dark:bg-slate-700 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <h2 className="text-center text-2xl font-bold leading-tight text-black dark:text-white">
            Sign up to create faculty account
          </h2>
          <form onSubmit={handleSubmit} method="POST" className="mt-8 text-gray-900 dark:text-slate-200">
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    required
                    onChange={handleChange}
                    value={formData.name}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    placeholder="Full Name"
                    id="name"
                    name="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    value={formData.email_id}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email"
                    placeholder="Email"
                    id="email"
                    name="email_id"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="department" className="text-base font-medium text-gray-900 dark:text-slate-200">
                    Department
                  </label>
                </div>
                <div className="mt-2">
                  <select
                    onChange={handleChange}
                    value={formData.department}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    id="dept"
                    name="department"
                  >
                    <option value="">Select your department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Science">Information Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="area-of-interest-1" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  First Area of Interest
                </label>
                <div className="mt-2">
                  <select
                    required
                    name="area_of_interest"
                    id="area-of-interest-1"
                    value={formData.area_of_interest[0] || ""}
                    onChange={(e) => handleAreaOfInterestChange(e, 0)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select First Area of Interest</option>
                    {areaOfInt.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="area-of-interest-2" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Second Area of Interest
                </label>
                <div className="mt-2">
                  <select
                    required
                    name="area_of_interest"
                    id="area-of-interest-2"
                    value={formData.area_of_interest[1] || ""}
                    onChange={(e) => handleAreaOfInterestChange(e, 1)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Second Area of Interest</option>
                    {areaOfInt.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="designation" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Designation
                </label>
                <div className="mt-2">
                  <select
                    name="designation"
                    onChange={handleChange}
                    value={formData.designation}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    id="designation"
                  >
                    <option value="">Select your designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center bg-black px-3.5 py-2.5 font-semibold leading-7 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm text-slate-800 dark:text-white shadow active:bg-green-700"
                >
                  Create Account <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </form>
          {/* Display response message */}
          {response && (
            <div
              className={`p-5 text-center font-semibold text-lg ${
                response === "Faculty sign up successful" || response === "Sign up successful" ? "text-green-500" : "text-red-500"
              }`}
            >
              {response === "Faculty sign up successful" ? "Sign up successful!" : response}
            </div>
          )}
          <div className="signup-options text-center mt-4">
            <p>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
            <p>Not a faculty? <Link to="/student_signup" className="text-blue-600 hover:underline">Sign up as Student</Link></p>
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
    </section>
  );
}
