import { BrandingCard } from "../components/BrandingCard";
import { RegisterForm } from "../components/RegisterForm";
import { AuthLayout } from "../layouts/AuthLayout";

interface RegisterPageProps {
	onToggle: () => void;
}

export function RegisterPage({ onToggle }: RegisterPageProps) {
	return (
		<AuthLayout
			leftSide={<RegisterForm onToggle={onToggle} />}
			rightSide={
				<BrandingCard
					title="The operating system for modern freelancers"
					description="Manage client work, track progress, and handle invoices in one streamlined platform built for future."
					align="right"
				/>
			}
		/>
	);
}
