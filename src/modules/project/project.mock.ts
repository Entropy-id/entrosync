export interface Task {
  id: string;
  name: string;
  dueDate: string;
}

export interface Milestone {
  title: string;
  date: string;
  tasks: number;
  completion: string;
  description: string;
  taskList: Task[];
}

export interface Resource {
  name: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  targetDate: string;
  startDate: string;
  tasks: number;
  status: string;
  client: string;
  description: string;
  resources: Resource[];
  milestones: Milestone[];
  progress: {
    totalTask: number;
    started: number;
    completed: number;
  };
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Freelance Client Portal",
    priority: "High",
    targetDate: "12 July 2025",
    startDate: "11 June 2025",
    tasks: 24,
    status: "20%",
    client: "NexaCorp Industries",
    description:
      "The Freelancer Client Portal is a web application designed to be an all-in-one workspace for freelancers and their clients. Currently, the working relationship between freelancers and clients is often messy and inefficient because communication and project management are scattered across multiple platforms (WhatsApp for discussions, Google Drive for files, Notion for tracking, Excel for invoices). This leads to client confusion regarding project status and wastes freelancers' productive time on administrative tasks.\n\nThe primary goal of this product is to unify all these processes into one place. With this portal, freelancers can save time managing projects and invoicing, while clients gain full transparency through a dedicated dashboard to monitor project progress and view invoices in real time without the need for frequent chat queries.",
    resources: [{ name: "Project Requirement Document" }],
    milestones: [
      {
        title: "UI & UX Design / Prototyping",
        date: "Jun 29",
        tasks: 4,
        completion: "0%",
        description: "Craft UI & UX Design in Figma and create prototype.",
        taskList: [
          {
            id: "ID-1",
            name: "Design freelancer dashboard page",
            dueDate: "Jun 23",
          },
          { id: "ID-2", name: "Design projects page", dueDate: "Jun 24" },
          { id: "ID-3", name: "Design invoices page", dueDate: "Jun 24" },
          {
            id: "ID-4",
            name: "Design client dashboard page",
            dueDate: "Jun 24",
          },
        ],
      },
      {
        title: "Software Development",
        date: "Jun 29",
        tasks: 1,
        completion: "0%",
        description: "Software development phase.",
        taskList: [
          { id: "ID-1", name: "Set up project repository", dueDate: "Jun 25" },
        ],
      },
      {
        title: "Documentation",
        date: "Jun 30",
        tasks: 1,
        completion: "0%",
        description:
          "Deliver a complete documentation for client (User Guide, Technical Guide, etc)",
        taskList: [{ id: "ID-1", name: "Write user guide", dueDate: "Jun 30" }],
      },
    ],
    progress: {
      totalTask: 6,
      started: 1,
      completed: 0,
    },
  },
  {
    id: "2",
    name: "Quantum-X Rebranding",
    priority: "High",
    targetDate: "15 August 2025",
    startDate: "1 July 2025",
    tasks: 18,
    status: "75%",
    client: "NexaCorp Industries",
    description:
      "A comprehensive rebranding initiative for Quantum-X including new visual identity, brand guidelines, marketing collateral, and digital asset refresh.",
    resources: [{ name: "Brand Guidelines v2" }],
    milestones: [
      {
        title: "Brand Audit & Strategy",
        date: "Jul 5",
        tasks: 3,
        completion: "100%",
        description: "Research and analyze current brand positioning.",
        taskList: [
          { id: "ID-1", name: "Competitor analysis", dueDate: "Jul 2" },
          { id: "ID-2", name: "Brand audit report", dueDate: "Jul 4" },
          { id: "ID-3", name: "Strategy presentation", dueDate: "Jul 5" },
        ],
      },
      {
        title: "Visual Identity Design",
        date: "Jul 20",
        tasks: 6,
        completion: "60%",
        description: "Logo, typography, and color system design.",
        taskList: [
          { id: "ID-1", name: "Logo concepts", dueDate: "Jul 10" },
          { id: "ID-2", name: "Color palette", dueDate: "Jul 12" },
          { id: "ID-3", name: "Typography system", dueDate: "Jul 14" },
        ],
      },
    ],
    progress: {
      totalTask: 18,
      started: 12,
      completed: 10,
    },
  },
  {
    id: "3",
    name: "Aether Mobile App",
    priority: "Medium",
    targetDate: "3 September 2025",
    startDate: "15 July 2025",
    tasks: 31,
    status: "92%",
    client: "Lumina Systems",
    description:
      "Cross-platform mobile application for the Aether productivity suite featuring offline support, real-time sync, and native notifications.",
    resources: [{ name: "Mobile PRD" }, { name: "API Documentation" }],
    milestones: [
      {
        title: "Architecture & Setup",
        date: "Jul 20",
        tasks: 5,
        completion: "100%",
        description: "Project scaffolding and CI/CD pipeline.",
        taskList: [
          { id: "ID-1", name: "Set up CI/CD", dueDate: "Jul 15" },
          { id: "ID-2", name: "Configure auth service", dueDate: "Jul 17" },
        ],
      },
      {
        title: "Core Features",
        date: "Aug 15",
        tasks: 15,
        completion: "95%",
        description: "Authentication, sync engine, and offline mode.",
        taskList: [
          { id: "ID-1", name: "Implement offline sync", dueDate: "Aug 1" },
          { id: "ID-2", name: "Build notification system", dueDate: "Aug 5" },
        ],
      },
      {
        title: "QA & Release",
        date: "Sep 1",
        tasks: 8,
        completion: "80%",
        description: "Testing, bug fixes, and app store submission.",
        taskList: [
          { id: "ID-1", name: "End-to-end testing", dueDate: "Aug 25" },
          { id: "ID-2", name: "App store submission", dueDate: "Aug 30" },
        ],
      },
    ],
    progress: {
      totalTask: 31,
      started: 28,
      completed: 26,
    },
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
