import { OnboardingButton } from "../components/OnboardingButton";
import { OnboardingLayout } from "../layouts/OnboardingLayout";

interface StepTwoProps {
	onNext: () => void;
	onBack: () => void;
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
	return (
		<OnboardingLayout>
			<div className="flex flex-col lg:flex-row items-center justify-between min-h-screen p-8 lg:p-16">
				{/* Left Side - Text Content */}
				<div className="flex-1 max-w-xl">
					<h1 className="text-4xl lg:text-5xl font-bold mb-6">
						Transparent Project Tracking
					</h1>
					<p className="text-gray-400 text-lg leading-relaxed">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere
						distinctio repellendus facilis cupiditate consectetur, architecto
						explicabo quae perspiciatis quos iusto delectus iure aspernatur,
						animi saepe magni. Asperiores sint animi unde?
					</p>
				</div>

				{/* Right Side - Ilustration & Buttons */}
				<div className="flex-1 flex flex-col items-end gap-6 mt-12 lg:mt-0">
					<div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 border border-neutral-800">
						<div className="space-y-4">
							<div className="h-2 bg-green-500 rounded w-full"></div>
							<div className="h-4 bg-neutral-800 rounded w-1/2"></div>
							<div className="h-4 bg-neutral-700 rounded w-3/4"></div>
						</div>
					</div>
					<div className="w-full max-w-md space-y-3">
						<OnboardingButton variant="secondary" onClick={onBack}>
							Back
						</OnboardingButton>
						<OnboardingButton variant="primary" onClick={onNext}>
							Next
						</OnboardingButton>
					</div>
				</div>
			</div>
		</OnboardingLayout>
	);
}
