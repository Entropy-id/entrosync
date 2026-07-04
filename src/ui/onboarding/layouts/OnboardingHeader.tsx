import { Menu } from "lucide-react";

export function OnboardingHeader() {
	return (
		<div className="absolute top-0 left-0 p-8">
			<div className="flex items-center gap-2">
				<Menu size={20} />
				<span className="font-semibold text-lg">EntroSync</span>
			</div>
		</div>
	);
}
