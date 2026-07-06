import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
	component: AuthPage,
});

function AuthPage() {
	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center">
			<h1 className="text-3xl font-bold">Auth Page (Coming Soon)</h1>
		</div>
	);
}
