import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyMail() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyCode() {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://sheeladecor.netlify.app/.netlify/functions/server/auth/verifymail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials : "include",
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        alert("Email verified successfully!");
        navigate("/login");
      } else {
        console.log(response);
        setError("Invalid or expired code. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex font-serif items-center justify-center h-screen">
      <div className="flex items-center flex-col w-[70vw] md:w-[40vw] lg:w-[30vw] rounded-2xl gap-4 border border-gray-400 p-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[6vw] md:text-[3vw] lg:text-[2.3vw] text-sky-600 font-semibold">
            Verify Email
          </p>
          <p className="text-sm md:text-[1.2vw] lg:text-[1vw] text-center px-4">
            We have sent an email to your address. Enter the verification code
            to complete registration.
          </p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Code"
          className="text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] h-8 lg:h-10 rounded-xl border border-gray-400 w-[60vw] md:w-[35vw] lg:w-[24vw] pl-2"
          disabled={loading}
        />
        
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={verifyCode}
          className="lg:h-10 h-8 w-[60vw] md:w-[35vw] lg:w-[24vw] rounded-xl bg-sky-400 hover:bg-sky-500 md:text-lg disabled:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default VerifyMail;
