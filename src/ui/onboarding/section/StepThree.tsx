import { OnboardingButton } from "../components/OnboardingButton";
import { OnboardingLayout } from "../layouts/OnboardingLayout";

interface StepThreeProps {
	onGetStarted: () => void;
}

export function StepThree({ onGetStarted }: StepThreeProps) {
	return (
		<OnboardingLayout>
			<div className="flex flex-col lg:flex-row items-center justify-between min-h-screen p-8 lg:p-16">
				{/* Left Side - Text Content */}
				<div className="flex-1 max-w-xl">
					<h1 className="text-4xl lg:text-5xl font-bold mb-6">
						One-Click Invoice Generator
					</h1>
					<p className="text-gray-400 text-lg leading-relaxed">
						Eliminate the administrative burden. Define your project milestones once, and let EntroSync handle the billing automatically.
					</p>
				</div>

				{/* Right Side - Ilustration & Buttons */}
				<div className="flex-1 flex flex-col items-end gap-6 mt-12 lg:mt-0">
					<div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 border border-neutral-800">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div className="h-4 bg-neutral-800 rounded w-24"></div>
								<div className="h-4 bg-white rounded w-16"></div>
							</div>
							<div className="h-4 bg-neutral-800 rounded w-3/4"></div>
							<div className="h-4 bg-neutral-700 rounded w-1/2"></div>
						</div>
					</div>
					<div className="w-full max-w-md space-y-3">
						<OnboardingButton variant="primary" onClick={onGetStarted}>
							Get Started
						</OnboardingButton>
					</div>
				</div>
			</div>
		</OnboardingLayout>
	);
}
