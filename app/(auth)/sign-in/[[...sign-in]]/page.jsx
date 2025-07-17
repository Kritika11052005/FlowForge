// Import the SignIn component from Clerk (handles the sign-in UI for you)
import { SignIn } from '@clerk/nextjs'

// Import React so we can create a component
import React from 'react'

// This is a React component that renders the Sign In page
const SignInPage = () => {
    return (
        // Display the Clerk sign-in form on the page
        <SignIn />
    )
}

// Export the SignInPage so Next.js can use it as a route (e.g., /sign-in)
export default SignInPage
