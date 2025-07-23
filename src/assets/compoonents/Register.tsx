import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [passError, setPassError] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [confirmPassError, setConfirmPassError] = useState<string>("");
  const [name, setName] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!email) {
      setEmailError("");
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    if (!confirmPass) {
      setConfirmPassError("");
    } else if (confirmPass !== pass) {
      setConfirmPassError("Passwords don't match");
    } else {
      setConfirmPassError("");
    }
  }, [confirmPass, pass]);

  useEffect(() => {
    if (!pass) {
      setPassError("");
    } else if (pass.length < 8) {
      setPassError("Password must be at least 8 characters long");
    } else {
      setPassError("");
    }
  }, [pass]);

  async function registerAccount() {
    if (!name || !email || !pass || pass !== confirmPass) {
      alert("Please fill all fields correctly");
      return;
    }
    
    const response = await fetch("https://sheeladecor.netlify.app/.netlify/functions/server/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials : "include",
      body: JSON.stringify({ email, name, password: pass }),
    });

    if (response.status === 200) {
      navigate("/verify");
    }
  }

  return (
    <div className='flex items-center justify-center h-screen font-serif'>
      <div className='flex flex-col items-center justify-center px-2 lg:px-4 lg:w-[28vw] border border-gray-400 rounded-2xl gap-3 lg:gap-4'>
        <p className='text-[6vw] md:text-[3vw] lg:text-[2.6vw] mt-2 lg:mt-4 font-semibold text-sky-600'>Register Account</p>
        <div className='flex flex-col w-full mt-3 lg:mt-4 gap-3 lg:gap-4'>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Full Name' className='pl-2 text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 lg:h-10 rounded-xl border border-gray-400' />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email Address' className='pl-2 text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 lg:h-10 rounded-xl border border-gray-400' />
          <p className='pl-1 text-[8px] md:text-[12px] text-red-700 -my-2'>{emailError}</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder='Password' className='pl-2 text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 lg:h-10 rounded-xl border border-gray-400' />
          <p className='pl-1 text-red-700 text-[8px] md:text-[12px] -my-2'>{passError}</p>
          <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder='Confirm Password' className='pl-2 text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 lg:h-10 rounded-xl border border-gray-400' />
          <p className='pl-1 text-[8px] md:text-[12px] text-red-700 -my-2'>{confirmPassError}</p>
        </div>
        <p className='text-center text-[2.8vw] px-1 mt-3 lg:mt-4 md:text-[1.4vw] lg:text-[1.1vw]'>Click register and we will send you a verification email</p>
        <button onClick={registerAccount} className='lg:h-12 h-8 rounded-xl text-sm md:text-[1.8vw] lg:text-[1.2vw] bg-sky-400 w-full hover:bg-sky-500 mb-2 lg:mb-4'>Register</button>
        <Link to="/login" className='-mt-4 underline mb-2 text-gray-500 hover:text-black text-sm md:text-[1.1vw] lg:text-[1vw]'>Back to Login</Link>
      </div>
    </div>
  );
}

export default Register;