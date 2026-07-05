import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="min-h-screen bg-zinc-950 text-white flex flex-col">
			<header className="flex items-center justify-between px-8 py-6">
				<div className="flex items-center">
					<img
						src="/logo_entrosync.svg"
						alt="EntroSync Logo"
						className="w-8 h-8"
					/>
					<div className="text-xl font-bold tracking-tight">Entrosync</div>
				</div>
				<Link
					to="/login"
					className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
				>
					Sign in
				</Link>
			</header>

			<main>
				{/* Hero */}
				<section className="flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center">
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
				</section>

				{/* About */}
				<section className="border-t border-neutral-800 px-4 py-20 md:py-28">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
							Built for the way you work
						</h2>
						<p className="mt-4 text-lg text-gray-400 text-center max-w-2xl mx-auto">
							Entrosync brings everything freelancers need into one place —
							project tracking, invoicing, client updates, and milestone
							management — so you can focus on doing great work.
						</p>

						<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
							<div className="rounded-2xl bg-zinc-900/60 border border-neutral-800 p-6">
								<div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-4">
									<svg
										aria-label="Project management icon"
										className="text-emerald-400"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 20h9" />
										<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold">Project Management</h3>
								<p className="mt-2 text-sm text-gray-400 leading-relaxed">
									Organize milestones, tasks, and deadlines so nothing slips
									through the cracks.
								</p>
							</div>

							<div className="rounded-2xl bg-zinc-900/60 border border-neutral-800 p-6">
								<div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center mb-4">
									<svg
										aria-label="Invoicing icon"
										className="text-sky-400"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<rect width="20" height="14" x="2" y="5" rx="2" />
										<line x1="2" x2="22" y1="10" y2="10" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold">Invoicing & Payments</h3>
								<p className="mt-2 text-sm text-gray-400 leading-relaxed">
									Create and track invoices, monitor payouts, and stay on top of
									your revenue.
								</p>
							</div>

							<div className="rounded-2xl bg-zinc-900/60 border border-neutral-800 p-6">
								<div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center mb-4">
									<svg
										aria-label="Client collaboration icon"
										className="text-violet-400"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
										<path d="M16 3.13a4 4 0 0 1 0 7.75" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold">Client Collaboration</h3>
								<p className="mt-2 text-sm text-gray-400 leading-relaxed">
									Keep clients in the loop with shared progress, feedback, and
									documents in one shared space.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-neutral-800 px-8 py-6 text-center text-sm text-gray-500">
				© {new Date().getFullYear()} Entrosync. All rights reserved.
			</footer>
		</div>
	);
}
