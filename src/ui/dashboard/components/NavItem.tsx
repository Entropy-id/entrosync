import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}
export function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm cursor-pointer transition-colors ${
        active
          ? "bg-neutral-800 text-gray-100 font-medium"
          : "text-gray-100/50 hover:text-gray-100"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{label}</span>
    </div>
  );
}
