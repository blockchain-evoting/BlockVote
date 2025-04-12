import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* <Footer/> */}
    </div>
  );
}

export default Layout;