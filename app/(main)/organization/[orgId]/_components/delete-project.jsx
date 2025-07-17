"use client" 
// This component is meant to run on the client side

// Import the deleteProject action (a function that deletes a project from the database)
import { deleteProject } from '@/actions/projects';

// Import a styled Button component from your UI library
import { Button } from '@/components/ui/button';

// Import your custom hook for making fetch requests (like POST/DELETE)
import useFetch from '@/hooks/use-fetch';

// Get user's organization and role
import { useOrganization } from '@clerk/nextjs'

// Icon of a trash bin (used for delete buttons)
import { Trash2 } from 'lucide-react';

// For redirecting and refreshing the page
import { useRouter } from 'next/navigation';

// React core functions
import React, { useEffect } from 'react'

// Toast notification library (for user feedback)
import { toast } from 'sonner';


// Component that handles deleting a project
const DeleteProject = ({ projectId }) => {
    // Get the user's membership info (includes their role in the org)
    const { membership } = useOrganization();

    // Router allows navigation and refreshing
    const router = useRouter();

    // useFetch hook helps track fetch state (loading, error, success)
    const {
        data: deleted,            // becomes true if delete was successful
        loading: isDeleting,      // true while the deletion is happening
        error,                    // if any error happens during deletion
        fn: deleteProjectFn,      // function that triggers the delete
    } = useFetch(deleteProject);

    // Function that runs when delete button is clicked
    const handleDelete = () => {
        // Ask for user confirmation before deleting
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProjectFn(projectId); // call the delete function with the project ID
        }
    };

    // If the project is deleted successfully, show toast and refresh the page
    useEffect(() => {
        if (deleted) {
            toast.error("Project Deleted"); // show notification
            router.refresh();              // refresh the page to remove the deleted project
        }
    }, [deleted]);

    // Only show the delete button if the user is an admin
    const isAdmin = membership?.role === "org:admin";

    if (!isAdmin) return null; // If not admin, show nothing

    return (
        <>
            <Button
                variant='ghost'       // Transparent style button
                size='sm'             // Small size
                className={`${isDeleting ? "animate-pulse" : ""}`} // show animation if deleting
                onClick={handleDelete} // handle click event
                disabled={isDeleting}  // disable button while deleting
            >
                {/* Show a trash icon inside the button */}
                <Trash2 className='h-4 w-4' />
            </Button>

            {/* If there is an error, show the error message in red */}
            {error && <p className='text-red-500 text-sm'>{error.message}</p>}
        </>
    );
};

// Export the component so it can be used in your app
export default DeleteProject;
