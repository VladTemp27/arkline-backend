import React, { useState } from "react";
import { Timer, NotebookPen, LogOut, Mail } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import useMenuItems from "./MenuItems";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const menuItems = useMenuItems();
  
  const baseClass =
    "flex items-center p-2 text-[#1A3C70] rounded-lg group transition-colors";
  const activeClass = "bg-[#3C5985] text-white";
  const iconBase = "text-[#1A3C70] group-hover:text-white transition-colors";
  const iconActive = "text-white";

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    
    // Close dialog
    setShowLogoutDialog(false);
    
    // Redirect to login
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const getIcon = (key) => {
    switch (key) {
      case "log-time":
        return Timer;
      case "tickets":
        return Mail;
      case "accomplishment-logs":
        return NotebookPen;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-full fixed top-[48px] bottom-0">
        <aside
          id="default-sidebar"
          className="w-64 h-full bg-gray-50 flex flex-col transition-transform -translate-x-full sm:translate-x-0 shadow-xl"
          aria-label="Sidebar"
        >
          <div className="flex-1 px-3 py-4">
            <ul className="space-y-4 font-bold">
              {menuItems.map((item) => {
                const Icon = getIcon(item.key);
                return (
                  <li key={item.key}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `${baseClass} hover:bg-[#3C5985] ${
                          isActive ? activeClass : ""
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`${iconBase} ${isActive ? iconActive : ""}`}
                            size={22}
                          />
                          <span
                            className={`ms-3 group-hover:text-white ${
                              isActive ? "text-white" : ""
                            }`}
                          >
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-auto px-3 py-4 border-t">
            <button
              onClick={handleLogoutClick}
              className={baseClass + " hover:bg-[#3C5985] w-full"}
            >
              <LogOut className={iconBase} size={22} />
              <span className="ms-3 group-hover:text-white">Log out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to log in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancelLogout}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLogout} className="bg-red-600 hover:bg-red-700">
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;