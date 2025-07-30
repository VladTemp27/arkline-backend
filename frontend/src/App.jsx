import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/context/AccomplishmentLogContext";

import Login from "./components/page/Login.jsx";
import Home from "./components/page/Home.jsx";
import RegisterPage from "./components/page/CreateAccountForm.jsx";
import Admin from "./components/page/Admin.jsx";
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
          <Route path="/Admin" element={<RequireAuth><Admin /></RequireAuth>} />

          {/* User Routes */}
          <Route path="/accomplishmentlog" element={<RequireAuth><AccomplishmentLogLayout /></RequireAuth>}>
            <Route path="" element={<LogTime />} />
            <Route path="log-time" element={<LogTime />} />
            <Route path="accomplishment-logs" element={<AccomplishmentLogPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/accomplishmentlog" element={<RequireAuth><AccomplishmentLogLayout /></RequireAuth>}>
            <Route path="" element={<AccomplishmentLogPageAdmin />} />
            <Route path="log-time" element={<LogTime />} />
            <Route path="accomplishment-logs" element={<AccomplishmentLogPageAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TimerProvider>
  );
}

export default App;