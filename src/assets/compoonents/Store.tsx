import React from "react";

function Store() {
  const handleRedirect = (url) => {
    const token = localStorage.getItem("auth_token");
    const name = localStorage.getItem("auth_name");
    const email = localStorage.getItem("auth_email");
    const routes = localStorage.getItem("allowed_routes"); // stored as JSON string

    if (token && name && email && routes) {
      const finalUrl = `${url}?token=${encodeURIComponent(
        token
      )}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(
        email
      )}&routes=${encodeURIComponent(routes)}`;

      window.location.href = finalUrl;
    } else {
      alert("Missing login data. Please login again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Available Stores</h1>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left border-b">Store Name</th>
            <th className="p-2 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">Sahani Paints</td>
            <td className="p-2">
              <button
                onClick={() =>
                  handleRedirect("https://sheeladecorsite.netlify.app/")
                }
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Switch
              </button>
            </td>
          </tr>
          {/* <tr className="border-t">
            <td className="p-2">Sahani Paints</td>
            <td className="p-2">
              <button
                onClick={() =>
                  handleRedirect("https://sahanipaints.netlify.app/")
                }
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Switch
              </button>
            </td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
}

export default Store;
