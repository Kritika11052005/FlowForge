// Import the current logged-in user info from Clerk (server-side)
import { currentUser } from "@clerk/nextjs/server";

// Import the Prisma client for database operations
import { db } from "@/lib/prisma";

// This function checks if the currently logged-in user exists in the database
// If not, it creates a new user entry
export const checkUser = async () => {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is logged in, return null
    if (!user) {
        return null;
    }

    try {
        // Look for an existing user in the database using the Clerk user ID
        const loggedInUser = await db?.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });

        // If user exists in the database, return it
        if (loggedInUser) {
            return loggedInUser;
        }

        // If user doesn't exist, create a new user entry in the database
        const name = `${user.firstName} ${user.lastName}`; // Combine first and last name

        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,                         // Store Clerk ID
                name,                                         // Full name
                imageUrl: user.imageUrl,                      // Profile image URL
                email: user.emailAddresses[0].emailAddress,  // First email address
            },
        });

        // Return the newly created user
        return newUser;
    } catch (error) {
        // Log any errors to the console
        console.log(error);
    }
};
