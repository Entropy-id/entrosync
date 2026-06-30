import {
  FileText,
  Folder,
  HelpCircle,
  LayoutGrid,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import { NavItem } from "../components/NavItem";
export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-neutral-800/50 flex flex-col justify-between px-4 py-6">
      <div>
        <div className="flex items-center gap-2 px-2 mb-8">
          <Menu size={20} />
          <span className="font-semibold text-lg">EntroSync</span>
        </div>
        <nav className="space-y-1">
          <NavItem icon={LayoutGrid} label="Dashboard" active />
          <NavItem icon={Folder} label="Projects" />
          <NavItem icon={FileText} label="Invoices" />
        </nav>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-white text-black text-sm font-medium rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
          <Plus size={16} />
          Generate Invoice
        </button>
        <div className="space-y-1 pt-2">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={HelpCircle} label="Support" />
        </div>
      </div>
    </aside>
  );
}
