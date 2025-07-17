// Import function to get details about an organization by its ID
import { getOrganization } from '@/actions/organization';

// Component that allows user to switch between different organizations
import OrgSwitcher from '@/components/org-switcher';

// Import React to define a component
import React from 'react';

// Import components to display a list of projects and user's issues
import ProjectList from './_components/project-list';
import UserIssues from './_components/user-issues';

// Import Clerk's server-side auth function to get current logged-in user
import { auth } from '@clerk/nextjs/server';

// Import redirect utility from Next.js
import { redirect } from 'next/navigation';

// Async component that loads and shows organization details and projects
const Organization = async ({ params }) => {
    // Get the current authenticated user's ID
    const { userId } = await auth();

    // Extract orgId from URL parameters (e.g. /organization/[orgId])
    const { orgId } = await params;

    // If user is not logged in, redirect to sign-in page
    if (!userId) {
        redirect("/sign-in");
    }

    // Fetch organization details using the orgId
    const organization = await getOrganization(orgId);

    // If organization does not exist or is not found, show error message
    if (!organization) {
        return (
            <div>
                Organization Not Found
            </div>
        );
    }

    // If organization is found and user is authenticated, render the page
    return (
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            
            {/* Top section with title and org switcher */}
            <div className='mb-4 flex flex-col sm:flex-row justify-between items-start gap-4 relative'>
                
                {/* Absolute positioned organization title */}
                <div className='absolute left-0 top-0'>
                    <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold gradient-title pb-2 text-left'>
                        {organization.name}&rsquo;s Projects
                    </h1>
                </div>

                {/* Scaled org switcher for switching between orgs */}
                <div className='transform scale-110 sm:scale-125 lg:scale-150 origin-top-right sm:origin-top-right flex-shrink-0 ml-auto'>
                    <OrgSwitcher />
                </div>
            </div>

            {/* Section for displaying the list of projects */}
            <div className='mb-4 mt-16'>
                <ProjectList orgId={organization.id} />
            </div>

            {/* Section for displaying user's personal issues */}
            <div className='mt-8'>
                <UserIssues userId={userId} />
            </div>
        </div>
    );
}

// Export the page component so it can be routed by Next.js
export default Organization;
