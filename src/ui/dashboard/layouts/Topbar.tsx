import { Bell, Moon, Search } from "lucide-react";
export function Topbar() {
  return (
    <div className="sticky top-0 z-10 bg-zinc-950 border-b border-neutral-800 px-8 py-6 ">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-neutral-800 rounded-full px-4 py-2.5">
          <Search size={16} className="text-neutral-100/80" />
          <input
            className="bg-transparent outline-none text-sm placeholder:text-gray-100/80 w-full"
            placeholder="Search projects, invoices, clients..."
          />
        </div>
        <button className="p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <button className="p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100">
          <Moon size={18} />
        </button>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">Zaghy Zalayetha</p>
            <p className="text-xs text-zinc-500 leading-tight">
              Software Developer
            </p>
          </div>
          <img
            src="https://i.pravatar.cc/64?img=12"
            alt="Alex Sterling"
            className="w-9 h-9 rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
