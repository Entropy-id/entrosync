export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  startDate: string;
  status: "Not Started" | "In Progress" | "Completed" | "Review";
  priority: "High" | "Medium" | "Low";
  subTasks: string[];
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
            description:
              "Design freelancer dashboard page with calm, simple, and clean User Interface (UI). Make sure that design have a good User Experience (UX)",
            dueDate: "12 July 2025",
            startDate: "11 June 2025",
            status: "In Progress",
            priority: "High",
            subTasks: [
              "Search for UI/UX as a reference.",
              "Create a low-fidelity design",
              "Create a high-fidelity design",
            ],
          },
          {
            id: "ID-2",
            name: "Design projects page",
            description: "Design the projects listing and detail pages.",
            dueDate: "Jun 24",
            startDate: "Jun 20",
            status: "Not Started",
            priority: "Medium",
            subTasks: ["Research project layouts", "Draft wireframes"],
          },
          {
            id: "ID-3",
            name: "Design invoices page",
            description: "Design the invoice management interface.",
            dueDate: "Jun 24",
            startDate: "Jun 20",
            status: "Not Started",
            priority: "Medium",
            subTasks: ["Review invoice patterns", "Create mockups"],
          },
          {
            id: "ID-4",
            name: "Design client dashboard page",
            description: "Design the client-facing dashboard.",
            dueDate: "Jun 24",
            startDate: "Jun 20",
            status: "Not Started",
            priority: "Low",
            subTasks: ["Gather client requirements", "Initial sketches"],
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
          {
            id: "ID-1",
            name: "Set up project repository",
            description: "Initialize codebase, CI/CD, and project structure.",
            dueDate: "Jun 25",
            startDate: "Jun 23",
            status: "In Progress",
            priority: "High",
            subTasks: ["Create repo", "Configure CI pipeline"],
          },
        ],
      },
      {
        title: "Documentation",
        date: "Jun 30",
        tasks: 1,
        completion: "0%",
        description:
          "Deliver a complete documentation for client (User Guide, Technical Guide, etc)",
        taskList: [
          {
            id: "ID-1",
            name: "Write user guide",
            description: "Document how end-users interact with the portal.",
            dueDate: "Jun 30",
            startDate: "Jun 28",
            status: "Not Started",
            priority: "Medium",
            subTasks: ["Outline topics", "Write first draft"],
          },
        ],
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
          {
            id: "ID-1",
            name: "Competitor analysis",
            description:
              "Analyze 5 key competitors in the quantum computing space.",
            dueDate: "Jul 2",
            startDate: "Jun 30",
            status: "Completed",
            priority: "High",
            subTasks: ["Collect competitor assets", "Write analysis report"],
          },
          {
            id: "ID-2",
            name: "Brand audit report",
            description: "Audit existing brand touchpoints and perception.",
            dueDate: "Jul 4",
            startDate: "Jul 1",
            status: "Completed",
            priority: "High",
            subTasks: ["Survey internal team", "Audit digital presence"],
          },
          {
            id: "ID-3",
            name: "Strategy presentation",
            description:
              "Present findings and recommended strategy to stakeholders.",
            dueDate: "Jul 5",
            startDate: "Jul 3",
            status: "Completed",
            priority: "High",
            subTasks: ["Build slide deck", "Rehearse presentation"],
          },
        ],
      },
      {
        title: "Visual Identity Design",
        date: "Jul 20",
        tasks: 6,
        completion: "60%",
        description: "Logo, typography, and color system design.",
        taskList: [
          {
            id: "ID-1",
            name: "Logo concepts",
            description: "Develop 3 distinct logo concepts.",
            dueDate: "Jul 10",
            startDate: "Jul 6",
            status: "In Progress",
            priority: "High",
            subTasks: ["Mood board", "Sketch concepts", "Digital drafts"],
          },
          {
            id: "ID-2",
            name: "Color palette",
            description:
              "Define primary, secondary, and neutral color families.",
            dueDate: "Jul 12",
            startDate: "Jul 8",
            status: "In Progress",
            priority: "Medium",
            subTasks: ["Color psychology research", "Test accessibility"],
          },
          {
            id: "ID-3",
            name: "Typography system",
            description: "Select and pair typefaces for all brand use cases.",
            dueDate: "Jul 14",
            startDate: "Jul 10",
            status: "Not Started",
            priority: "Medium",
            subTasks: ["Shortlist fonts", "Test pairings"],
          },
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
          {
            id: "ID-1",
            name: "Set up CI/CD",
            description: "Configure automated builds and deployments.",
            dueDate: "Jul 15",
            startDate: "Jul 13",
            status: "Completed",
            priority: "High",
            subTasks: ["GitHub Actions setup", "Deploy to staging"],
          },
          {
            id: "ID-2",
            name: "Configure auth service",
            description: "Integrate authentication provider.",
            dueDate: "Jul 17",
            startDate: "Jul 15",
            status: "Completed",
            priority: "High",
            subTasks: ["Choose provider", "Implement login flow"],
          },
        ],
      },
      {
        title: "Core Features",
        date: "Aug 15",
        tasks: 15,
        completion: "95%",
        description: "Authentication, sync engine, and offline mode.",
        taskList: [
          {
            id: "ID-1",
            name: "Implement offline sync",
            description:
              "Build conflict-free replicated data types for offline use.",
            dueDate: "Aug 1",
            startDate: "Jul 22",
            status: "Completed",
            priority: "High",
            subTasks: ["Research CRDTs", "Prototype sync layer"],
          },
          {
            id: "ID-2",
            name: "Build notification system",
            description: "Native push and in-app notifications.",
            dueDate: "Aug 5",
            startDate: "Aug 1",
            status: "In Progress",
            priority: "Medium",
            subTasks: ["Configure FCM/APNs", "Design notification UI"],
          },
        ],
      },
      {
        title: "QA & Release",
        date: "Sep 1",
        tasks: 8,
        completion: "80%",
        description: "Testing, bug fixes, and app store submission.",
        taskList: [
          {
            id: "ID-1",
            name: "End-to-end testing",
            description: "Run full regression and user acceptance tests.",
            dueDate: "Aug 25",
            startDate: "Aug 20",
            status: "In Progress",
            priority: "High",
            subTasks: ["Write test cases", "Execute on physical devices"],
          },
          {
            id: "ID-2",
            name: "App store submission",
            description:
              "Prepare assets and submit to Apple and Google stores.",
            dueDate: "Aug 30",
            startDate: "Aug 25",
            status: "Not Started",
            priority: "Medium",
            subTasks: ["Screenshots", "Store metadata"],
          },
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
