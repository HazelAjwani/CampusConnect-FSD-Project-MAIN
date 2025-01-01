import axios from "axios";
import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function FindPeople() {
  const [formData, setFormData] = useState({
    people: "",
    area: "",
  });
  const [response, setResponse] = useState([]); // Updated state initialization
  const [areaOfInt, setAreaOfInt] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const r = await axios.get('http://localhost:8080/all_areas');
      setAreaOfInt(r.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const r = await axios.post("http://localhost:8080/find_people", formData);
      const data = r.data;

      if (data.length === 0) {
        setResponse([]); // Clear response if no results
      } else {
        setResponse(data); // Set response with data if found
      }

      setIsLoading(false);
    } catch (error) {
      setResponse([]); // Clear response on error
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      {/* input form */}
      <div className="mx-auto max-w-screen-2xl px-4 py-32 dark:bg-slate-700 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl dark:text-white font-bold sm:text-3xl">
            Find people with similar interests🚀{" "}
          </h1>
          <p className="mt-4 text-gray-500">
            Find people who have interests just like you in your campus, whether
            it is a student or faculty, and collaborate with them!
          </p>
        </div>

        <form onSubmit={handleSubmit} className=" mx-auto mb-0 mt-8 max-w-md space-y-4">
          <div>
            <label className="dark:text-white" htmlFor="person">Who is it?</label>
            <div className="relative pt-2">
              <select
                required
                name="people"
                value={formData.people}
                onChange={handleChange}
                id="person"
                className=" w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value="">Select the person type</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENT">Student</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>

          <div>
            <label className="dark:text-white" htmlFor="area">Area of interest</label>
            <div className="relative pt-2">
              <select
                required
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value="">Select area of interest</option>
                {areaOfInt && areaOfInt.flat().map((item, idx) => {
                  return <option key={item} value={item}>{item}</option>
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className=" w-full inline-block  bg-blue-500 px-5 py-3  rounded  border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm font-medium text-slate-800 dark:text-white shadow  active:bg-green-700"
            >
              Find!
            </button>
          </div>
        </form>

        {/* results */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="mx-auto max-w-screen-lg text-center">
            <h2 className="text-xl dark:text-white font-bold sm:text-2xl py-8">Results</h2>
            <table className=" w-full border-collapse">
              <thead>
                <tr>
                  <th className=" border-2 text-amber-500 px-3 py-10">Name</th>
                  <th className=" border-2 text-amber-500 px-3 py-10">Department</th>
                  <th className=" border-2 text-amber-500 px-3 py-10">Other Details</th>
                  <th className=" border-2 text-amber-500 px-3 py-10">Contact</th>
                </tr>
              </thead>
              <tbody>
                {response.length > 0 ? (
                  response.map((person, idx) => (
                    <tr key={idx}>
                      <td className="border-2 text-slate-700 dark:text-slate-100 px-3 py-10">{person.name}</td>
                      <td className="border-2 text-slate-700 dark:text-slate-100 px-3 py-10">{person.department}</td>
                      <td className="border-2 text-slate-700 dark:text-slate-100 px-3 py-10">
                        {person.designation || "N/A"}
                      </td>
                      <td className="border-2 text-slate-700 dark:text-slate-100 px-3 py-10">{person.email_id}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border-2 px-3 py-10 text-center text-slate-700 dark:text-slate-100">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
