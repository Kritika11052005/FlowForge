"use client"; // This tells Next.js to run this file on the client side

// Import the user menu button component from Clerk
import { UserButton } from '@clerk/nextjs';

// Import an icon to show next to the label (used inside menu)
import { ChartNoAxesGantt } from 'lucide-react';

import React from 'react'

// This component shows the user profile button in the UI
const UserMenu = () => {
    return (
        <div>
            <UserButton
                // This lets you customize how the button looks
                appearance={{
                    elements: {
                        avatarBox: "w-10 h-10", // Sets width and height of the avatar
                    }
                }}
            >
                {/* This section shows dropdown menu items inside the user menu */}
                <UserButton.MenuItems>
                    {/* A link in the menu that takes user to onboarding page */}
                    <UserButton.Link
                        label="My Organizations" // Text shown in the menu
                        labelIcon={<ChartNoAxesGantt size={15} />} // Small icon next to label
                        href="onboarding" // Where this link goes
                    />
                    
                    {/* A button that triggers "manage account" action in Clerk */}
                    <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
            </UserButton>
        </div>
    );
}

// Exporting this component so it can be used in other files
export default UserMenu;
