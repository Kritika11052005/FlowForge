// Import function to fetch projects from the server/database
import { getProject } from "@/actions/projects";

// Import Next.js Link component to navigate between pages
import Link from "next/link";

// Import UI components for styled cards
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

// Import the delete button component for each project
import DeleteProject from "./delete-project";

// This is an **async server component** that displays a list of projects
export default async function ProjectList({ orgId }) {
    // Get the list of projects for the given organization ID
    const projects = await getProject(orgId);

    // If no projects exist, show a message with a link to create a new project
    if (projects.length === 0) {
        return (
            <p>
                No Projects Found.{" "}
                <Link
                    href="/project/create"
                    className="underline underline-offset-2 text-blue-200"
                >
                    Create New
                </Link>
            </p>
        );
    }

    // If projects are found, show them in a responsive grid
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loop through all projects and display each inside a card */}
            {projects.map((project) => {
                return (
                    <Card key={project.id}>
                        {/* Card header with project name and delete button */}
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {project.name}
                                {/* Button to delete this project (only shown if admin) */}
                                <DeleteProject projectId={project.id} />
                            </CardTitle>
                        </CardHeader>

                        {/* Card content with project description and a view link */}
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">
                                {project.description}
                                <br />
                                <Link
                                    href={`/project/${project.id}`} // Link to detailed project view
                                    className="text-teal-500 hover:underline"
                                >
                                    View Project
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
