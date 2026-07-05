interface OnboardingButtonProps {
	onClick: () => void;
	variant: "primary" | "secondary";
	children: string;
}

export function OnboardingButton({
	onClick,
	variant,
	children,
}: OnboardingButtonProps) {
	const baseClasses = "font-medium py-3 px-6 rounded-full transition-colors";
	const primaryClasses = "bg-white text-black hover:bg-gray-200";
	const secondaryClasses =
		"bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800";

	return (
		<button
			type="button"
			onClick={onClick}
			className={`${baseClasses} ${variant === "primary" ? primaryClasses : secondaryClasses}`}
		>
			{children}
		</button>
	);
}
