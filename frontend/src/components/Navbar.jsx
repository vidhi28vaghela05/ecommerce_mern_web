  const handleLogout = () => {
    localStorage.removeItem('token');
    setCenterData(null);
    navigate('/login');
  };