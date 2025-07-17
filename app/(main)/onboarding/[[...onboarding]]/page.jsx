"use client"
import { OrganizationList, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Onboarding = () => {
    const { organization } = useOrganization();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);


    if (organization && hasRedirected) {
        return (
            <div className='flex justify-center items-center pt-14'>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex justify-center items-center pt-14'>
            <OrganizationList
                hidePersonal
                afterCreateOrganizationUrl="/organization/:slug"
                afterSelectOrganizationUrl="/organization/:slug"
            />
        </div>
    );
};

export default Onboarding;


