import { z } from "zod";

// Schema for creating a new project
export const projectSchema = z.object({
    // Project name: required, 1–100 characters
    name: z.string()
        .min(1, 'Project name is required')
        .max(100, "Project name must be 100 characters or less"),

    // Project key: required, 2–10 characters
    key: z.string()
        .min(2, 'Project key must be at least 2 characters')
        .max(10, "Project key must be 10 characters or less"),

    // Description: optional, max 500 characters
    description: z.string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

// Schema for creating a new sprint
export const sprintSchema = z.object({
    // Sprint name: required
    name: z.string().min(1, "Sprint name is required"),

    // Dates: required, must be JavaScript Date objects
    startDate: z.date(),
    endDate: z.date(),
});

// Schema for creating a new issue/task
export const issueSchema = z.object({
    // Issue title: required
    title: z.string().min(1, "Title is required"),

    // Assignee: required, must be a valid CUID (Clerk User ID or similar)
    assigneeId: z.string().cuid("Please select assignee"),

    // Description: optional
    description: z.string().optional(),

    // Priority: must be one of the allowed values
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});
