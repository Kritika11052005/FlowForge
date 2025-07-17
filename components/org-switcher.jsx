"use client" // Required for components using client-side hooks (like useUser)

// Import necessary Clerk components and hooks
import { OrganizationSwitcher, SignedIn, useOrganization, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'; // To get the current route path
import React from 'react'

// This component renders the organization switcher UI
const OrgSwitcher = () => {
    // Check if organization data has finished loading
    const { isLoaded } = useOrganization();
    
    // Check if user data has finished loading
    const { isLoaded: isUserLoaded } = useUser();
    
    // Get the current URL path (e.g., /onboarding, /dashboard)
    const pathname = usePathname();

    // Don't render anything until both user and organization data are loaded
    if (!isLoaded || !isUserLoaded) {
        return null;
    }

    return (
        <div>
            {/* Show this block only if the user is signed in */}
            <SignedIn>
                <OrganizationSwitcher
                    hidePersonal // Hides the default personal workspace
                    afterCreateOrganizationUrl="/organization/:slug" // Redirect path after creating an org
                    afterSelectOrganizationUrl="/organization/:slug" // Redirect path after selecting an org
                    
                    // If current path is /onboarding, open switcher as full-page nav
                    // Else, open it as a modal
                    createOrganizationMode={
                        pathname === "/onboarding" ? "navigation" : "modal"
                    }

                    // Path to navigate when creating an organization
                    createOrganizationUrl="/onboarding"

                    // Custom styling for the trigger and its icon
                    appearance={{
                        elements: {
                            organizationSwitcherTrigger:
                                "border border-gray-300 rounded-md px-5 py-2", // Trigger button style
                            organizationSwitcherTriggerIcon:
                                "text-white", // Switcher dropdown icon color
                        },
                    }}
                />
            </SignedIn>
        </div>
    )
}

export default OrgSwitcher
