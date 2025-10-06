import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// --- SVG Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const AppHeader = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMiniProgramOpen, setIsMiniProgramOpen] = useState(false);

  const miniProgramMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/login");
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] shadow-lg backdrop-blur-md bg-opacity-95">
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* --- Brand --- */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-2xl font-extrabold text-white tracking-wide drop-shadow-sm"
            >
              IT COMMAND
            </Link>

            {token && (
              <div className="hidden md:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}

                {/* Mini Program Dropdown */}
                <div className="relative" ref={miniProgramMenuRef}>
                  <button
                    onClick={() => setIsMiniProgramOpen(!isMiniProgramOpen)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>Mini Program</span>
                    <ChevronDownIcon
                      className={`transition-transform duration-200 ${
                        isMiniProgramOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isMiniProgramOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-xl shadow-lg bg-white text-gray-800 overflow-hidden">
                      <NavLink
                        to="/switches"
                        onClick={() => setIsMiniProgramOpen(false)}
                        className="block w-full text-left px-4 py-2 text-base hover:bg-gray-100"
                      >
                        Manage Switch
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- Right side --- */}
          <div className="flex items-center">
            {token ? (
              <div
                className="hidden md:flex items-center relative"
                ref={profileMenuRef}
              >
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition"
                >
                  <UserIcon />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg bg-white text-gray-800 overflow-hidden">
                    <Link
                      to="/create-user"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 text-base hover:bg-gray-100"
                    >
                      Create User
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-base hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/faq"
                  className="px-4 py-2 rounded-full text-base font-semibold text-white/90 hover:text-white hover:bg-white/20 transition"
                >
                  FAQ
                </Link>
                <Link
                  to="/report-issue"
                  className="px-4 py-2 rounded-full text-base font-semibold text-white/90 hover:text-white hover:bg-white/20 transition"
                >
                  แจ้งปัญหา
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full text-base font-semibold bg-white text-[#1976d2] hover:bg-gray-100 transition shadow"
                >
                  Admin Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
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

      {/* --- Mobile Menu Overlay --- */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay-vibrant md:hidden">
          <div className="absolute top-5 right-5">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <CloseIcon />
            </button>
          </div>
          {token ? (
            <>
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
                    Manage Switch
                  </NavLink>
                </div>
              </nav>

              <NavLink
                to="/create-user"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Create User
              </NavLink>

              <button onClick={handleLogout} className="mobile-logout-button">
                Logout
              </button>
            </>
          ) : (
            // ✨ --- MODIFICATION START (Mobile User Menu) --- ✨
            <div className="flex flex-col items-center space-y-6 w-full px-8">
              {/* User links group */}
              <nav className="flex flex-col items-center space-y-6">
                <Link
                  to="/faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-link"
                >
                  FAQ
                </Link>
                <Link
                  to="/report-issue"
                  className="ghost-button-vibrant px-4 py-2 rounded-full text-base font-semibold"
                >
                  แจ้งปัญหา
                </Link>
              </nav>

              {/* Separator */}
              <hr className="w-full border-gray-300/30 my-4" />

              {/* Admin Login Button */}
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-primary-button w-full text-center"
              >
                Admin Login
              </Link>
            </div>
            // ✨ --- MODIFICATION END (Mobile User Menu) --- ✨
          )}
        </div>
      )}
    </>
  );
};

export default AppHeader;
