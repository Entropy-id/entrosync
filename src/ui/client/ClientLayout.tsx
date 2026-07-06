import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutGrid,
  Folder,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Moon,
  Menu,
  X,
} from "lucide-react";

type FreelancerInfo = {
  name: string;
  email: string | null;
};

type Project = {
  id: string;
  title: string;
  freelancer: FreelancerInfo | null;
};

interface ClientLayoutProps {
  project: Project;
  token: string;
  activeTab: "dashboard" | "projects" | "invoices";
  children: React.ReactNode;
}

export function ClientLayout({
  project,
  token,
  activeTab,
  children,
}: ClientLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: LayoutGrid,
      to: "/client/$token",
      params: { token },
    },
    {
      id: "projects" as const,
      label: "Projects",
      icon: Folder,
      to: "/client/$token/projects",
      params: { token },
    },
    {
      id: "invoices" as const,
      label: "Invoices",
      icon: FileText,
      to: "/client/$token/invoices",
      params: { token },
    },
  ];

  function NavItem({ item }: { item: (typeof navItems)[number] }) {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <Link
        to={item.to}
        params={item.params}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          isActive
            ? "bg-neutral-800/60 text-white"
            : "text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-inter bg-zinc-950 text-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 border-r border-neutral-800/50 flex-col justify-between px-4 py-6">
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <img
              src="/logo_entrosync.svg"
              alt="EntroSync Logo"
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg">EntroSync</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
        <div className="space-y-3">
          <hr className="border-neutral-800 -mx-4" />
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
              <HelpCircle size={18} />
              <span className="text-sm font-medium">Support</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-neutral-800/50 flex flex-col justify-between px-4 py-6 lg:hidden">
            <div>
              <div className="flex items-center justify-between px-2 mb-8">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo_entrosync.svg"
                    alt="EntroSync Logo"
                    className="w-8 h-8"
                  />
                  <span className="font-semibold text-lg">EntroSync</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-zinc-950 border-b border-neutral-800 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-neutral-800 text-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-neutral-800 rounded-full px-3 py-2 sm:px-4 sm:py-2.5">
              <Search size={16} className="text-neutral-100/80 shrink-0" />
              <input
                className="bg-transparent outline-none text-sm placeholder:text-gray-100/80 w-full min-w-0"
                placeholder="Search portal..."
                readOnly
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100 relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              <button
                type="button"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100"
              >
                <Moon size={18} />
              </button>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-medium">
              CL
            </div>
          </div>
        </div>

        {/* Page Title Bar */}
        <div className="max-w-6xl mx-auto px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "dashboard" && "Overview"}
              {activeTab === "projects" && "Project Details"}
              {activeTab === "invoices" && "Invoices"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === "dashboard" && (
                <>
                  Status check for{" "}
                  <span className="text-gray-200 font-medium">
                    {project.title}
                  </span>
                </>
              )}
              {activeTab === "projects" && (
                <>
                  Milestones and tasks for{" "}
                  <span className="text-gray-200 font-medium">
                    {project.title}
                  </span>
                </>
              )}
              {activeTab === "invoices" && (
                <>
                  Billing details for{" "}
                  <span className="text-gray-200 font-medium">
                    {project.title}
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              By {project.freelancer?.name ?? "Your freelancer"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
