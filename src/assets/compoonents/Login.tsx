import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const sendLoginData = async () => {
    if (emailError || passwordError || !email || !password) {
      alert("Please enter valid credentials");
      return;
    }

    try {
      const response = await fetch("https://sheeladecor.netlify.app/.netlify/functions/server/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials : "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 200) {
        alert("Login Success");
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (password.length === 0) {
      setPasswordError("");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  }, [password]);

  useEffect(() => {
    if (email === "") {
      setEmailError("");
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("");
    }
  }, [email]);

  return (
    <div className="flex items-center justify-center font-serif h-screen">
      <div className="flex flex-col w-[75vw] md:w-[30vw] lg:w-[28vw] rounded-2xl border border-gray-300 gap-3">
        <div className="flex flex-col items-center gap-2 md:mt-2">
          <p className="text-[7.5vw] md:text-[3.2vw] lg:text-[3vw] mt-2 px-2 md:px-4 lg:px-6 leading-tight text-center text-sky-600 font-semibold">
            Login to your account
          </p>
          <p className="text-[3vw] md:text-[1.2vw] lg:text-[1.1vw] text-gray-500">
            Hello, welcome back to your account
          </p>
        </div>
        <div className="flex flex-col gap-2 px-2 md:gap-3 md:px-2 md:mt-2 lg:px-4 lg:mt-8">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
            className="text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] pl-2 h-8 md:h-8 lg:h-10 rounded-xl border border-gray-300"
          />
          <p className="text-[8px] md:text-[12px] -my-2 pl-1 py-1 text-red-700">{emailError}</p>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] pl-2 h-8 md:h-8 lg:h-10 rounded-xl border border-gray-300"
          />
          <p className="text-[8px] md:text-[12px] pl-1 -my-2 text-red-700">{passwordError}</p>
        </div>
        <div className="flex flex-row justify-between px-2 md:px-2 lg:px-4 ml-1">
          <Link to="/forgotpass" className="underline text-gray-500 text-[3vw] md:text-[1.1vw] lg:text-[1vw] hover:text-black">
            Forgot Password?
          </Link>
        </div>
        <button
          onClick={sendLoginData}
          className="rounded-xl bg-sky-400 lg:h-10 hover:bg-sky-500 h-8 md:text-md md:mt-2 md:mb-2 mb-2 mx-2 md:mx-2 md:h-8 text-sm lg:text-lg lg:mt-4 lg:mb-4 lg:mx-4"
        >
          Login
        </button>
        <div className="flex items-center justify-center mb-2 -mt-3 md:mb-3 lg:mb-4 lg:-mt-4 text-[2.8vw] md:text-[1.1vw] lg:text-[1vw]">
          <p>
            Don't have an account? <Link className="underline" to="/register">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
