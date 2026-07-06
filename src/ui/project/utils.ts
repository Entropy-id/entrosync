export function apiStatusToDisplay(s: string) {
	if (s === "NOT_STARTED") return "Not Started";
	if (s === "ON_PROGRESS" || s === "IN_PROGRESS") return "In Progress";
	if (s === "DONE") return "Completed";
	return "Not Started";
}

export function displayStatusToApi(
	s: string,
	kind: "project" | "task" | "milestone" = "project",
) {
	if (s === "Not Started") return "NOT_STARTED";
	if (s === "In Progress")
		return kind === "project" ? "ON_PROGRESS" : "IN_PROGRESS";
	if (s === "Completed") return "DONE";
	return "NOT_STARTED";
}

export function getStatusStyle(s: string) {
	if (s === "In Progress") return "bg-sky-500 text-white";
	if (s === "Completed") return "bg-emerald-500 text-white";
	return "bg-neutral-700 text-gray-100";
}

export function formatDisplayDate(iso: string | null): string {
	if (!iso) return "";
	const datePart = iso.includes("T") ? iso.slice(0, 10) : iso;
	const [year, month, day] = datePart.split("-");
	if (!year || !month || !day) return "";
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function computeMilestoneCompletion(
	tasks: { status: string }[],
): string {
	if (tasks.length === 0) return "0%";
	const done = tasks.filter((t) => t.status === "DONE").length;
	return `${Math.round((done / tasks.length) * 100)}%`;
}
