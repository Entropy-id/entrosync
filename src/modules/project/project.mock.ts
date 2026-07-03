export interface Project {
	id: string;
	name: string;
	priority: "High" | "Medium" | "Low";
	targetDate: string;
	tasks: number;
	status: string;
	client: string;
}

export const mockProjects: Project[] = [
	{
		id: "1",
		name: "Freelance Client Portal - EntroSync",
		priority: "High",
		targetDate: "12 July 2025",
		tasks: 24,
		status: "20%",
		client: "NexaCorp Industries",
	},
	{
		id: "2",
		name: "Quantum-X Rebranding",
		priority: "High",
		targetDate: "15 August 2025",
		tasks: 18,
		status: "75%",
		client: "NexaCorp Industries",
	},
	{
		id: "3",
		name: "Aether Mobile App",
		priority: "Medium",
		targetDate: "3 September 2025",
		tasks: 31,
		status: "92%",
		client: "Lumina Systems",
	},
];

export function getProjectBySlug(slug: string): Project | undefined {
	return mockProjects.find((p) => slugify(p.name) === slug);
}

export function getAllProjects(): Project[] {
	return mockProjects;
}

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
