// Import the SignUp component from Clerk (shows a sign-up form)
import { SignUp } from '@clerk/nextjs'

// Import React to define a React component
import React from 'react'

// This component renders the sign-up page
const SignUpPage = () => {
    return (
        // This displays the Clerk sign-up form UI
        <SignUp />
    )
}

// Export this component so it can be used in your app (example: /sign-up route)
export default SignUpPage
