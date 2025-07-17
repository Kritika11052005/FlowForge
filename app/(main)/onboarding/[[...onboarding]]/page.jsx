"use client" 
// This tells Next.js that this component runs on the client-side (browser), not the server

// Import Clerk's organization tools
import { OrganizationList, useOrganization } from '@clerk/nextjs';

// Import Next.js navigation tool for client-side routing
import { useRouter } from 'next/navigation';

// Import React and necessary hooks
import React, { useEffect, useState } from 'react'

const Onboarding = () => {
    // Get the current organization (if user selected or created one)
    const { organization } = useOrganization();

    // useRouter allows us to redirect users to other pages
    const router = useRouter();

    // Track whether we already redirected (to avoid repeating it)
    const [hasRedirected, setHasRedirected] = useState(false);

    // If organization exists AND we already started redirecting
    if (organization && hasRedirected) {
        return (
            // Show a simple loading UI while redirecting
            <div className='flex justify-center items-center pt-14'>
                <div className="text-center">
                    {/* Spinning circle animation for visual feedback */}
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    {/* Message below the spinner */}
                    <p className="mt-2 text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    // Otherwise, show the organization list for user to select/create
    return (
        <div className='flex justify-center items-center pt-14'>
            <OrganizationList
                hidePersonal // Hide the "Personal Account" option; only show organizations
                afterCreateOrganizationUrl="/organization/:slug" // Where to go after creating org
                afterSelectOrganizationUrl="/organization/:slug" // Where to go after selecting org
            />
        </div>
    );
};

// Export the component so it can be used in your app
export default Onboarding;
