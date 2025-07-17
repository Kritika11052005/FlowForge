
// It helps manage the loading, success, and error states for async operations (like API calls)

const { useState } = require("react") // Import useState from React to track states
import { toast } from "sonner" // Import toast from Sonner for showing error messages

const useFetch = (cb) => {
    // `data` holds the result returned from the async function
    const [data, setData] = useState(undefined);

    // `loading` is true when the async function is in progress
    const [loading, setLoading] = useState(null);

    // `error` holds any error thrown during the async call
    const [error, setError] = useState(null);

    // `fn` is the function you will call from your component
    // It runs the passed `cb` async function and updates the states accordingly
    const fn = async (...args) => {
        setLoading(true); // Start loading
        setError(null);   // Reset any previous error

        try {
            const response = await cb(...args); // Call the async function with arguments
            setData(response); // Store successful result
            setError(null);    // Clear error state just in case
        } catch (error) {
            setError(error);         // Save error in state
            toast.error(error.message); // Show error message in toast popup
        } finally {
            setLoading(false); // Stop loading no matter what
        }
    }

    // Return everything needed from this hook
    return { data, loading, error, fn, setData }
}

export default useFetch // Export this hook for use in components
