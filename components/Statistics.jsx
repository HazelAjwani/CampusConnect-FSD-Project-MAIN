import { useState, useEffect } from "react";
import axios from "axios";

export default function Statistics() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [engagedStudents, setEngagedStudents] = useState(0);
  const [ongoingProjects, setOngoingProjects] = useState(0);
  const [plannedProjects, setPlannedProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);

  useEffect(() => {
    applyStatCountTotalPpl();
    applyStatCountEngagedPpl();
    applyStatCountProjects();
  }, []);

  const applyStatCountTotalPpl = async () => {
    try {
      const r = await axios.get("http://localhost:8080/stat_count_total_ppl");
      setTotalStudents(r.data.total_students);
      setTotalFaculty(r.data.total_faculty);
    } catch (error) {
      console.error("Error fetching total students and faculty:", error);
    }
  };

  const applyStatCountEngagedPpl = async () => {
    try {
      const r = await axios.get("http://localhost:8080/stat_count_engaged_ppl");
      setEngagedStudents(r.data.students_engaged);
    } catch (error) {
      console.error("Error fetching engaged students:", error);
    }
  };

  const applyStatCountProjects = async () => {
    try {
      const r = await axios.get("http://localhost:8080/stat_count_projects");
      setOngoingProjects(r.data.ongoing_projects);
      setPlannedProjects(r.data.planned_projects);
      setCompletedProjects(r.data.completed_projects);
    } catch (error) {
      console.error("Error fetching project counts:", error);
    }
  };

  return (
    <div className="py-20 px-5 dark:bg-slate-700">
      <div className="m-8 text-center text-3xl font-bold dark:text-white">
        Statistics
      </div>
      <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Total number of students
          </h3>
          <p className="text-5xl font-medium">{totalStudents}</p>
        </div>
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Total number of faculties
          </h3>
          <p className="text-5xl font-medium">{totalFaculty}</p>
        </div>
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Number of students engaged in projects
          </h3>
          <p className="text-5xl font-medium">{engagedStudents}</p>
        </div>
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Number of Ongoing projects
          </h3>
          <p className="text-5xl font-medium">{ongoingProjects}</p>
        </div>
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Number of Planned projects
          </h3>
          <p className="text-5xl font-medium">{plannedProjects}</p>
        </div>
        <div className="flex flex-col justify-center p-5 rounded-lg text-center bg-teal-600 dark:bg-teal-500 text-white">
          <h3 className="text-amber-300 dark:text-amber-400 text-xl font-semibold mb-3">
            Number of Completed projects
          </h3>
          <p className="text-5xl font-medium">{completedProjects}</p>
        </div>
      </div>
    </div>
  );
}
