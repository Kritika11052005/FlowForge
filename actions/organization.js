"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    try {

        let client;
        try {
            client = await clerkClient();
        } catch {
            client = clerkClient();
        }

        
        const organization = await client.organizations.getOrganization({
            slug,
        });

        if (!organization) {
            return null;
        }

        
        const { data: membership } = await client.organizations.getOrganizationMembershipList({
            organizationId: organization.id,
        });

        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );

        
        if (!userMembership) {
            return null;
        }

        return organization;
    } catch (error) {
        console.error('Error getting organization:', error);

        
        if (error.status === 404) {
            return null; 
        }

        throw new Error(`Failed to get organization: ${error.message}`);
    }
}

export async function getOrganizationUsers(orgId) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");

    }
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        },
    });
    if (!user) {
        throw new Error("User not found");

    }
    const organizationMemberships = await (await clerkClient()).organizations.getOrganizationMembershipList({
        organizationId: orgId,
    });
    const userIds = organizationMemberships.data.map(
        (membership) => membership.publicUserData.userId
    );
    const users = await db.user.findMany({
        where: {
            clerkUserId: {
                in: userIds,
            },
        },
    });
    return users
}