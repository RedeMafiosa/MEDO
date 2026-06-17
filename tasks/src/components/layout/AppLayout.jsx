const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SupportChat from "@/components/floating/SupportChat";
import SiteEditor from "@/components/floating/SiteEditor";

const BG_IMAGE = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/0052fe5e5_a11c8e4294191e601606b5ad4de96e63.jpg";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global background - full page, all pages */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      <main
        className="pt-14 transition-all duration-200 relative z-10"
        style={{ marginLeft: sidebarOpen ? 220 : 0 }}
      >
        <Outlet />
      </main>

      {/* Floating: Support Chat (all users) + Site Editor (admins only) */}
      <SupportChat />
      <SiteEditor />
    </div>
  );
}