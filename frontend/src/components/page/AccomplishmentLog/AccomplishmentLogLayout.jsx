import React from "react";
import Sidebar from "../../layout/Sidebar/Sidebar";
import Navbar from "../../layout/Navbar/Navbar";
import { Outlet } from "react-router";

const AccomplishmentLogLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex pt-[48px]"> {/* Adjust pt value to match your nav height */}
        <Sidebar />
        <main className="flex-1 ml-64 bg-[#F0F3F8] min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccomplishmentLogLayout;
