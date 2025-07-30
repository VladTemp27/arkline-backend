import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerProvider } from "@/context/AccomplishmentLogContext";

import Login from "./components/page/Login.jsx";
import Home from "./components/page/Home.jsx";
import RegisterPage from "./components/page/CreateAccountForm.jsx";
import Ticket from "./components/page/Admin/Ticket.jsx";
import AccomplishmentLogLayout from "./components/page/AccomplishmentLog/AccomplishmentLogLayout.jsx";
import LogTime from "./components/page/AccomplishmentLog/LogTime.jsx";
import AccomplishmentLogPage from "./components/page/AccomplishmentLog/AccomplishmentLogPage.jsx";
import AccomplishmentLogPageAdmin from "./components/page/Admin/AccomplishmentLogPageAdmin.jsx";

import { RedirectIfAuthenticated, RequireAuth } from "./util/Auth-Util.jsx";

function App() {
  return (
    <TimerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/RegisterPage" element={<RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>} />
         

          {/* User Routes */}
          <Route path="/accomplishmentlog" element={<RequireAuth><AccomplishmentLogLayout /></RequireAuth>}>
            <Route path="" element={<LogTime />} />
            <Route path="log-time" element={<LogTime />} />
            <Route path="accomplishment-logs" element={<AccomplishmentLogPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAuth><AccomplishmentLogLayout /></RequireAuth>}>
            <Route path="" element={<Navigate to="log-time" replace />} />
            <Route path="log-time" element={<LogTime />} />
            <Route path="tickets" element={<Ticket />} />
            <Route path="accomplishment-logs" element={<AccomplishmentLogPageAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TimerProvider>
  );
}

export default App;