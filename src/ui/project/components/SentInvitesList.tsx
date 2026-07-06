import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Clock, X, Mail, Link2 } from "lucide-react";
import {
	getProjectInvites,
	revokeProjectInvite,
} from "#/modules/project/project.api";

interface Props {
	projectId: string;
}

type Invite = {
	id: string;
	email: string | null;
	token: string;
	expiresAt: string;
	createdAt: string;
	isExpired: boolean;
};

export function SentInvitesList({ projectId }: Props) {
	const [invites, setInvites] = useState<Invite[]>([]);
	const [loading, setLoading] = useState(true);
	const getInvites = useServerFn(getProjectInvites);
	const revokeInvite = useServerFn(revokeProjectInvite);

	useEffect(() => {
		getInvites({ data: { projectId } })
			.then(setInvites)
			.finally(() => setLoading(false));
	}, [getInvites, projectId]);

	async function handleRevoke(inviteId: string) {
		if (!confirm("Revoke this invite? The link will no longer work.")) return;
		try {
			await revokeInvite({ data: { inviteId } });
			setInvites((prev) => prev.filter((i) => i.id !== inviteId));
		} catch {
			alert("Failed to revoke invite");
		}
	}

	if (loading)
		return <p className="text-sm text-gray-500">Loading invites...</p>;
	if (invites.length === 0) return null;

	return (
		<div className="space-y-3">
			<h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
				Sent Invites
			</h4>
			{invites.map((invite) => (
				<div
					key={invite.id}
					className={`flex items-center justify-between p-3 rounded-xl border ${
						invite.isExpired
							? "bg-red-500/5 border-red-500/10"
							: "bg-zinc-950 border-neutral-800"
						}`}
				>
					<div className="flex items-center gap-3 min-w-0">
						{invite.email ? (
							<Mail size={14} className="text-gray-500 shrink-0" />
						) : (
							<Link2 size={14} className="text-gray-500 shrink-0" />
						)}
						<div className="min-w-0">
							<p className="text-sm text-gray-300 truncate">
								{invite.email ?? "Link only"}
							</p>
							<p className="text-xs text-gray-500 flex items-center gap-1">
								<Clock size={10} />
								{invite.isExpired
									? "Expired"
									: `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => handleRevoke(invite.id)}
						className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0"
					>
						<X size={14} />
					</button>
				</div>
			))}
		</div>
	);
}
