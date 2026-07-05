import { Bell, LogOut, Menu, Moon, Search } from "lucide-react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface TopbarProps {
  onMenuClick?: () => void;
  user?: User;
  onLogout?: () => void;
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Topbar({ onMenuClick, user, onLogout }: TopbarProps) {
  return (
    <div className="sticky top-0 z-10 bg-zinc-950 border-b border-neutral-800 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-800 text-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-neutral-800 rounded-full px-3 py-2 sm:px-4 sm:py-2.5">
          <Search size={16} className="text-neutral-100/80 shrink-0" />
          <input
            className="bg-transparent outline-none text-sm placeholder:text-gray-100/80 w-full min-w-0"
            placeholder="Search projects, invoices, clients..."
          />
        </div>

        {/*<div className="flex items-center gap-1 sm:gap-2">
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
        </div>*/}

        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-tight">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-zinc-500 leading-tight">
              {user?.email ?? ""}
            </p>
          </div>
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name ?? "User"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-medium">
              {getInitials(user?.name)}
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
