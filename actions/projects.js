// This tells Next.js that this code runs on the server, not in the browser
"use server"

// Import the database connection from our Prisma setup
import { db } from "@/lib/prisma";
// Import authentication and the Clerk client for managing organizations
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * FUNCTION 1: CREATE A NEW PROJECT
 * This creates a new project within an organization
 * Only organization admins can create projects (like only managers can start new teams)
 */
export async function createProject(data) {
    // Get authentication information - who is logged in and what organization they're in
    const { userId, orgId, orgSlug } = await auth();

    // Log this information for debugging (helps developers see what's happening)
    console.log("Auth data:", { userId, orgId, orgSlug });

    // Check if user is logged in
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Check if user has selected an organization
    // Users can belong to multiple organizations, so they need to pick one
    if (!orgId) {
        throw new Error("No Organization Selected");
    }

    // Use try-catch because talking to external services (Clerk) might fail
    try {
        // Get the Clerk client to talk to Clerk's organization system
        // This handles different versions of Clerk that work differently
        let client;
        try {
            // Newer version of Clerk - clerkClient is a function
            client = await clerkClient();
        } catch {
            // Older version of Clerk - clerkClient is already an object
            client = clerkClient();
        }

        // Get the organization details from Clerk
        // We need to verify this organization actually exists
        const organization = await client.organizations.getOrganization({
            organizationId: orgId,
        });

        // Log the organization info for debugging
        console.log("Organization:", organization);

        // Get the list of all members in this organization
        // We need this to check the current user's role
        const { data: membership } = await client.organizations.getOrganizationMembershipList({
            organizationId: organization.id,
        });

        // Find the current user in the membership list
        // This tells us what role they have in the organization
        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );

        // Log the user's membership info for debugging
        console.log("User membership:", userMembership);

        // Check if user is an admin
        // Only admins can create projects (security rule)
        if (!userMembership || userMembership.role !== "org:admin") {
            throw new Error("Only organization admins can create projects");
        }

        // Create the project in our database
        const project = await db.project.create({
            data: {
                name: data.name,                    // Project name (like "Website Redesign")
                key: data.key,                      // Short code for the project (like "WR")
                description: data.description,      // Detailed explanation of the project
                organizationId: orgId,              // Which organization this project belongs to
            },
        });

        // Log the created project for debugging
        console.log("Project created:", project);
        return project;

    } catch (error) {
        // Log any errors for debugging
        console.error("Error creating project:", error);
        // Throw a more helpful error message
        throw new Error("Error creating project: " + error.message);
    }
}

/**
 * FUNCTION 2: GET ALL PROJECTS IN AN ORGANIZATION
 * This gets a list of all projects that belong to a specific organization
 * Any member of the organization can see this list
 */
export async function getProject(orgId) {
    // Check if user is logged in
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Find the current user in our database
    // We need to verify they exist before showing them projects
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    // Get all projects that belong to this organization
    const projects = await db.project.findMany({
        where: { organizationId: orgId },           // Only projects from this organization
        orderBy: { createdAt: "desc" },            // Sort by newest first
    });
    
    return projects;
}

/**
 * FUNCTION 3: DELETE A PROJECT
 * This completely removes a project from the system
 * Only organization admins can delete projects (security rule)
 */
export async function deleteProject(projectId) {
    // Get authentication info including the user's role
    const { userId, orgId, orgRole } = await auth();
    
    // Check if user is logged in and has an organization
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }
    
    // Check if user is an admin
    // Only admins can delete projects because it's a destructive action
    if (orgRole !== "org:admin") {
        throw new Error("Only organization admins can delete projects");
    }
    
    // Find the project they want to delete
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
    });
    
    // Check if project exists AND belongs to the user's organization
    // This prevents users from deleting projects from other organizations
    if (!project || project.organizationId != orgId) {
        throw new Error("Project not found or you don't have the permission to delete it");
    }
    
    // Actually delete the project from the database
    await db.project.delete({
        where: { id: projectId },
    });
    
    // Return success message
    return { success: true };
}

/**
 * FUNCTION 4: GET A SPECIFIC PROJECT WITH ITS SPRINTS
 * This gets detailed information about one project, including all its sprints
 * A sprint is like a work period (usually 1-4 weeks) within a project
 */
export async function fetchProject(projectId) {
    // Check if user is logged in and has an organization
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Find the current user in our database
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    // Get the project with its related sprints
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        // Include related data
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },    // Get sprints sorted by newest first
            },
        },
    });
    
    // If project doesn't exist, return null (not found)
    if (!project) {
        return null;
    }

    // Security check: make sure this project belongs to the user's organization
    // This prevents users from seeing projects from other organizations
    if (project.organizationId !== orgId) {
        return null;
    }

    // Return the project with all its sprints
    return project;
}