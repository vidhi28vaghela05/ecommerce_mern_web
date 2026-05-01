import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

export default function ProfilePage() {
  const [data, setData] = useState("");
  const { centerData, setCenterData } = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(()=>{
    const FetchData = async () => {
      try {
        let response = await userAPI.getProfile();
        setData(response.data?.user);
        if (response.data?.user) {
          setCenterData(response.data.user);
        }
      } catch(err) {
        console.log(err);
      }
    }
    FetchData()
  }, [setCenterData])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-[10%] right-[-5%] w-96 h-96 bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-sm p-10 mx-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center border border-white shadow-inner">
            <span className="text-2xl font-light text-slate-400">
              {(data?.username || centerData?.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1 mb-10">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              @{data?.username || centerData?.username || 'user'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {data?.email || centerData?.email}
            </p>
          </div>

          <div className="w-full space-y-3">
            <a href="/edit-profile" className="block w-full py-3 bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]">
              Edit Profile
            </a>
            <a href="/wishlist" className="block w-full py-3 bg-slate-100 text-slate-900 text-sm font-medium rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]">
              My Wishlist
            </a>
            <a href="/order-history" className="block w-full py-3 bg-slate-100 text-slate-900 text-sm font-medium rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]">
              My Orders
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/50 text-center">
          <button 
            onClick={async () => {
              try {
                await userAPI.logout();
              } catch(error) { console.error(error); }
              localStorage.removeItem('token');
              setCenterData(null);
              navigate('/login');
            }}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
