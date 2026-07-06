import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Mail, Copy, Check } from "lucide-react";
import { createProjectInvite } from "#/modules/project/project.api";

interface Props {
	projectId: string;
	projectTitle: string;
	onClose: () => void;
}

export function InviteClientModal({ projectId, projectTitle, onClose }: Props) {
	const [email, setEmail] = useState("");
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const createInvite = useServerFn(createProjectInvite);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const result = await createInvite({
				data: { projectId, email: email || undefined },
			});
			setInviteUrl(result.url);
			setEmailSent(!!email);
		} catch {
			alert("Failed to create invite");
		} finally {
			setLoading(false);
		}
	}

	function handleCopy() {
		if (!inviteUrl) return;
		navigator.clipboard.writeText(inviteUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-md bg-zinc-900 border border-neutral-800 rounded-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-white">Invite Client</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400"
					>
						<X size={18} />
					</button>
				</div>

				{!inviteUrl ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Client Email
							</label>
							<div className="flex items-center gap-2 bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5">
								<Mail size={16} className="text-gray-500" />
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="client@example.com"
									className="bg-transparent outline-none text-sm text-white w-full placeholder:text-gray-600"
								/>
							</div>
							<p className="text-xs text-gray-500 mt-2">
								If provided, we'll send an invitation email to{" "}
								{projectTitle}. Otherwise you can copy the link.
							</p>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-white text-black text-sm font-bold rounded-full py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
						>
							{loading ? "Generating..." : "Generate Invite Link"}
						</button>
					</form>
				) : (
					<div className="space-y-4">
						<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
							<p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
								<Check size={16} />
								{emailSent
									? "Invite sent to client!"
									: "Invite link created!"}
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Share Link
							</label>
							<div className="flex gap-2">
								<input
									readOnly
									value={inviteUrl}
									className="flex-1 bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none"
								/>
								<button
									type="button"
									onClick={handleCopy}
									className="px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2"
								>
									{copied ? <Check size={16} /> : <Copy size={16} />}
									{copied ? "Copied" : "Copy"}
								</button>
							</div>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="w-full border border-neutral-700 text-gray-300 text-sm font-medium rounded-full py-2.5 hover:bg-neutral-800 transition-colors"
						>
							Done
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
