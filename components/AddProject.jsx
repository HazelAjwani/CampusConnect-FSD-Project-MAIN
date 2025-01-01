import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddProject() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    area_of_interest: "",
    status: "Ongoing", // default status
    prn: "",  // PRN field will be populated from the backend
  });
  const [response, setResponse] = useState(""); // For showing response messages
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch PRN based on the logged-in user's email
    const fetchPrn = async () => {
      const email = localStorage.getItem('user')?.email_id; // Get the email from localStorage
      if (email) {
        try {
          const res = await axios.get(`http://localhost:5000/get-prn?email=${email}`);
          setFormData((prevData) => ({
            ...prevData,
            prn: res.data.prn, // Automatically populate the PRN
          }));
        } catch (error) {
          console.error("Error fetching PRN:", error); 
          // Handle errors accordingly (e.g., show an alert or redirect)
        }
      }
    };

    fetchPrn();

    // Fetch areas of interest from the API
    const fetchAreasOfInterest = async () => {
      try {
        const res = await axios.get("http://localhost:8080/all_areas");
        setAreasOfInterest(res.data || []);
      } catch (error) {
        console.error("Error fetching areas of interest:", error);
      }
    };

    fetchAreasOfInterest();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const projectDetails = {
      title: formData.title,
      description: formData.description,
      area_of_interest: formData.area_of_interest,
      status: formData.status,
      prn: formData.prn,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/add_project', projectDetails);
  
      console.log('Response:', response);  // Check the response
  
      if (response.data?.message) {
        setResponse({
          type: "success",
          message: response.data.message,
        });
        setFormData({
          title: "",
          description: "",
          area_of_interest: "",
          status: "Ongoing",
          prn: "",
        });
      } else {
        setResponse({
          type: "error",
          message: response.data?.error || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      console.error('Error adding project:', error.response || error);
      setResponse({
        type: "error",
        message: error.response?.data?.error || 'There was an error adding your project. Please try again.',
      });
    }
  };
  

  return (
    <section>
      <div className="dark:bg-slate-700 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <h2 className="text-center text-2xl font-bold leading-tight text-black dark:text-white">
            Add New Project
          </h2>
          <form onSubmit={handleSubmit} method="POST" className="mt-8 text-gray-900 dark:text-slate-200">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Project Title
                </label>
                <div className="mt-2">
                  <input
                    required
                    onChange={handleChange}
                    value={formData.title}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    placeholder="Project Title"
                    id="title"
                    name="title"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Project Description
                </label>
                <div className="mt-2">
                  <textarea
                    required
                    onChange={handleChange}
                    value={formData.description}
                    className="flex h-32 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the project"
                    id="description"
                    name="description"
                  />
                </div>
              </div>

              {/* Area of Interest */}
              <div>
                <label htmlFor="area_of_interest" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Area of Interest
                </label>
                <div className="mt-2">
                  <select
                    required
                    onChange={handleChange}
                    value={formData.area_of_interest}
                    name="area_of_interest"
                    id="area_of_interest"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an Area of Interest</option>
                    {areasOfInterest.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  Project Status
                </label>
                <div className="mt-2">
                  <select
                    required
                    onChange={handleChange}
                    value={formData.status}
                    name="status"
                    id="status"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* PRN */}
              <div>
                <label htmlFor="prn" className="text-base font-medium text-gray-900 dark:text-slate-200">
                  PRN
                </label>
                <div className="mt-2">
                  <input
                    required
                    onChange={handleChange}
                    value={formData.prn}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                    type="text"
                    placeholder="Enter your PRN"
                    id="prn"
                    name="prn"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full rounded-md bg-indigo-600 py-2 text-white text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Add Project
                </button>
              </div>

              {/* Error/Success Message */}
              {response && (
                <div className={`mt-4 text-center text-sm ${response.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {response.message}
                </div>
              )}

            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
