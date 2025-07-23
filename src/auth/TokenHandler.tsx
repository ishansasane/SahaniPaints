import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const rawRoutes = searchParams.get("routes");

    try {
      const routes = rawRoutes ? JSON.parse(rawRoutes) : [];

      if (token && name && email && Array.isArray(routes)) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_name", name);
        localStorage.setItem("auth_email", email);
        localStorage.setItem("allowed_routes", JSON.stringify(routes)); // Clean JSON

        navigate(location.pathname, { replace: true });
      }
    } catch (err) {
      console.error("Failed to parse routes:", err);
    }
  }, [location, navigate]);

  return null;
};

export default TokenHandler;
