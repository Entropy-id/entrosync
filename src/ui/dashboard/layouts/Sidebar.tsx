import {
  FileText,
  Folder,
  HelpCircle,
  LayoutGrid,
  Menu,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NavItem } from "../components/NavItem";
import type { Section } from "#/routes/dashboard/admin";

interface NavItem {
  id: Section;
  icon: LucideIcon;
}
const navItems: NavItem[] = [
  { id: "Dashboard", icon: LayoutGrid },
  { id: "Projects", icon: Folder },
  { id: "Invoices", icon: FileText },
];

interface SidebarProps {
  currentSection: Section;
  onChangeSection: (section: Section) => void;
}
export function Sidebar({ currentSection, onChangeSection }: SidebarProps) {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-neutral-800/50 flex flex-col justify-between px-4 py-6">
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
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.id}
              active={currentSection === item.id}
              onClick={() => onChangeSection(item.id)}
            />
          ))}
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
