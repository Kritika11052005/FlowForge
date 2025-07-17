// This tells Next.js that this code runs on the server, not in the browser
"use server"

// Import the database connection from our Prisma setup
import { db } from "@/lib/prisma";
// Import authentication from Clerk (handles user login/logout)
import { auth } from "@clerk/nextjs/server";

/**
 * FUNCTION 1: CREATE A NEW ISSUE
 * This function creates a new issue/ticket in our project management system
 * Like creating a new task on a to-do list, but with more details
 */
export async function createIssue(projectId, data) {
    // First, check if the user is logged in and has permission
    const { userId, orgId } = await auth();
    
    // If no user is logged in OR no organization, stop and throw error
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Find the user in our database using their Clerk ID
    // Clerk manages login, but we store extra user info in our database
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    
    // Find the last issue in this project with the same status
    // We need this to figure out what order number to give the new issue
    // Think of it like: "What's the last item in the 'To Do' column?"
    const lastIssue = await db.issue.findFirst({
        where: {
            projectId,                // Only look in this specific project
            status: data.status       // Only look at issues with the same status (like "To Do", "In Progress", etc.)
        },
        orderBy: {
            order: "desc"            // Sort by order number, highest first
        },
    });
    
    // Calculate the order number for our new issue
    // If there's a last issue, add 1 to its order number
    // If no issues exist yet, start at 0
    const newOrder = lastIssue ? lastIssue.order + 1 : 0;
    
    // Create the new issue in the database
    const issue = await db.issue.create({
        data: {
            title: data.title,                    // What the issue is called
            description: data.description,        // Detailed explanation
            status: data.status,                  // Current state (To Do, In Progress, Done, etc.)
            priority: data.priority,              // How important it is (Low, Medium, High)
            projectId: projectId,                 // Which project this belongs to
            sprintId: data.sprintId,             // Which sprint (work period) this is part of
            reporterId: user.id,                  // Who created this issue (the current user)
            assigneeId: data.assigneeId || null,  // Who should work on it (might be empty)
            order: newOrder,                      // Position in the list
        },
        
        // Also get related information when we create the issue
        include: {
            assignee: true,    // Get info about who it's assigned to
            reporter: true,    // Get info about who created it
        }
    });
    
    // Return the newly created issue with all its information
    return issue;
}

/**
 * FUNCTION 2: GET ALL ISSUES FOR A SPECIFIC SPRINT
 * A sprint is like a work period (usually 1-4 weeks)
 * This gets all the issues/tasks planned for that time period
 */
export async function getIssuesForSprint(sprintId) {
    // Check if user is logged in and authorized
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Get all issues that belong to this sprint
    const issues = await db.issue.findMany({
        where: {
            sprintId    // Only get issues from this specific sprint
        },
        // Sort the results in a specific order
        orderBy: [
            { status: "asc" },    // First, group by status (To Do, In Progress, Done)
            { order: "asc" }      // Then, within each status, sort by order number
        ],
        // Also get related information for each issue
        include: {
            assignee: true,    // Who it's assigned to
            reporter: true,    // Who created it
        }
    });
    
    return issues;
}

/**
 * FUNCTION 3: UPDATE THE ORDER OF MULTIPLE ISSUES
 * This is used when someone drags and drops issues to reorder them
 * or moves them between different status columns
 */
export async function updateIssueOrder(updateIssues) {
    // Check authorization
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }
    
    // Use a database transaction to update multiple issues at once
    // A transaction means: either ALL updates succeed, or NONE do
    // This prevents the database from getting into a weird state
    await db.$transaction(async (prisma) => {
        // Go through each issue that needs to be updated
        for (const issue of updateIssues) {
            // Update this specific issue's status and order
            await prisma.issue.update({
                where: { id: issue.id },    // Find the issue by its ID
                data: {
                    status: issue.status,   // Update its status (like "To Do" → "In Progress")
                    order: issue.order,     // Update its position in the list
                },
            });
        }
    });
    
    // Return success message
    return { success: true };
}

/**
 * FUNCTION 4: DELETE AN ISSUE
 * Remove an issue completely from the system
 * Only the person who created it OR a project admin can delete it
 */
export async function deleteIssue(issueId) {
    // Check if user is logged in
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }
    
    // Find the current user in our database
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    
    // If we can't find the user, something is wrong
    if (!user) {
        throw new Error("User not found");
    }

    // Find the issue that we want to delete
    // Also get information about the project it belongs to
    const issue = await db.issue.findUnique({
        where: { id: issueId },
        include: { project: true },    // Get project info too
    });

    // If the issue doesn't exist, we can't delete it
    if (!issue) {
        throw new Error("Issue not found");
    }

    // Check if this user has permission to delete this issue
    // They can delete if they created it OR if they're a project admin
    if (issue.reportedId !== user.id && !issue.project.adminIds.includes(user.id)) {
        throw new Error("You don't have permission to delete this issue");
    }

    // Actually delete the issue from the database
    await db.issue.delete({ where: { id: issueId } });

    // Return success message
    return { success: true };
}

/**
 * FUNCTION 5: UPDATE AN EXISTING ISSUE
 * Change the status or priority of an issue
 */
export async function updateIssue(issueId, data) {
    // Check authorization
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }
    
    // Use try-catch to handle any errors that might happen
    try {
        // First, find the issue and get its project information
        const issue = await db.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        });
        
        // If issue doesn't exist, we can't update it
        if (!issue) {
            throw new Error("Issue not found");
        }
        
        // Make sure this issue belongs to the user's organization
        // This prevents users from updating issues in other organizations
        if (issue.project.organizationId !== orgId) {
            throw new Error("Unauthorized");
        }
        
        // Update the issue with new information
        const updatedIssue = await db.issue.update({
            where: { id: issueId },
            data: {
                status: data.status,       // New status (like "To Do" → "Done")
                priority: data.priority,   // New priority (like "Low" → "High")
            },
            // Also return related information
            include: {
                assignee: true,    // Who it's assigned to
                reporter: true,    // Who created it
            }
        });
        
        return updatedIssue;
        
    } catch (error) {
        // If anything goes wrong, throw a more descriptive error
        throw new Error("Error updating issue: " + error.message);
    }
}

/**
 * FUNCTION 6: GET ALL ISSUES FOR A SPECIFIC USER
 * Find all issues that a user either created OR is assigned to work on
 */
export async function getUserIssues(userId) {
    // Get the organization ID from authentication
    const { orgId } = await auth();
    
    // Check if we have both user ID and organization ID
    if (!userId || !orgId) {
        throw new Error("No user id or organization ID found");
    }
    
    // Find the user in our database
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    
    // If user doesn't exist, we can't get their issues
    if (!user) {
        throw new Error("User not found");
    }
    
    // Find all issues where this user is involved
    const issues = await db.issue.findMany({
        where: {
            // Use OR condition: get issues where user is EITHER the assignee OR the reporter
            OR: [
                { assigneeId: user.id },    // Issues assigned to this user
                { reporterId: user.id }     // Issues created by this user
            ],
            // Also make sure the issues belong to the user's organization
            project: {
                organizationId: orgId,
            },
        },
        // Get related information for each issue
        include: {
            assignee: true,    // Who it's assigned to
            reporter: true,    // Who created it
            project: true,     // Which project it belongs to
        },
        // Sort by most recently updated first
        orderBy: { updatedAt: "desc" },
    });
    
    return issues;
}