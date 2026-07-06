import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { updateProject } from "#/modules/project/project.api";
import {
	apiStatusToDisplay,
	displayStatusToApi,
	formatDisplayDate,
	getStatusStyle,
} from "../utils";

export function ProjectProperties({
	projectId,
	initialStatus,
	initialStartDate,
	initialDueDate,
}: {
	projectId: string;
	initialStatus: string;
	initialStartDate: string | null;
	initialDueDate: string | null;
}) {
	const [status, setStatus] = useState(apiStatusToDisplay(initialStatus));
	const [startDate, setStartDate] = useState(
		(initialStartDate || "").slice(0, 10),
	);
	const [dueDate, setDueDate] = useState((initialDueDate || "").slice(0, 10));
	const [editingProperty, setEditingProperty] = useState<
		"status" | "startDate" | "dueDate" | null
	>(null);

	const startDateRef = useRef<HTMLInputElement>(null);
	const dueDateRef = useRef<HTMLInputElement>(null);
	const updateProjectFn = useServerFn(updateProject);
	const router = useRouter();

	useEffect(() => {
		setStatus(apiStatusToDisplay(initialStatus));
		setStartDate((initialStartDate || "").slice(0, 10));
		setDueDate((initialDueDate || "").slice(0, 10));
	}, [initialStatus, initialStartDate, initialDueDate]);

	async function patch(data: Record<string, unknown>, rollback: () => void) {
		try {
			await updateProjectFn({ data: { id: projectId, ...data } });
			await router.invalidate();
		} catch (err) {
			console.error("Failed to update project", err);
			rollback();
		}
	}

	return (
		<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-100">Properties</h3>
			</div>
			<div className="space-y-4">
				{/* Status */}
				<div className="flex items-center justify-between relative">
					<span className="text-sm text-gray-100/50">Status</span>
					<div className="relative">
						{editingProperty === "status" && (
							<div className="absolute right-0 top-full mt-1 z-10 bg-zinc-900 border border-neutral-700 rounded-xl p-1.5 shadow-xl space-y-1 min-w-[100px]">
								{(["Not Started", "In Progress", "Completed"] as const).map(
									(s) => (
										<button
											type="button"
											key={s}
											onClick={() => {
												setStatus(s);
												setEditingProperty(null);
												patch({ status: displayStatusToApi(s) }, () =>
													setStatus(apiStatusToDisplay(initialStatus)),
												);
											}}
											className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
												status === s
													? `${getStatusStyle(s)} opacity-90`
													: "text-gray-100 hover:bg-neutral-800"
											}`}
										>
											{s}
										</button>
									),
								)}
							</div>
						)}
						<button
							type="button"
							onClick={() => setEditingProperty("status")}
							className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(status)}`}
						>
							{status}
						</button>
					</div>
				</div>

				{/* Start Date */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-100/50">Start Date</span>
					{editingProperty === "startDate" ? (
						<input
							ref={startDateRef}
							type="date"
							value={startDate}
							onChange={(e) => {
								const iso = e.target.value;
								if (!iso) return;
								setStartDate(iso);
								setEditingProperty(null);
								patch({ startDate: iso }, () =>
									setStartDate((initialStartDate || "").slice(0, 10)),
								);
							}}
							onBlur={() => setEditingProperty(null)}
							className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 scheme-dark"
						/>
					) : (
						<button
							type="button"
							onClick={() => {
								setEditingProperty("startDate");
								setTimeout(() => startDateRef.current?.showPicker(), 0);
							}}
							className="text-sm text-gray-100 hover:underline"
						>
							{formatDisplayDate(startDate) || "—"}
						</button>
					)}
				</div>

				{/* Due Date */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-100/50">Due Date</span>
					{editingProperty === "dueDate" ? (
						<input
							ref={dueDateRef}
							type="date"
							value={dueDate}
							onChange={(e) => {
								const iso = e.target.value;
								if (!iso) return;
								setDueDate(iso);
								setEditingProperty(null);
								patch({ dueDate: iso }, () =>
									setDueDate((initialDueDate || "").slice(0, 10)),
								);
							}}
							onBlur={() => setEditingProperty(null)}
							className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 scheme-dark"
						/>
					) : (
						<button
							type="button"
							onClick={() => {
								setEditingProperty("dueDate");
								setTimeout(() => dueDateRef.current?.showPicker(), 0);
							}}
							className="text-sm text-gray-100 hover:underline"
						>
							{formatDisplayDate(dueDate) || "—"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
