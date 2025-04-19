import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Your existing navbar component

const Layout = () => {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <main className="container mx-auto py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 