import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- SVG Icons ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- (เพิ่มใหม่) ไอคอนลูกศรสำหรับ Dropdown ---
const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
// ---------------------------------------------


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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (miniProgramMenuRef.current && !miniProgramMenuRef.current.contains(event.target)) {
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: "/", text: "Dashboard" },
    { to: "/assets", text: "Asset List" },
    { to: "/tickets", text: "Manage Tickets" },
    { to: "/add-data", text: "Manage Data" },
    { to: "/report", text: "Report" },
  ];

  return (
    <>
      <header className="header-vibrant sticky top-0 z-50 shadow-lg">
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* --- Brand & Desktop Nav --- */}
          <div className="flex items-center space-x-6">
            <Link to={token ? "/" : "/report-issue"} className="text-2xl font-bold text-Black">
              IT COMMAND
            </Link>
            {token && (
              <div className="hidden md:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `nav-link-vibrant ${isActive ? "active" : ""}`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
                
                <div className="relative" ref={miniProgramMenuRef}>
                    {/* --- (แก้ไข) เพิ่มไอคอนและ animation --- */}
                    <button
                      onClick={() => setIsMiniProgramOpen(!isMiniProgramOpen)}
                      className="nav-link-vibrant flex items-center gap-1"
                    >
                      <span>Mini Program</span>
                      <ChevronDownIcon className={`transition-transform duration-200 ${isMiniProgramOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* -------------------------------------- */}
                    {isMiniProgramOpen && (
                        <div className="nav-dropdown-vibrant absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg py-1">
                            <NavLink
                                to="/switches"
                                onClick={() => setIsMiniProgramOpen(false)}
                                className={({isActive}) => `block w-full text-left px-4 py-2 text-sm ${isActive ? 'active' : ''}`}
                            >
                                Manage Switch
                            </NavLink>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* --- Right side actions --- */}
          <div className="flex items-center">
            {token ? (
              <div className="hidden md:flex items-center relative" ref={profileMenuRef}>
                 <button 
                   onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                   className="p-2 profile-button-vibrant flex items-center"
                 >
                   <UserIcon />
                 </button>
                 {isProfileMenuOpen && (
                   <div className="profile-dropdown-vibrant absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg py-1">
                     <button
                       onClick={handleLogout}
                       className="block w-full text-left px-4 py-2 text-sm"
                     >
                       Logout
                     </button>
                   </div>
                 )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/report-issue" className="ghost-button-vibrant px-4 py-2 rounded-full text-sm font-semibold">
                  แจ้งปัญหา
                </Link>
                <Link to="/login" className="cta-button-vibrant px-4 py-2 rounded-full text-sm">
                  Admin Login
                </Link>
              </div>
            )}
            
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
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
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">
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
                    className={({isActive}) => `mobile-nav-link-sub ${isActive ? 'active' : ''}`}
                  >
                    Manage Switch
                  </NavLink>
                </div>
              </nav>
              <button onClick={handleLogout} className="mobile-logout-button">
                Logout
              </button>
            </>
          ) : (
             <div className="flex flex-col items-center space-y-6">
                <Link to="/report-issue" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-link">
                  แจ้งปัญหา
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-link active">
                  Admin Login
                </Link>
             </div>
          )}
        </div>
      )}
    </>
  );
};

export default AppHeader;