import type { ReactNode } from "react";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";

interface OnboardingLayoutProps {
    children: ReactNode
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
    return (
        <>
            <OnboardingHeader />
            {children}
            <OnboardingFooter />
        </>
    )
}