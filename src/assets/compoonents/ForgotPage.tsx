import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const PassReset: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const forgotPassword = async () => {
    if (emailError || !email) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/auth/forgotpassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );

      if (response.status === 200) {
        alert("Password reset mail sent");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Error sending reset email. Please try again.");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (email === "") {
      setEmailError("");
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  }, [email]);

  return (
    <div className="flex items-center justify-center h-screen font-serif">
      <div className="flex flex-col items-center gap-2 md:gap-3 rounded-2xl border border-gray-400 w-[60vw] md:w-[30vw] lg:w-[28vw]">
        <div className="flex flex-col items-center mt-2 md:mt-4 px-2">
          <p className="text-[5.8vw] md:text-[3vw] lg:text-[2.4vw] font-semibold text-sky-600">
            Forgot Password?
          </p>
          <p className="text-[2.8vw] md:text-[1.3vw] lg:text-[1.1vw] text-center mt-1">
            Enter your email address, and <br /> we'll give you reset
            instructions
          </p>
        </div>
        <div className="flex flex-col w-full px-2 md:px-2 lg:px-4 gap-2 md:gap-2 lg:gap-3 mt-4 lg:mt-5">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
            className="text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 md:h-8 lg:h-[3vw] border-gray-400 border rounded-xl pl-2"
          />
          <p className="text-red-700 md:text-[12px] text-[8px] -my-2 pl-1 py-1">
            {emailError}
          </p>
          <button
            onClick={forgotPassword}
            className="lg:h-[3vw] md:h-8 h-8 text-[3.3vw] md:text-[2vw] lg:text-[1.5vw] rounded-xl bg-sky-400 hover:bg-sky-500"
          >
            Send Instructions
          </button>
        </div>
        <Link
          to="/login"
          className="text-gray-500 hover:text-black underline text-[2.8vw] md:text-[1.3vw] lg:text-[1vw] mb-2 md:mb-2 lg:mb-4"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default PassReset;
