import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners'

// This component wraps the Project-related pages and shows a fallback while loading
const ProjectLayout = async ({ children }) => {
    return (
        <div className='mx-auto'>
            {/* Suspense is used to show a fallback while child components are being loaded */}
            <Suspense fallback={<span>Loading Projects...</span>}>
                {children}
            </Suspense>
        </div>
    )
}

export default ProjectLayout
