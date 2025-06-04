import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });



  // AuthContext.js
// const login = (userData) => {
//   setUser(userData);
//   localStorage.setItem('token', userData.token); // JWT par exemple
// };

// const logout = () => {
//   setUser(null);
//   localStorage.removeItem('token');
// };

const login = (userData) => {
  setUser(userData);
  if (userData.token) {
    localStorage.setItem('token', userData.token);
  } else {
    localStorage.removeItem('token');
  }
  localStorage.setItem('user', JSON.stringify(userData));
};

const logout = () => {
  setUser(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
