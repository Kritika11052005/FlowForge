"use server"
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createProject(data) {
    const { userId, orgId, orgSlug } = await auth();

    console.log("Auth data:", { userId, orgId, orgSlug });

    if (!userId) {
        throw new Error("Unauthorized");
    }

    if (!orgId) {
        throw new Error("No Organization Selected");
    }

    try {
        let client;
        try {
            client = await clerkClient();
        } catch {
            client = clerkClient();
        }


        const organization = await client.organizations.getOrganization({
            organizationId: orgId,
        });

        console.log("Organization:", organization);

        const { data: membership } = await client.organizations.getOrganizationMembershipList({
            organizationId: organization.id,
        });

        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );

        console.log("User membership:", userMembership);

        if (!userMembership || userMembership.role !== "org:admin") {
            throw new Error("Only organization admins can create projects");
        }

        const project = await db.project.create({
            data: {
                name: data.name,
                key: data.key, // Fixed: was data.description
                description: data.description, // Added missing description
                organizationId: orgId,
            },
        });

        console.log("Project created:", project);
        return project;

    } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Error creating project: " + error.message);
    }
}
export async function getProject(orgId) {
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
    const projects = await db.project.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
    });
    return projects;
}


export async function deleteProject(projectId) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");

    }
    if (orgRole !== "org:admin") {
        throw new Error("Only organization admins can delete projects");

    }
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
    });
    if (!project || project.organizationId != orgId) {
        throw new Error("Project not found or you don't have the permission to delete it");

    }
    await db.project.delete({
        where: { id: projectId },
    });
    return { success: true };
}

export async function fetchProject(projectId) {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new Error("Unauthorized");

    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) {
        throw new Error("User not found");

    }

    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!project) {
        return null;

    }

    if (project.organizationId !== orgId) {
        return null;
    }

    return project
}