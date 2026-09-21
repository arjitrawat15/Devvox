import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router";
import { Menu, X, LogOut, LayoutDashboard, Github } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
];

export function Navbar({ minimal = false }: { minimal?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, loginWithGithub, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNav(href: string) {
    setMobileOpen(false);
    if (!isLanding) {
      navigate("/");
      return;
    }
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4.5 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          Devvox
        </button>

        {/* Desktop nav links */}
        {!minimal && isLanding && (
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition-colors hover:border-white/20"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="size-7 rounded-full"
                  />
                ) : (
                  <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-background/95 py-1 shadow-xl backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {!minimal && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loginWithGithub}
                  className="hidden gap-2 text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  <Github className="size-4" />
                  Sign in
                </Button>
              )}
              {!minimal && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (isLanding) {
                      document.querySelector("#hero-input")?.scrollIntoView({ behavior: "smooth" });
                      (document.querySelector("#hero-input input") as HTMLInputElement)?.focus();
                    } else {
                      navigate("/");
                    }
                  }}
                  className="hidden bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-700 sm:inline-flex"
                >
                  Start Interview
                </Button>
              )}
            </>
          )}

          {/* Mobile menu toggle */}
          {!minimal && isLanding && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-muted-foreground md:hidden"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && !minimal && isLanding && (
        <div className="border-t border-white/5 bg-background/95 px-6 py-4 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="block w-full py-2.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
          {!isAuthenticated && (
            <Button
              size="sm"
              onClick={loginWithGithub}
              className="mt-2 w-full gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
            >
              <Github className="size-4" />
              Sign in with GitHub
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
