import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- SVG Icons & Avatar Component (เหมือนเดิม) ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />{" "}
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />{" "}
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />{" "}
  </svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />{" "}
  </svg>
);
const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-3 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />{" "}
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-3 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />{" "}
  </svg>
);
const Avatar = ({ username }) => {
  if (!username) return null;
  const initial = username[0].toUpperCase();
  const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };
  const bgColor = generateColor(username);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" // ปรับ Avatar เล็กน้อย
      style={{ backgroundColor: bgColor, filter: "saturate(1.5)" }}
    >
      {initial}
    </div>
  );
};

const AppHeader = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMiniProgramOpen, setIsMiniProgramOpen] = useState(false);

  const miniProgramMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        miniProgramMenuRef.current &&
        !miniProgramMenuRef.current.contains(event.target)
      ) {
        setIsMiniProgramOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: "/", text: "Dashboard" },
    { to: "/assets", text: "Asset List" },
    { to: "/manage-tickets", text: "Manage Tickets" },
    { to: "/report", text: "Report" },
    { to: "/add-data", text: "Manage Data" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] shadow-lg">
        {/* ✨ 1. ลด Padding ของ nav ทั้งหมด จาก py-2.5 เป็น py-2 */}
        <nav className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-2xl font-extrabold text-white tracking-wide drop-shadow-sm"
            >
              {" "}
              IT COMMAND{" "}
            </Link>
            {token && (
              <div className="hidden md:flex items-center space-x-1">
                {" "}
                {/* ลด space-x */}
                {navLinks.map((link) => (
                  // ✨ 2. ลด Padding ของเมนูหลัก จาก py-2 เป็น py-1.5
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-4 py-1.5 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
                <div className="relative" ref={miniProgramMenuRef}>
                  {/* ✨ 3. ลด Padding ของปุ่ม Mini Program */}
                  <button
                    onClick={() => setIsMiniProgramOpen(!isMiniProgramOpen)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>Mini Program</span>{" "}
                    <ChevronDownIcon
                      className={`transition-transform duration-200 ${
                        isMiniProgramOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isMiniProgramOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-48 rounded-xl shadow-lg bg-white text-gray-800 overflow-hidden ring-1 ring-black ring-opacity-5"
                      >
                        <NavLink
                          to="/switches"
                          onClick={() => setIsMiniProgramOpen(false)}
                          className="block w-full text-left px-4 py-2.5 text-base hover:bg-gray-100"
                        >
                          {" "}
                          Manage Switch{" "}
                        </NavLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {token && user ? (
              <div className="relative" ref={profileMenuRef}>
                {/* ปุ่มโปรไฟล์ด้านขวา */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 transition-colors duration-200 border border-white/20"
                >
                  <Avatar username={user.username} />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-[11px] uppercase tracking-wide text-white/60">
                      Signed in
                    </span>
                    <span className="text-sm font-semibold text-white truncate max-w-[140px]">
                      {user.username}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`hidden sm:block h-4 w-4 text-white/80 transition-transform duration-200 ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* เมนูโปรไฟล์แบบสวย */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-3 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
                    >
                      {/* ส่วนหัวโปรไฟล์ */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-sky-400/10 border-b border-gray-100">
                        <div className="shrink-0">
                          <Avatar username={user.username} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Logged in as
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.username}
                          </p>
                          {user.role && (
                            <p className="mt-0.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-[2px] text-[11px] font-medium text-blue-600">
                              {user.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* เมนูปุ่มต่าง ๆ */}
                      <div className="py-1">
                        <Link
                          to="/create-user"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserPlusIcon />
                          <span>Create User</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          <LogoutIcon />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // ... ส่วนยังไม่ login ของเดิม เหมือนเดิมต่อไปเลย ...
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/faq"
                  className="px-4 py-1.5 rounded-full text-base font-semibold text-white/90 hover:text-white hover:bg-white/20 transition"
                >
                  คำถามที่พบบ่อย
                </Link>
                <Link
                  to="/report-issue"
                  className="px-4 py-1.5 rounded-full text-base font-semibold text-white/90 hover:text-white/20 hover:bg-white/20 transition"
                >
                  แจ้งปัญหา
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-1.5 rounded-full text-base font-semibold bg-white text-[#1976d2] hover:bg-gray-100 transition shadow"
                >
                  Admin Login
                </Link>
              </div>
            )}

            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* --- Mobile Menu Overlay (เหมือนเดิม) --- */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay-vibrant md:hidden">
          <div className="absolute top-5 right-5">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              {" "}
              <CloseIcon />{" "}
            </button>
          </div>
          {token && user ? (
            <>
              <div className="flex flex-col items-center mb-6 border-b border-white/20 pb-4 w-full">
                <Avatar username={user.username} />
                <p className="text-lg font-semibold mt-2">{user.username}</p>
              </div>
              <nav className="flex flex-col items-center space-y-6">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
                <div className="text-center">
                  <div className="mobile-nav-group-title">Mini Program</div>
                  <NavLink
                    to="/switches"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mobile-nav-link-sub"
                  >
                    {" "}
                    Manage Switch{" "}
                  </NavLink>
                </div>
              </nav>
              <NavLink
                to="/create-user"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                {" "}
                Create User{" "}
              </NavLink>
              <button onClick={handleLogout} className="mobile-logout-button">
                {" "}
                Logout{" "}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6 w-full px-8">
              <nav className="flex flex-col items-center space-y-6">
                <Link
                  to="/faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-link"
                >
                  {" "}
                  FAQ{" "}
                </Link>
                <Link
                  to="/report-issue"
                  className="ghost-button-vibrant px-4 py-2 rounded-full text-base font-semibold"
                >
                  {" "}
                  แจ้งปัญหา{" "}
                </Link>
              </nav>
              <hr className="w-full border-gray-300/30 my-4" />
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-primary-button w-full text-center"
              >
                {" "}
                Admin Login{" "}
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AppHeader;
