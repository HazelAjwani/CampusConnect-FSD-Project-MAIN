// src/components/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Make sure useNavigate is imported
import { ArrowRight } from 'lucide-react';
import Loading from './Loading';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    otp: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate to handle redirects

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const sendOtp = async () => {
    setIsLoading(true);
    setError(''); // Reset any previous errors
    setResponse(null); // Clear any previous response messages
  
    try {
      const res = await axios.post('http://localhost:8080/send-otp', {
        email: formData.email,
        fullName: formData.fullName,
      });
  
      if (res.data && res.data.message === 'OTP sent to your email') {
        setOtpSent(true);
        setResponse({ message: 'OTP sent to your email.', success: true });
      } else {
        setResponse({ message: 'Failed to send OTP. Please try again.', success: false });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.response?.data?.message || 'Error occurred while sending OTP.');
    }
  
    setIsLoading(false);
  };

  const handleOtpChange = (e) => {
    setEnteredOtp(e.target.value);
    setError(''); // Clear the error whenever OTP is being entered
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(''); // Reset any previous errors
    setResponse(null); // Clear any previous response messages

    try {
      const res = await axios.post('http://localhost:8080/verify-otp', {
        otp: enteredOtp,
        email: formData.email,
      });

      if (res.data.success) {
        // After OTP is verified, fetch the PRN and store it in logged_in_users
        const email = formData.email;
        const prnRes = await axios.get(`http://localhost:8080/get-prn?email=${email}`);
        const prn = prnRes.data.prn;
  
        // Store the user data along with PRN in logged_in_users (could be on frontend as well)
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          otp: enteredOtp,
          prn: prn, // Store the PRN as well
        };
        
        setResponse({ message: 'OTP verified successfully!', success: true });
        setFormData({ ...formData, otp: '' });
        setTimeout(() => {
          navigate('/home');  // Redirect to /profile after successful OTP verification
        }, 2000);  // Delay the redirect by 2 seconds
      } else {
        setError(res.data.message);  // Use the backend error message
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error occurred during login. Please try again.');
      }
    }
    setIsLoading(false);
  };

  return (
    <section>
      <div className="dark:bg-slate-700 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <h2 className="text-center text-2xl font-bold leading-tight text-black dark:text-white">
            Login
          </h2>

          <form
            onSubmit={handleSubmit}
            method="POST"
            className="mt-8 text-gray-900 dark:text-slate-200"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-base font-medium text-gray-900 dark:text-slate-200"
                >
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    placeholder="Full Name"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-base font-medium text-gray-900 dark:text-slate-200"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email"
                    placeholder="Email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label
                    htmlFor="otp"
                    className="text-base font-medium text-gray-900 dark:text-slate-200"
                  >
                    Enter OTP
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="OTP"
                      id="otp"
                      name="otp"
                      value={enteredOtp}
                      onChange={handleOtpChange}
                    />
                  </div>
                </div>
              )}

              <div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="inline-flex w-full items-center justify-center bg-black px-3.5 py-2.5 font-semibold leading-7 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm text-slate-800 dark:text-white shadow active:bg-green-700"
                  >
                    Send OTP <ArrowRight className="ml-2" size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center bg-black px-3.5 py-2.5 font-semibold leading-7 rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 text-sm text-slate-800 dark:text-white shadow active:bg-green-700"
                  >
                    Verify OTP <ArrowRight className="ml-2" size={16} />
                  </button>
                )}
              </div>
            </div>
          </form>

          {isLoading ? (
            <Loading />
          ) : (
            response && (
              <p
                className={`p-5 text-center font-semibold text-lg ${response.success ? 'text-green-500' : 'text-red-500'}`}
              >
                {response.message}
              </p>
            )
          )}

          {error && (
            <p className="p-5 text-center font-semibold text-lg text-red-500">
              {error}
            </p>
          )}

          <div className="login-options text-center mt-4">
            <p>Don't have an account? <Link to="/student_signup" className="text-blue-500 hover:underline">Sign up</Link></p>
          </div>
        </div>
      </div>
    </section>
  );
}
