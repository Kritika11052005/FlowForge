"use client"

// Importing required modules, components, hooks, and utilities
import { createIssue } from "@/actions/issues"
import { getOrganizationUsers } from "@/actions/organization"
import { issueSchema } from "@/app/lib/validators"
import {
    Drawer, DrawerHeader, DrawerTrigger, DrawerClose, DrawerContent,
    DrawerTitle, DrawerDescription, DrawerFooter
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import useFetch from "@/hooks/use-fetch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { BarLoader } from "react-spinners"
import {
    Select, SelectTrigger, SelectValue, SelectItem, SelectContent
} from "@/components/ui/select"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Component to render a drawer that allows creating a new issue
const IssueCreationDrawer = ({
    isOpen, onClose, sprintId, status, projectId, onIssueCreated, orgId,
}) => {

    // React Hook Form setup with schema validation
    const {
        control,
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            priority: "MEDIUM",       // Default priority
            description: " ",         // Default empty description
            assigneeId: " ",          // Default empty assignee
        },
    });

    // Setup for the issue creation action
    const {
        loading: createIssueLoading, // true while issue is being created
        fn: createIssueFn,           // function to trigger issue creation
        data: newIssue,              // newly created issue data
        error,                       // error from issue creation
    } = useFetch(createIssue);

    // Reset form and close drawer if issue was successfully created
    useEffect(() => {
        if (newIssue) {
            reset();                 // clears the form inputs
            onClose();               // closes the drawer
            onIssueCreated();        // triggers callback in parent
            toast.success("Issue added Successfully") // show success message
        }
    }, [newIssue, createIssueLoading]);

    // Setup for fetching organization users
    const {
        loading: userLoading,
        fn: fetchUsers,
        data: users,
    } = useFetch(getOrganizationUsers);

    // Submit handler that combines form data and fixed props
    const onSubmit = async (data) => {
        await createIssueFn(projectId, {
            ...data,
            status,
            sprintId,
        });
    };

    // Fetch org users when drawer opens and org ID is available
    useEffect(() => {
        if (isOpen && orgId) {
            fetchUsers(orgId)
        }
    }, [isOpen, orgId]);

    return (
        <div>
            <Drawer open={isOpen} onClose={onClose}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader>
                        <DrawerTitle>Create New Issue</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                    </DrawerHeader>

                    {/* Show loading bar while users are being fetched */}
                    {userLoading && <BarLoader width={"100%"} color="#36d7b7" />}

                    {/* Form starts here */}
                    <form className="p-4 space-y-4 flex-1 overflow-y-auto" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Title input */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                            <Input id="title" {...register("title")} />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Assignee selection */}
                        <div>
                            <label htmlFor="Assignee" className="block text-sm font-medium mb-1">Assignee</label>
                            <Controller
                                name="assigneeId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.assigneeId && (
                                <p className="text-red-500 text-sm mt-1">{errors.assigneeId.message}</p>
                            )}
                        </div>

                        {/* Markdown description field */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <div className="max-h-48 overflow-hidden">
                                        <MDEditor value={field.value} onChange={field.onChange} />
                                    </div>
                                )}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Priority selection */}
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Show API error if any */}
                        {error && <p className="text-red-500 mt-2">{error.message}</p>}

                        {/* Submit button */}
                        <div className="p-4 border-t bg-background">
                            <Button
                                type="submit"
                                disabled={createIssueLoading}
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                onClick={handleSubmit(onSubmit)}
                            >
                                {createIssueLoading ? "Creating..." : "Create Issue"}
                            </Button>
                        </div>
                    </form>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default IssueCreationDrawer;
