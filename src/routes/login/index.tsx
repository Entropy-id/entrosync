import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import { LoginPage } from "#/ui/auth/section/LoginPage";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const result = await getSessionWithOnboardingServerFn();
    if (result) {
      const { onboardingCompleted } = result;
      throw redirect({
        to: onboardingCompleted ? "/dashboard/admin" : "/onboarding",
      });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleNavigateToRegister = () => {
    navigate({ to: "/register" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <LoginPage onToggle={handleNavigateToRegister} />
    </div>
  );
}
