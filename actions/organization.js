// This tells Next.js that this code runs on the server, not in the browser
"use server";

// Import the database connection from our Prisma setup
import { db } from "@/lib/prisma";
// Import authentication and the Clerk client for managing organizations
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * FUNCTION 1: GET ORGANIZATION BY SLUG
 * A "slug" is like a URL-friendly name for an organization (like "my-company" instead of "My Company Inc.")
 * This function gets organization details, but ONLY if the current user is a member of that organization
 * Think of it like: "Show me info about this company, but only if I actually work there"
 */
export async function getOrganization(slug) {
    // First, check if someone is logged in
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Find the current user in our database
    // We need this to make sure they exist in our system
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Use try-catch because talking to Clerk's servers might fail
    try {
        // Get the Clerk client to talk to Clerk's organization system
        // This weird try-catch is because different versions of Clerk work differently
        let client;
        try {
            // Newer version of Clerk - clerkClient is a function
            client = await clerkClient();
        } catch {
            // Older version of Clerk - clerkClient is already an object
            client = clerkClient();
        }

        // Ask Clerk to find the organization with this slug
        // Like looking up a company by its URL name
        const organization = await client.organizations.getOrganization({
            slug,
        });

        // If no organization exists with this slug, return null (not found)
        if (!organization) {
            return null;
        }

        // Get the list of all members in this organization
        // We need this to check if the current user is a member
        const { data: membership } = await client.organizations.getOrganizationMembershipList({
            organizationId: organization.id,
        });

        // Look through all the members to find the current user
        // It's like checking if your name is on the employee list
        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );

        // If the user is not a member of this organization, don't show them anything
        // This is a security measure - you can only see organizations you belong to
        if (!userMembership) {
            return null;
        }

        // If we get here, the user IS a member, so return the organization info
        return organization;
        
    } catch (error) {
        // Log the error so developers can see what went wrong
        console.error('Error getting organization:', error);

        // If the error is "404 Not Found", that just means the organization doesn't exist
        // That's not really an error, so return null instead of throwing
        if (error.status === 404) {
            return null; 
        }

        // For any other error, throw a more helpful error message
        throw new Error(`Failed to get organization: ${error.message}`);
    }
}

/**
 * FUNCTION 2: GET ALL USERS IN AN ORGANIZATION
 * This gets a list of all people who are members of a specific organization
 * It combines information from Clerk (who's a member) with our database (user details)
 */
export async function getOrganizationUsers(orgId) {
    // Check if someone is logged in
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Find the current user in our database
    // We need to verify they exist before we show them other users
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        },
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    // Get the membership list from Clerk
    // This tells us who belongs to this organization
    const organizationMemberships = await (await clerkClient()).organizations.getOrganizationMembershipList({
        organizationId: orgId,
    });

    // Extract just the user IDs from the membership data
    // We're converting from Clerk's format to a simple list of IDs
    const userIds = organizationMemberships.data.map(
        (membership) => membership.publicUserData.userId
    );

    // Now look up these users in our own database
    // Clerk tells us WHO is a member, but our database has additional user info
    const users = await db.user.findMany({
        where: {
            clerkUserId: {
                in: userIds,    // "in" means "find users where clerkUserId is in this list"
            },
        },
    });

    // Return the list of users with their full information
    return users;
}