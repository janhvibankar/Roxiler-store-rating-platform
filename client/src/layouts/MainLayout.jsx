import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content-layout">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
