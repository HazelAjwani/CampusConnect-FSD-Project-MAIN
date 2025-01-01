import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import the useNavigate hook
import Loading from "./Loading";

export default function FindProjects() {
  const [formData, setFormData] = useState({
    status: "",
    area: "",
  });
  const [response, setResponse] = useState([]);
  const [areaOfInt, setAreaOfInt] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    applyAreaOfInterest();
  }, []);

  const applyAreaOfInterest = async () => {
    try {
      const r = await axios.get("http://localhost:8080/all_areas");
      if (r.data && Array.isArray(r.data)) {
        setAreaOfInt(r.data);
      } else {
        setAreaOfInt([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAreaOfInt([]);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const r = await axios.post("http://localhost:8080/find_projects", formData);
      const data = r.data;

      console.log("API response:", data);  // Debugging log to inspect the data structure
      setResponse(data);
      setIsLoading(false);
    } catch (error) {
      setResponse([]);
      setIsLoading(false);
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-4 py-32 dark:bg-slate-700 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl dark:text-white font-bold sm:text-3xl">
            Find projects suited for you! 👩‍💻
          </h1>
          <p className="mt-4 text-gray-500">
            Projects going on in your campus and it comes under your area of interest. How can you miss that?!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mb-0 mt-8 max-w-md space-y-4">
          {/* Status selection */}
          <div>
            <label className="dark:text-white" htmlFor="status">
              Status of project
            </label>
            <div className="relative pt-2">
              <select
                required
                name="status"
                value={formData.status}
                onChange={handleChange}
                id="status"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value="">Select the type</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          {/* Area of Interest selection */}
          <div>
            <label className="dark:text-white" htmlFor="area">
              Area of interest
            </label>
            <div className="relative pt-2">
              <select
                required
                name="area"
                value={formData.area}
                onChange={handleChange}
                id="area"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value="">Select area of interest</option>
                {areaOfInt && Array.isArray(areaOfInt) && areaOfInt.length > 0 ? (
                  areaOfInt.map((item, idx) => (
                    <option key={idx} value={item}>
                      {item}
                    </option>
                  ))
                ) : (
                  <option>No areas available</option>
                )}
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full inline-block bg-blue-500 px-5 py-3 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
            >
              Find!
            </button>
          </div>
        </form>

        {/* Results Section */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="mx-auto max-w-screen-xl text-center">
            <h2 className="text-xl dark:text-white font-bold sm:text-2xl py-8">
              Results
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 text-amber-500 px-2 py-4">Title</th>
                  <th className="border-2 text-amber-500 px-2 py-4">Areas of Interest</th>
                  <th className="border-2 text-amber-500 px-2 py-4">Description</th>
                  <th className="border-2 text-amber-500 px-2 py-4">Status</th>
                  <th className="border-2 text-amber-500 px-2 py-4">Request to Join</th>
                </tr>
              </thead>
              <tbody>
                {response && response.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="border-2 px-3 py-4 text-center text-slate-700 dark:text-slate-100">
                      No results found
                    </td>
                  </tr>
                ) : (
                  response.map((arr, idx) => {
                    console.log("Project data:", arr);  // Debugging log to inspect each project
                    return (
                      <tr key={idx}>
                        <td className="border-2 px-2 py-4 text-slate-700 dark:text-slate-100 text-left">{arr.title}</td>
                        <td className="border-2 px-2 py-4 text-slate-700 dark:text-slate-100 text-left">
                          {arr.area_of_interest && arr.area_of_interest.length > 0 ? (
                            <ul className="list-none">
                              {arr.area_of_interest.map((aoi, i) => (
                                <li key={i}>{aoi}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>No Areas</span>
                          )}
                        </td>
                        <td className="border-2 px-2 py-4 text-slate-700 dark:text-slate-100 text-left">{arr.description}</td>
                        <td className="border-2 px-2 py-4 text-slate-700 dark:text-slate-100 text-left">{arr.status}</td>
                        <td className="border-2 px-2 py-4 text-slate-700 dark:text-slate-100 text-left">
                          {["Ongoing", "Planned"].includes(arr.status) ? (
                            <button
                              className="w-full inline-block bg-blue-500 px-5 py-3 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
                              onClick={async () => {
                                console.log("Navigating to:", `/join_request/${arr._id}`);  // Debugging log to check the ID

                                // Fetch project _id using Title, Description, and Status
                                try {
                                  const response = await axios.post("http://localhost:8080/find_project_id", {
                                    title: arr.title,
                                    description: arr.description,
                                    status: arr.status
                                  });

                                  if (response.data.success) {
                                    // Navigate with project ID
                                    const projectId = response.data.projectId;
                                    navigate(`/join_request/${projectId}`);
                                  } else {
                                    console.error("Project not found");
                                  }
                                } catch (error) {
                                  console.error("Error fetching project ID:", error);
                                }
                              }}
                            >
                              Send
                            </button>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
