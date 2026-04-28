import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

export default function JoinUsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [exist, setExist] = useState("");

  const navigate = useNavigate();
  const { setCenterData } = useContext(DataContext);

  const SubmitForm = async () => {
    const userData = { username: username, email: email, password: password };

    try {
      let response = await userAPI.register(userData);
      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("token", data.token);
        // Update context
        if (data.user) {
          setCenterData(data.user);
        }
        navigate("/profile");
      }
    } catch (error) {
      console.log(error.response);
      let Err = error.response?.data?.error;
      setError(Err);

      let Err2 = error.response?.data?.message;
      setExist(Err2);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Parallax Wash Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-4000" />
      </div>

      {/* Join Us Card */}
      <div className="relative z-10 w-full max-w-sm p-10 mx-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            Join Us
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Create your account to get started
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            SubmitForm();
          }}
        >
          {error && (
            <div>
              {error.map((val) => {
                return (
                  <p className="text-red-400 bg-red-50 mb-2 p-2 rounded-xl">
                    {val.msg}
                  </p>
                );
              })}
            </div>
          )}
          {exist && (
            <p className="text-red-400 font-medium bg-red-50 rounded-xl p-2">
              {exist}
            </p>
          )}

          {/* Username Field */}
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email address"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-4 bg-slate-900 text-white text-sm font-semibold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            By joining, you agree to our
            <a href="#" className="underline hover:text-slate-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-slate-600">
              Privacy Policy
            </a>
            .
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200/50">
            <p className="text-sm text-slate-500">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-slate-900 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}