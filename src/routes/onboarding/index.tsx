import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import { StepOne } from "#/ui/onboarding/section/StepOne";
import { StepThree } from "#/ui/onboarding/section/StepThree";
import { StepTwo } from "#/ui/onboarding/section/StepTwo";

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingRouteComponent,
  beforeLoad: async () => {
    const result = await getSessionWithOnboardingServerFn();

    if (!result) {
      throw redirect({
        to: "/login",
      });
    }

    const { session, onboardingCompleted } = result;
    if (onboardingCompleted) {
      throw redirect({
        to: "/dashboard/admin",
      });
    }

    return session;
  },
});

function OnboardingRouteComponent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  const handleSkip = () => {
    setCurrentStep((prev) => prev + 2);
    console.log("Skipped to the end!");
  };
  const handleGetStarted = () => {
    router.navigate({ to: "/plan" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      {currentStep === 1 && <StepOne onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 2 && <StepTwo onNext={handleNext} onBack={handleBack} />}
      {currentStep === 3 && <StepThree onGetStarted={handleGetStarted} />}
    </div>
  );
}
