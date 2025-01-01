import axios from "axios";
import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function FindStudents() {
  const [formData, setFormData] = useState({
    areaOfInterest: "",
    skill: "",
  });
  const [response, setResponse] = useState([]);
  const [areaOfInt, setAreaOfInt] = useState([]);
  const [skls, setSkls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Simulate loading for 2 seconds
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
      setAreaOfInt(r.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    applySkls();
  }, []);

  const applySkls = async () => {
    try {
      const r = await axios.get("http://localhost:8080/all_skills");
      setSkls(r.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Reset error message

    try {
      const r = await axios.post("http://localhost:8080/find_students", formData);
      const data = r.data;

      if (data.error) {
        setErrorMessage(data.error);
      } else if (data.message === "No results found") {
        setResponse([]); // Empty the response to trigger the "No results found" row
      } else {
        setResponse(data);
      }
    } catch (error) {
      setErrorMessage("An error occurred while fetching students");
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-32 dark:bg-slate-700 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl dark:text-white font-bold sm:text-3xl">
          Find students with right skills 🎖
        </h1>
        <p className="mt-4 text-gray-500">
          Find students who have interests and skills just like you need for your project..
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mb-0 mt-8 max-w-md space-y-4">
        <div>
          <label className="dark:text-white" htmlFor="areaOfInterest">
            Area of interest
          </label>
          <div className="relative pt-2">
            <select
              required
              name="areaOfInterest"
              value={formData.areaOfInterest}
              onChange={handleChange}
              type="text"
              className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
            >
              <option value="">Select area of interest</option>
              {areaOfInt.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="dark:text-white">Skills</label>
          <div className="relative pt-2">
            <select
              required
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              type="text"
              className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
            >
              <option value="">Select skill</option>
              {skls.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="w-full inline-block bg-blue-500 px-5 py-3 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
          >
            Find!
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 text-red-500 font-semibold">{errorMessage}</div>
      )}

      {/* Results Section */}
      {isLoading ? (
        <Loading />
      ) : (
        <div className="mx-auto max-w-screen-lg text-center">
          <h2 className="text-xl dark:text-white font-bold sm:text-2xl py-8">Results</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 text-amber-500 px-3 py-10">Name</th>
                <th className="border-2 text-amber-500 px-3 py-10">Department</th>
                <th className="border-2 text-amber-500 px-3 py-10">Area of Interests</th>
                <th className="border-2 text-amber-500 px-3 py-10">Skills</th>
                <th className="border-2 text-amber-500 px-3 py-10">Contact</th>
              </tr>
            </thead>
            <tbody>
              {/* Show No results found row if no students match */}
              {response.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border-2 px-3 py-10 text-center text-slate-700 dark:text-slate-100">
                    No results found
                  </td>
                </tr>
              ) : (
                response.map((arr, idx) => (
                  <tr key={idx}>
                    <td className="border-2 px-3 text-slate-700 dark:text-slate-100 text-left">
                      {arr.student_name}
                    </td>
                    <td className="border-2 px-3 text-slate-700 dark:text-slate-100 text-left">
                      {arr.department}
                    </td>
                    <td className="border-2 px-3 text-slate-700 dark:text-slate-100 text-left">
                      {arr.area_of_interest.map((aoi, i) => (
                        <li key={i} className="no-bullets">{aoi}</li>
                      ))}
                    </td>
                    <td className="border-2 px-3 text-slate-700 dark:text-slate-100 text-left">
                      {arr.skills.map((sk, i) => (
                        <li key={i} className="no-bullets">{sk}</li>
                      ))}
                    </td>
                    <td className="border-2 px-3 text-slate-700 dark:text-slate-100 text-left">
                      {arr.email_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
