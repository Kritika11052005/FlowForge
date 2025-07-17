"use client"
import { createIssue } from "@/actions/issues";
import { getOrganization, getOrganizationUsers } from "@/actions/organization";
import { issueSchema } from "@/app/lib/validators";
import { Drawer, DrawerHeader, DrawerTrigger, DrawerClose, DrawerContent, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { BarLoader } from "react-spinners";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
const IssueCreationDrawer = ({
    isOpen, onClose, sprintId, status, projectId, onIssueCreated, orgId,
}) => {

    const {
        control,
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            priority: "MEDIUM",
            description: " ",
            assigneeId: " ",
        },

    });
    const {
        loading: createIssueLoading,
        fn: createIssueFn,
        data: newIssue,
        error,

    } = useFetch(createIssue);

    useEffect(() => {
        if (newIssue) {
            reset();
            onClose();
            onIssueCreated();
            toast.success("Issue added Successfully")

        }

    }, [newIssue, createIssueLoading])

    const {
        loading: userLoading,
        fn: fetchUsers,
        data: users,


    } = useFetch(getOrganizationUsers);

    const onSubmit = async (data) => {
        await createIssueFn(projectId, {
            ...data,
            status,
            sprintId,
        });
    };
    useEffect(() => {
        if (isOpen && orgId) {
            fetchUsers(orgId)
        }
    }, [isOpen, orgId])
    return (
        <div>
            <Drawer open={isOpen} onClose={onClose}>

                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader>
                        <DrawerTitle>Create New Issue</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                    </DrawerHeader>
                    {userLoading && <BarLoader width={"100%"} color="#36d7b7" />}
                    <form className="p-4 space-y-4 flex-1 overflow-y-auto" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">
                                Title

                            </label>
                            <Input id="title" {...register("title")} />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="Assignee" className="block text-sm font-medium mb-1">
                                Assignee

                            </label>
                            <Controller className="block text-sm font-medium mb-1 w-full" name="assigneeId" control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-full" >
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
                                )} />
                            {errors.assigneeId && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.assigneeId.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">
                                Description

                            </label>
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
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium mb-1">
                                Priority

                            </label>
                            <Controller name="priority" control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />

                        </div>
                        {error && <p className="text-red-500 mt-2">{error.message}</p>}
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


