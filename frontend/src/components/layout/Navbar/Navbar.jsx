import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

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

  const handleAccomplishmentLogsClick = () => {
    navigate("/accomplishmentlog");
  };

  return (
    <>
      <nav className="nav fixed top-0 w-full z-50">
        <div className="about">About</div>
        <div 
          className="about cursor-pointer hover:text-gray-200 transition-colors"
          onClick={handleAccomplishmentLogsClick}
        >
          Accomplishment Logs
        </div>
        <div className="ml-auto">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 text-white hover:text-gray-200 cursor-pointer transition-colors"
            style={{ background: 'none', border: 'none', color: 'white' }}
          >
            <LogOut className="h-4 w-4" />
            <span className="underline">Log out</span>
          </button>
        </div>
      </nav>

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

export default Navbar;
