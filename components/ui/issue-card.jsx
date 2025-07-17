"use client"

import React, { useState } from 'react'
// UI components used to structure the card
import { Card, CardHeader, CardAction, CardContent, CardTitle, CardFooter } from './card';
import { Badge } from './badge';
import UserAvatar from './user-avatar';
import { formatDistanceToNow } from 'date-fns'; // Formats time like "3 days ago"
import { useRouter } from 'next/navigation';
import IssueDetailsDialog from '../issue-details-dialog';

// Define colors for each priority level to show on top border
const priorityColor = {
    LOW: "border-green-600",
    MEDIUM: "border-yellow-300",
    HIGH: "border-orange-400",
    CRITICAL: "border-red-400"
};

const IssueCard = ({
    issue,           // The issue object containing all data
    showStatus = false, // If true, shows status badge
    onDelete = () => {}, // Callback for delete action
    onUpdate = () => {}, // Callback for update action
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls dialog visibility
    const router = useRouter();

    // Refresh page and call the parent's delete handler
    const onDeleteHandler = (...params) => {
        router.refresh();
        onDelete(...params);
    }

    // Refresh page and call the parent's update handler
    const onUpdateHandler = (...params) => {
        router.refresh();
        onUpdate(...params);
    }

    // Format creation time like "3 minutes ago"
    const created = formatDistanceToNow(new Date(issue.createdAt), {
        addSuffix: true,
    });

    return (
        <>
            {/* Main card clickable container */}
            <Card
                className={`bg-black cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden ${priorityColor[issue.priority]} border-t-4`}
                onClick={() => setIsDialogOpen(true)} // Open dialog when clicked
            >
                <CardHeader>
                    <CardTitle>{issue.title}</CardTitle> {/* Issue title */}
                </CardHeader>

                <CardContent className="flex gap-2 -mt-3">
                    {showStatus && <Badge>{issue.status}</Badge>} {/* Show status if enabled */}
                    <Badge variant="secondary" className="-ml-1">
                        {issue.priority} {/* Show issue priority */}
                    </Badge>
                </CardContent>

                <CardFooter className="flex flex-col items-start space-y-3">
                    <UserAvatar user={issue.assignee} /> {/* Avatar of person assigned */}
                    <div className='text-xs text-gray-400 w-full py-2'>
                        Created {created} {/* When it was created */}
                    </div>
                </CardFooter>
            </Card>

            {/* Show issue details in a dialog when card is clicked */}
            {isDialogOpen && (
                <IssueDetailsDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)} // Close dialog
                    issue={issue}
                    onDelete={onDeleteHandler} // Delete logic
                    onUpdate={onUpdateHandler} // Update logic
                    borderCol={priorityColor[issue.priority]} // Maintain border color
                />
            )}
        </>
    );
}

export default IssueCard;
