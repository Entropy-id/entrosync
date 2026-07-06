import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import { RegisterPage } from "#/ui/auth/section/RegisterPage";

export const Route = createFileRoute("/register/")({
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

  const handleNavigateToLogin = () => {
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <RegisterPage onToggle={handleNavigateToLogin} />
    </div>
  );
}
