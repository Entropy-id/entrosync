import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="min-h-screen bg-zinc-950 text-white flex flex-col">
			<header className="flex items-center justify-between px-8 py-6">
				<div className="text-xl font-bold tracking-tight">Entrosync</div>
				<Link
					to="/login"
					className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
				>
					Sign in
				</Link>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
				<h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
					Where freelancers and clients stay in sync
				</h1>
				<p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl">
					A professional workspace that helps freelancers stay aligned with
					clients, manage projects, and deliver work seamlessly.
				</p>
				<div className="mt-10">
					<Link
						to="/login"
						className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-zinc-950 rounded-lg hover:bg-gray-200 transition-colors"
					>
						Get Started
					</Link>
				</div>
			</main>

			<footer className="px-8 py-6 text-center text-sm text-gray-500">
				© {new Date().getFullYear()} Entrosync. All rights reserved.
			</footer>
		</div>
	);
}
