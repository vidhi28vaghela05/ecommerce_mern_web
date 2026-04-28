import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../context/UserContext";

const EditProfile = () => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", username: "" });

  const { centerData } = useContext(DataContext);
  console.log("User Data", centerData);

  useEffect(() => {
    if (centerData) {
      setFormData({ email: centerData.email, username: centerData.username });
    }
  }, [centerData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const submitForm = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      navigate("/profile");
    } catch (error) {
      console.log(error.response);
      setError(error.response);
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
        {/* Parallax Wash Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
          <div className="absolute top-[10%] right-[-5%] w-100 h-100 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob delay-2000" />
          <div className="absolute bottom-[-10%] left-[20%] w-150 h-150 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob Fdelay-4000" />
        </div>

        {/* Join Us Card */}
        <div className="relative z-10 w-full max-w-sm p-10 mx-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              Edit
            </h1>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            autoComplete="off"
          >
            {/* {error &&  <div>
            {error.map((val, index)=>{
              return <p key={index} className="bg-red-50 rounded-xl p-2 w-full text-red-200 mb-2 text-center font-medium">{val.msg}</p>
            })}
          </div>} */}

            {/* Username Field */}
            <div className="space-y-1">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
              />
            </div>

            <button className="w-full mt-2 py-4 bg-slate-900 text-white text-sm font-semibold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
              નવા સુધારા સેવ કરો
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <div className="mt-6 pt-6 border-t border-slate-200/50">
              <p className="text-sm text-slate-500">
                <Link
                  to="/"
                  className="text-slate-900 font-semibold hover:underline"
                >
                  પ્રોફાઇલ પેજ પર પરત ફરો.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
