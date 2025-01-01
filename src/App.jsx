import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from '../components/Home';
import Navbar from '../components/Navbar';
import StudentSignUp from '../components/StudentSignUp';
import FacultySignUp from '../components/FacultySignUp';
import Login from '../components/Login';
import Footer from '../components/Footer';
import FindPeople from '../components/FindPeople';
import Sidebar from '../components/Sidebar';
import FindProjects from '../components/FindProjects';
import FindStudents from '../components/FindStudents';
import KnowTeamMembers from '../components/KnowTeamMembers';
import Statistics from '../components/Statistics';
import JoinRequest from '../components/JoinRequest';
import AddProject from '../components/AddProject'; // Import AddProject component

export default function App() {
  const [user, setUser] = useState(null);

  // Fetch user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set the user state with data from localStorage
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <StudentSignUp />
          <Footer />
        </>
      ),
    },
    {
      path: '/student_signup',
      element: (
        <>
          <StudentSignUp />
          <Footer />
        </>
      ),
    },
    {
      path: '/faculty_signup',
      element: (
        <>
          <FacultySignUp />
          <Footer />
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <Login />
          <Footer />
        </>
      ),
    },
    {
      path: '/home',
      element: (
        <>
          <Navbar user={user} />
          <Sidebar />
          <Home />
          <Footer />
        </>
      ),
    },
    {
      path: '/find_people',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <FindPeople />
          <Footer />
        </>
      ),
    },
    {
      path: '/find_projects',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <FindProjects />
          <Footer />
        </>
      ),
    },
    {
      path: '/find_students',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <FindStudents />
          <Footer />
        </>
      ),
    },
    {
      path: '/know_team_members',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <KnowTeamMembers />
          <Footer />
        </>
      ),
    },
    {
      path: '/statistics',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <Statistics />
          <Footer />
        </>
      ),
    },
    {
      path: '/join_request/:projectId',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <JoinRequest />
          <Footer />
        </>
      ),
    },
    {
      path: '/add_project',
      element: (
        <>
          <Navbar />
          <Sidebar />
          <AddProject user={user} /> {/* Add AddProject Component */}
          <Footer />
        </>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}
