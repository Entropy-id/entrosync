import { useNavigate } from "@tanstack/react-router";

export function ProjectBreadcrumb({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
      <nav className="text-sm text-gray-100/50 mb-6">
        <button
          onClick={() =>
            navigate({
              to: "/dashboard/admin",
              search: { tab: "Projects" },
            })
          }
          className="hover:text-gray-100 transition-colors"
        >
          Projects
        </button>
        <span className="mx-1">&gt;</span>
        <span className="text-gray-100 font-medium">{name}</span>
      </nav>
    </div>
  );
}
