import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

export default function LoginPage() {
  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [validation, setValidation] = useState("");

  const navigate = useNavigate();
  const { setCenterData } = useContext(DataContext);

  const submitForm = async () => {
    try {
      let response = await userAPI.login(formData);

      if (response.status === 200) {
        let data = response.data;
        localStorage.setItem("token", data.token);
        // Update context
        if (data.user) {
          setCenterData(data.user);
        }
        navigate("/profile");
      }
    } catch (error) {
      console.log(error.response);
      setError(error.response?.data?.message);
      setValidation(error.response?.data?.error);
      console.log(error.response?.data?.error)
    }
  };

  const handleChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Background Wash Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-2000" />
        <div className="absolute -bottom-20 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-4000" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm p-8 mx-4 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light tracking-tight text-slate-900">
            Welcome
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
          {error && (
            <p className="text-red-400 bg-red-50 p-2 mb-1 rounded-xl">
              {error}
            </p>
          )}

          {validation && (
            <div>
              {validation.map((val, index) => {
                return (
                  <p
                    key={index}
                    className="text-red-400 bg-red-50 p-2 mb-1 rounded-xl"
                  >
                    {val.msg}
                  </p>
                );
              })}
            </div>
          )}
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <button className="w-full py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
            Continue
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Forgot password?
          </a>
          <div className="h-px w-8 bg-slate-200"></div>
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/joinus"
              className="text-slate-900 font-medium hover:underline"
            >
              Join us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}