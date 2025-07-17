import React, { useEffect, useState } from 'react'

// Dialog UI components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"

// Navigation helpers from Next.js
import { usePathname, useRouter } from 'next/navigation'

// Button UI component and icon
import { Button } from './ui/button'
import { ExternalLink } from 'lucide-react'

// Clerk hooks to access user and organization
import { useOrganization, useUser } from '@clerk/nextjs'

// Issue update and delete functions
import { deleteIssue, updateIssue } from '@/actions/issues'

// Custom hook to handle fetch requests with loading and error states
import useFetch from '@/hooks/use-fetch'

// Loader component
import { BarLoader } from 'react-spinners'

// Select UI components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"

// Static list of status options
import statuses from "@/data/status"

// Markdown editor for rendering description
import MDEditor from '@uiw/react-md-editor'

// User avatar component
import UserAvatar from './ui/user-avatar'

// Priority options for the issue
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

// Component to display and update issue details inside a dialog
const IssueDetailsDialog = ({
    isOpen,        // whether the dialog is open
    onClose,       // function to close the dialog
    issue,         // issue data object
    onDelete = () => { }, // callback after successful deletion
    onUpdate = () => { }, // callback after successful update
    borderCol = " ",     // custom border color for priority select
}) => {
    // Local state for issue status and priority
    const [status, setStatus] = useState(issue.status)
    const [priority, setPriority] = useState(issue.priority)

    const { user } = useUser()
    const { membership } = useOrganization()

    const pathname = usePathname()
    const router = useRouter()

    // Set up fetch handlers for deleting and updating issue
    const {
        loading: deleteLoading,
        error: deleteError,
        fn: deleteIssueFn,
        data: deleted,
    } = useFetch(deleteIssue)

    const {
        loading: updateLoading,
        error: updateError,
        fn: updateIssueFn,
        data: updated,
    } = useFetch(updateIssue)

    // Called when status is changed
    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus)
        updateIssueFn(issue.id, { status: newStatus, priority })
    }

    // Called when priority is changed
    const handlePriorityChange = async (newPriority) => {
        setPriority(newPriority)
        updateIssueFn(issue.id, { status, priority: newPriority })
    }

    // If issue was deleted or updated, call the respective handlers
    useEffect(() => {
        if (deleted) {
            onClose()
            onDelete()
        }
        if (updated) {
            onUpdate(updated)
        }
    }, [deleted, updated, deleteLoading, updateLoading])

    // Only allow status/priority changes or deletion by reporter or admin
    const canChange = user.id === issue.reporter.clerkUserId || membership.role === "org:admin"

    // Redirect to project page
    const handleGoToProject = () => {
        router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`)
    }

    // Handle issue deletion with confirmation
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this issue?")) {
            deleteIssueFn(issue.id)
        }
    }

    // Detect if already on a project page
    const isProjectPage = pathname.startsWith("/project/")

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className='flex justify-start gap-3 items-center'>
                        <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
                        {/* Button to go to project if not already there */}
                        {!isProjectPage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleGoToProject}
                                title="Go to Project">
                                <ExternalLink className='h-4 w-4' />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {/* Show loading bar when updating or deleting */}
                {(updateLoading || deleteLoading) && (
                    <BarLoader width={"100%"} color="#36d7b7" />
                )}

                <div className='space-y-4'>
                    {/* Select for status and priority */}
                    <div className='flex items-center space-x-2'>
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((option) => (
                                    <SelectItem key={option.key} value={option.key}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={priority}
                            onValueChange={handlePriorityChange}
                            disabled={!canChange}>
                            <SelectTrigger className={`border ${borderCol} rounded`}>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Markdown description */}
                    <div>
                        <h4 className='font-semibold'>Description</h4>
                        <MDEditor.Markdown
                            className='rounded px-2 py-1'
                            source={issue.description ? issue.description : "--"}
                        />
                    </div>

                    {/* Assignee and reporter section */}
                    <div className='flex justify-between'>
                        <div className='flex flex-col gap-2'>
                            <h4 className='font-semibold'>Assignee</h4>
                            <UserAvatar user={issue.assignee} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h4 className='font-semibold'>Reporter</h4>
                            <UserAvatar user={issue.reporter} />
                        </div>
                    </div>

                    {/* Delete button if user has permission */}
                    {canChange && (
                        <Button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            variant="destructive">
                            {deleteLoading ? "Deleting..." : "Delete Issue"}
                        </Button>
                    )}

                    {/* Show error if any */}
                    {(deleteError || updateError) && (
                        <p className='text-red-500'>
                            {deleteError?.message || updateError?.message}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default IssueDetailsDialog
