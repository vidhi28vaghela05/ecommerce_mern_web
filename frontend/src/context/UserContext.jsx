// save and make your data centerlize

import { createContext, useState, useEffect } from "react";
import { userAPI } from "../services/api";

export const DataContext = createContext();

const UserContext = ({ children }) => {
  const [centerData, setCenterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and fetch user profile
    const token = localStorage.getItem("token");
    if (token) {
      const fetchProfile = async () => {
        try {
          const response = await userAPI.getProfile();
          setCenterData(response.data.user);
        } catch (error) {
          console.error("Error fetching profile:", error);
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <DataContext.Provider value={{ centerData, setCenterData, loading }}>
        {children}
      </DataContext.Provider>
    </>
  );
};

export default UserContext;
