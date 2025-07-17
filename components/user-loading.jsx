"use client" // Required for client-side rendering

// Import hooks from Clerk to check if user and organization data are loaded
import { useOrganization, useUser } from "@clerk/nextjs"

// Import a loading spinner from react-spinners
import { BarLoader } from "react-spinners";

// This component shows a loading bar until both user and org data are ready
const UserLoading = () => {
    const { isLoaded } = useOrganization(); // Org loading state
    const { isLoaded: isUserLoaded } = useUser(); // User loading state

    // If either org or user data is not yet loaded
    if (!isLoaded || !isUserLoaded) {
        return (
            <BarLoader
                className="mb-4" // Adds margin below the bar
                width={"100%"} // Full width
                color="#36d7b7" // Teal color
            />
        );
    } else {
        // If both are loaded, return nothing
        return <></>;
    }
};

export default UserLoading;
