"use client"
import OrgSwitcher from '@/components/org-switcher';
import { useOrganization, useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/app/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { createProject } from '@/actions/projects';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CreateProjectPage = () => {
    const { isLoaded: isOrgLoaded, membership, organization } = useOrganization();
    const { isLoaded: isUserLoaded, user } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: {
        errors
    } } = useForm({
        resolver: zodResolver(projectSchema),
    });

    useEffect(() => {
        if (isOrgLoaded && isUserLoaded && membership) {
            console.log("Membership:", membership);
            console.log("User role:", membership.role);
            console.log("Organization:", organization);

            const adminStatus = membership.role === 'org:admin';
            console.log("Is admin:", adminStatus);
            setIsAdmin(adminStatus);
        }
    }, [isOrgLoaded, isUserLoaded, membership, organization]);

    const {
        data: project,
        loading,
        error,
        fn: createProjectFn,
    } = useFetch(createProject);

    useEffect(() => {
        if (project) {
            toast.success("Project Created Successfully");
            router.push(`/project/${project.id}`);
        }
    }, [project, router]);

    if (!isOrgLoaded || !isUserLoaded) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const onSubmit = async (data) => {
        console.log("Form data:", data);
        console.log("Organization ID:", organization?.id);
        createProjectFn(data);
    }

    if (!isAdmin) {
        return (
            <div className='flex flex-col gap-4 items-center justify-center min-h-screen px-4'>
                <span className="text-2xl gradient-title text-center">
                    Oops! Only Admins can create projects.
                </span>
                <p className="text-gray-600 text-center">
                    Current role: {membership?.role || "No role found"}
                </p>
                <OrgSwitcher />
            </div>
        )
    }

    return (
        <div className='container mx-auto py-10 px-4 sm:px-6 lg:px-8'>
            <h1 className='text-6xl text-center font-bold mb-8 gradient-title py-2'>Create New Project</h1>

            <form className='flex flex-col space-y-4 max-w-2xl mx-auto sm:p-12' onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Input
                        id="name"
                        className="bg-slate-950"
                        placeholder="Project Name"
                        {...register("name")}
                    />
                    {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
                </div>
                <div>
                    <Input
                        id="key"
                        className="bg-slate-950"
                        placeholder="Project key (ex: KBEN)"
                        {...register("key")}
                    />
                    {errors.key && <p className='text-red-500 text-sm mt-1'>{errors.key.message}</p>}
                </div>
                <div>
                    <Textarea
                        id="description"
                        className="bg-slate-950 h-45"
                        placeholder="Project Description"
                        {...register("description")}
                    />
                    {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description.message}</p>}
                </div>
                <Button disabled={loading} type="submit" size="lg" className="bg-orange-600 hover:bg-amber-700 !text-white">
                    {loading ? "Creating..." : "Create Project"}
                </Button>
                {error && <p className='text-red-500 text-sm mt-1'>{error.message}</p>}
            </form>
        </div>
    )
}

export default CreateProjectPage