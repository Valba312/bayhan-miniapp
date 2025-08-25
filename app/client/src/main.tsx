import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles/global.scss";
import { AuthProvider, Private } from "./auth";
import Home from "./screens/user/Home";
import Booking from "./screens/user/Booking";
import Swap from "./screens/user/Swap";
import History from "./screens/user/History";
import Profile from "./screens/user/Profile";
import AdminDashboard from "./screens/admin/Dashboard";
import AdminCalendar from "./screens/admin/Calendar";
import AdminProperties from "./screens/admin/Properties";
import ExchangesModeration from "./screens/admin/ExchangesModeration";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Private><Home /></Private>} />
        <Route path="/booking" element={<Private><Booking /></Private>} />
        <Route path="/swap" element={<Private><Swap /></Private>} />
        <Route path="/history" element={<Private><History /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />
        <Route path="/admin" element={<Private><AdminDashboard /></Private>} />
        <Route path="/admin/calendar" element={<Private><AdminCalendar /></Private>} />
        <Route path="/admin/properties" element={<Private><AdminProperties /></Private>} />
        <Route path="/admin/exchanges" element={<Private><ExchangesModeration /></Private>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

createRoot(document.getElementById("root")!).render(<App />);