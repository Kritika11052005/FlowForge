import React from 'react'
// Import avatar components
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const UserAvatar = ({ user }) => {
    return (
        // Horizontal flex box containing avatar and username
        <div className='flex items-center space-x-2 w-full'>
            {/* Avatar image box with fixed height and width */}
            <Avatar className="h-6 w-6">
                {/* Load user image if available */}
                <AvatarImage src={user?.imageUrl} alt={user?.name} />
                
                {/* If image fails or doesn't exist, show fallback initials or name */}
                <AvatarFallback className='capitalize'>
                    {user ? user.name : "?"}
                </AvatarFallback>
            </Avatar>

            {/* Username label, grayed out and small */}
            <span className='text-xs text-gray-500'>
                {user ? user.name : "Unassigned"} {/* Show name or "Unassigned" */}
            </span>
        </div>
    )
}

export default UserAvatar
