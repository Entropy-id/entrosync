import { BrandingCard } from "../components/BrandingCard";
import { LoginForm } from "../components/LoginForm";
import { AuthLayout } from "../layouts/AuthLayout";

interface LoginPageProps {
	onToggle: () => void
}

export function LoginPage({ onToggle }: LoginPageProps) {
	return (
		<AuthLayout
			leftSide={
				<BrandingCard
					title="Where freelancers and clients stay in sync"
					description="A professional workspace that helps freelancers to stay in sync with clients"
				/>
			}
			rightSide={<LoginForm onToggle={onToggle} />}
		/>
	);
}
