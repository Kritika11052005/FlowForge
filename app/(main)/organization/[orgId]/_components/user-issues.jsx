// Import core React tools and Suspense (used for async loading states)
import React, { Suspense } from 'react'

// Import tab components from your UI library
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import custom UI component to display a single issue
import IssueCard from '@/components/ui/issue-card'

// Import function to get all issues related to the user
import { getUserIssues } from '@/actions/issues'

// This is a Server Component (because it's async and fetches data)
// It displays issues assigned or reported by a specific user
export default async function UserIssues({ userId }) {
    // Get all issues related to this user from the backend
    const issues = await getUserIssues(userId);

    // If there are no issues at all, show nothing
    if (issues.length === 0) {
        return null;
    }

    // Filter the issues that were assigned to the user
    const assignedIssues = issues.filter(
        (issue) => issue.assignee.clerkUserId === userId
    );

    // Filter the issues that were reported by the user
    const reportedIssues = issues.filter(
        (issue) => issue.reporter.clerkUserId === userId
    );

    return (
        <div>
            {/* Section Title */}
            <h1 className='text-4xl font-bold gradient-title mb-4'>
                My Issues
            </h1>

            {/* Tabbed view for separating Assigned and Reported issues */}
            <Tabs defaultValue="assigned" className="w-full">
                <TabsList>
                    <TabsTrigger value="assigned">Assigned To You</TabsTrigger>
                    <TabsTrigger value="reported">Reported By You</TabsTrigger>
                </TabsList>

                {/* Tab for issues assigned to the user */}
                <TabsContent value="assigned">
                    {/* Suspense for smoother UX while loading */}
                    <Suspense fallback={<div>Loading...</div>}>
                        <IssueGrid issues={assignedIssues} />
                    </Suspense>
                </TabsContent>

                {/* Tab for issues reported by the user */}
                <TabsContent value="reported">
                    <Suspense fallback={<div>Loading...</div>}>
                        <IssueGrid issues={reportedIssues} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper component that takes a list of issues and renders them in a grid
function IssueGrid({ issues }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* For each issue, show an issue card */}
            {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} showStatus />
            ))}
        </div>
    );
}
