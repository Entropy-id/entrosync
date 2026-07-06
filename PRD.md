Product Requirements Document

Overview

The Freelancer Client Portal is a web application designed to be an all-in-one workspace for freelancers and their clients. Currently, the working relationship between freelancers and clients is often messy and inefficient because communication and project management are scattered across multiple platforms (WhatsApp for discussions, Google Drive for files, Notion for tracking, Excel for invoices). This leads to client confusion regarding project status and wastes freelancers' productive time on administrative tasks.

The primary goal of this product is to unify all these processes into one place. With this portal, freelancers can save time managing projects and invoicing, while clients gain full transparency through a dedicated dashboard to monitor project progress and view invoices in real time without the need for frequent chat queries.

Requirements

Role-Based Access Management: The system must differentiate access rights between Freelancers (as owners/admins who have full control over projects, milestones, and finances) and Clients (as guests who only have read/view access to monitor their own projects, invoices, and feedback).

Artificial Intelligence (AI) Integration: The system requires AI integration (such as OpenAI LLM) to process raw text (e.g., chat history) into a neat project document structure.

Real-Time Transparency: Milestone status changes made by freelancers should be immediately reflected on the client dashboard as a percentage or progress bar.

Ease of Client Access: Clients should not need to go through a complicated registration process; they can access the portal through a secure invite link.

Screen Responsiveness: The application should be comfortable to use both on desktop devices (computers/laptops) for work and on mobile devices (cellphones) for clients who want to check progress on the go.

Core Features

Smart AI Brief

A feature that transforms random/messy client chats (e.g., copied-and-pasted WhatsApp chats) into professional-looking documents. AI analyzes the text and automatically generates a Draft Project Proposal, Project Requirements, and a recommended Scope of Work. This scope of work can be instantly converted into milestones with just one click.

Transparent Project & Milestone Tracker

An interactive collaboration dashboard breaks down large projects into milestones, such as design, development, and testing. Each milestone has a status and deadline. Clients will see a progress bar that automatically advances as freelancers complete a milestone, eliminating repetitive questions like "Where are we?"

One-Click Invoice Generator

A feature for instantly generating invoices based on completed projects or milestones. Freelancers can automatically issue invoice documents to clients, and clients can instantly view and download them within the same dashboard.

Dedicated Client Dashboard

A clean and simple dedicated dashboard for clients. Displaying a summary of ongoing projects, a clear progress percentage indicator, and a history of invoices due and paid.

Nice To Have Features

Chat Feature

A feature that makes the communication between freelancers and clients easier. While the project is in progress, the client can ask the freelancer about the progress or when the client needs to add more features to the project, etc. This feature makes the communication easier while still tracking the project progress.

Sneek-Peek Feature

A feature that allows the client to see the results of work when one of the tasks is completed. Freelancer uploads an image of the tasks that have been done and the client can check by clicking one button whether the work is good enough.

Plan To Have Features

Document Editor

A feature that can edit the document even if the PRD has been released. Document Editor is one of the plan-to-have when the client adds more specification or features after the SmartAI generates the PRD. So, freelancers do not need to worry anymore whenever the client asks for add-ons.

User Flows

Freelancer

Freelancer Login  the application. 

Freelancer copies a messy chat brief from the client and pastes it into the Smart AI Brief feature. 

The system generates a draft proposal and a list of milestones. The freelancer reviews and validates the draft with one click to create a new project. 

The freelancer invites the client by entering their email address to grant access to the project portal.

 As the work progresses, the freelancer changes the milestone status (e.g., from To Do to Done). 

When a specific milestone is completed, the freelancer uses the One-Click Invoice feature to send an invoice directly to the client's dashboard.

Client

The client opens the unique link received in the invitation email.

The client accesses their Client Dashboard.

The client monitors the Progress Bar and views milestone details to see what is being and has been completed.

The client opens the Invoices tab to view billing details and make payments.

Architecture

Database Schema

To support the core functionality of the application, several primary entities (tables) are used and connected through relationships.

Main Tables & Key Columns

Users

Stores portal user information.

id (UUID, Primary Key) – Unique user identifier.

name (String) – Full name of the user.

email (String) – User email address.

password (String) – Encrypted password used for authentication.

role (Enum: FREELANCER, CLIENT) – User role within the system.

Projects

Stores information about client projects.

id (UUID, Primary Key) – Unique project identifier.

freelancer_id (UUID, Foreign Key) – Reference to the project owner (freelancer).

client_id (UUID, Foreign Key) – Reference to the client.

title (String) – Project title.

description (Text) – AI-generated project summary, proposal, requirements, and scope of work.

progress (String) – Project completion percentage (e.g., “80%”, “90%”).

status (Enum: ON_PROGRESS, PENDING, DONE) – Overall project status.

Milestones

Represents major project phases or deliverables.

id (UUID, Primary Key) – Unique milestone identifier.

project_id (UUID, Foreign Key) – Associated project ID.

title (String) – Milestone title (e.g., “Backend Development”).

status (Enum: PENDING, IN_PROGRESS, DONE) – Milestone status.

start_date (Date) – Milestone start date.

due_date (Date) – Milestone deadline.

Tasks

Represents granular work items within a project.

id (UUID, Primary Key) – Unique task identifier.

milestone_id (UUID, Foreign Key) – Associated milestone ID.

title (String) – Task title.

description (Text) – Detailed task description.

status (Enum: PENDING, IN_PROGRESS, DONE) – Task status.

start_date (Date) – Task start date.

due_date (Date) – Task deadline.

Invoices

Stores billing information issued to clients.

id (UUID, Primary Key) – Unique invoice identifier.

project_id (UUID, Foreign Key) – Associated project ID.

amount (Decimal) – Invoice amount.

status (Enum: PENDING, PAID) – Payment status.

issued_date (Date) – Date the invoice was issued.

Feedbacks

Stores client feedback and ratings for completed projects.

id (UUID, Primary Key) – Unique feedback identifier.

project_id (UUID, Foreign Key) – Associated project ID.

title (String) – Feedback title.

description (Text) – Detailed feedback content.

rating (Integer) – Rating score (e.g., scale of 1–5).

Resources

Stores and manages all project-related files and links, including documents generated by the Smart AI Brief feature.

id (UUID, Primary Key) – Unique resource identifier.

project_id (UUID, Foreign Key) – Associated project ID.

title (String) – Resource title or name (e.g., “AI Proposal Draft”, “Logo Assets”).

type (Enum: FILE, LINK) – Resource type, indicating whether it is an uploaded file or an external link.

url (String) – File storage location or external URL.

created_at (DateTime) – Date and time the resource was created or uploaded.

Project Documents

Save document content that can be edited directly in this product (e.g. Project Requirement, Scope of Work, or Proposal).

id (UUID, Primary Key) – Unique resource identifier

project_id (UUID, Primary Key) – Associated project ID

title (string) – Document Title

content (text) – document content that can be edited directly in editor

version (int) – version of the document

created_at (DateTime) – Date and time the project document was created or uploaded.

updated_at (DateTime) – Date and time the project document was updated or uploaded

Project Logs

Activity logs automatically record every important action in a project for audit and transparency purposes.

id (UUID, Primary Key) – Unique resource identifier

project_id (UUID, Foreign Key) – Associated project ID.

action (string) – the action (e.g. “MILESTONE UPDATED”, “INVOICE_ISSUED”, “DOCUMENT_UPLOADED”, “INVITE_ACCEPTED”)

description (text) – Description about action taken

created_at (DateTime) – Date and time action taken

erDiagram
    USERS ||--o{ PROJECTS : "Own (As a Freelancer)"
    USERS ||--o{ PROJECTS : "See (As a Client)"
    PROJECTS ||--|{ MILESTONES : "Divided into"
    PROJECTS ||--o{ INVOICES : "Billed Through"
    MILESTONES ||--o{ TASKS : "Consisting of Tasks"
    PROJECTS ||--o{ FEEDBACKS : "Getting Feedback"
    PROJECTS ||--|{ RESOURCES : "Having Resources"
    PROJECTS ||--o{ PROJECTDOCUMENTS : "Having Document Project (editor document like notion)"
    PROJECTS ||--o{ PROJECTLOGS : "Write Activity Log of the project"
    USERS {
        UUID id PK
        string name
        string email
        string password
        string role
    }
    
    PROJECTS {
        UUID id PK
        UUID freelancer_id FK
        UUID client_id FK
        string title
        text description
        string progress
        string status
    }
    
    MILESTONES {
        UUID id PK
        UUID project_id FK
        string title
        string status
        date start_date
        date due_date
    }

    TASKS {
        UUID id PK
        UUID milestone_id FK
        string title
        text description
        string status
        date start_date
        date due_date
    }
    
    INVOICES {
        UUID id PK
        UUID project_id FK
        decimal amount
        string status
        date issued_date
    }
    FEEDBACKS {
        UUID id PK
        UUID project_id FK
        string title
        text description
        integer rating
    }
    RESOURCES {
        UUID id PK
        UUID project_id FK
        string title
        string type
        string url
        datetime created_at
    }
    PROJECTDOCUMENTS {
        UUID id PK
        UUID project_id FK
        string title
        string type
        text content
        integer version
        datetime created_at
        datetime updated_at
    }

    PROJECTLOGS {
        UUID id PK
        UUID project_id FK
        string action
        text description
        datetime created_at
    }

Tech Stack

Fulltack : Tanstack Start, Tailwind CSS

Database: PostgreSQL

ORM : Prisma ORM

Deployment: VPS Id cloudhost.

Integrasi AI: OpenCode Go API Key

Timeline and Constraints

Checkpoint: 30 June 2026

Demo Day: 5 July 2026
