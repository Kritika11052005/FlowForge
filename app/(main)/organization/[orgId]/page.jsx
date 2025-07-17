
import { getOrganization } from '@/actions/organization'
import OrgSwitcher from '@/components/org-switcher';
import React from 'react'
import ProjectList from './_components/project-list';
import UserIssues from './_components/user-issues';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
const Organization = async ({ params }) => {
    const { userId } = await auth();
    const { orgId } = await params
    if (!userId) {
        redirect("/sign-in");
    }
    const organization = await getOrganization(orgId);


    if (!organization) {
        return (
            <div>
                Organization Not Found
            </div>
        )
    }
    return (
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='mb-4 flex flex-col sm:flex-row justify-between items-start gap-4 relative'>
                <div className='absolute left-0 top-0'>
                    <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold gradient-title pb-2 text-left'>
                        {organization.name}&rsquo;s Projects
                    </h1>
                </div>
                <div className='transform scale-110 sm:scale-125 lg:scale-150 origin-top-right sm:origin-top-right flex-shrink-0 ml-auto'>
                    <OrgSwitcher />
                </div>
            </div>
            <div className='mb-4 mt-16'>
                <ProjectList orgId={organization.id} />
            </div>
            <div className='mt-8'>
                <UserIssues userId={userId} />
            </div>
        </div>
    )

}

export default Organization
