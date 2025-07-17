// Import React so we can create a layout component
import React from 'react'

// Define the layout component
// It receives `children` which means any page or content inside it
const layout = ({ children }) => {
    return (
        // This container centers content horizontally (justify-center)
        // Adds padding on top (pt-20) and bottom (pb-5) for spacing
        <div className='flex justify-center pt-20 pb-5'>
            {children} 
        </div> // Render whatever content is passed inside this layout
    )
}

// Export the layout so Next.js can use it to wrap other pages/components
export default layout

