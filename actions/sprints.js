"use server" // This line tells Next.js that this file is a Server Action

// Import database instance from Prisma (used to query/update DB)
import { db } from "@/lib/prisma";

// Import auth function from Clerk to get logged-in user details
import { auth } from "@clerk/nextjs/server"

// Function to create a new sprint for a project
export async function createSprint(projectId, data) {
    // Get user and organization ID from Clerk authentication
    const { userId, orgId } = await auth();

    // If user or organization is not found (not logged in or unauthorized), throw error
    if (!userId || !orgId) {
        throw new Error("Unauthorized"); // Error message for missing auth
    }

    // Find the project using the project ID provided
    const project = await db.project.findUnique({
        where: {
            id: projectId, // Match project with given ID
        },
        include: {
            sprints: {
                orderBy: {
                    createdAt: "desc", // Get sprints sorted by creation time (latest first)
                },
            },
        },
    });

    // If project is not found or it doesn't belong to the user's org, throw error
    if (!project || project.organizationId !== orgId) {
        throw new Error("Project not found");
    }

    // Create a new sprint and store it in the database
    const sprint = await db.sprint.create({
        data: {
            name: data.name,           // Name of the sprint (from user input)
            startDate: data.startDate, // Start date of the sprint
            endDate: data.endDate,     // End date of the sprint
            status: "PLANNED",         // Default status when sprint is created
            projectId                  // Link this sprint to the given project
        }
    });

    // Return the newly created sprint object
    return sprint;
}

// Function to update the status of an existing sprint (e.g. from PLANNED to ACTIVE or COMPLETED)
export async function updateSprintStatus(sprintId, newStatus) {
    // Get user ID, org ID, and org role (needed to check permissions)
    const { userId, orgId, orgRole } = await auth();

    // If user is not authenticated, throw an error
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    try {
        // Find the sprint using the given sprint ID
        const sprint = await db.sprint.findUnique({
            where: {
                id: sprintId,
            },
            include: {
                project: true, // Also include the project that this sprint belongs to
            },
        });

        // If sprint doesn't exist, throw error
        if (!sprint) {
            throw new Error("Sprint not found");
        }

        // If sprint's project doesn't belong to user's organization, reject access
        if (sprint.project.organizationId !== orgId) {
            throw new Error("Unauthorized");
        }

        // Only admin users are allowed to change the status of a sprint
        if (orgRole !== "org:admin") {
            throw new Error("Only Admin can make this change");
        }

        // Get the current date and sprint's start and end dates
        const now = new Date();
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);

        // Prevent starting the sprint if current date is outside the sprint's scheduled range
        if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
            throw new Error("Cannot start sprint outside of its date range");
        }

        // Prevent completing a sprint that was not ACTIVE
        if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
            throw new Error("Can only Complete Active Sprints");
        }

        // Update the sprint status in the database
        const updateSprint = await db.sprint.update({
            where: {
                id: sprintId,
            },
            data: {
                status: newStatus,
            },
        });

        // Return success message and updated sprint data
        return { success: true, sprint: updateSprint };

    } catch (error) {
        // Catch any unexpected error and throw it again (useful for debugging)
        throw new Error(error.message);
    }
}
