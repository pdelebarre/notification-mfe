import React from "react";
import { ToastContainer } from "react-toastify";
import NotificationCard from "./components/NotificationCard";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col">
      <header className="w-full py-8 bg-white/80 shadow-lg mb-8 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-2xl mx-auto px-4 flex flex-col items-center">
          <img src="/vite.svg" alt="Logo" className="h-14 mb-3 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight drop-shadow-sm">Notification Micro-Frontend</h1>
          <p className="text-gray-500 text-lg font-medium">Send beautiful notification emails easily</p>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full flex justify-center">
          <NotificationCard />
        </div>
      </main>
      <footer className="w-full py-4 bg-white/80 border-t border-blue-100 text-center text-gray-400 text-sm font-medium tracking-wide">
        &copy; {new Date().getFullYear()} Notification MFE. All rights reserved.
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
