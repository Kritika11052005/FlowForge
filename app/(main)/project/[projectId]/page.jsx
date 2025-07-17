import { fetchProject } from '@/actions/projects';
import { notFound } from 'next/navigation';
import React from 'react';
import SprintCreationForm from '../_components/create-sprint';
import SprintBoard from '../_components/sprint-board';

const ProjectPage = async ({ params }) => {
    // Get the projectId from the URL params
    const { projectId } = await params;

    // Fetch the project data using the projectId
    const project = await fetchProject(projectId);

    // If no project is found, show a 404 page
    if (!project) {
        notFound();
    }

    return (
        <div className='container mx-auto'>
            {/* Form to create a new sprint */}
            <SprintCreationForm
                projectTitle={project.name}
                projectId={projectId}
                projectKey={project.key}
                sprintKey={project.sprints?.length + 1} // New sprint number
            />

            {/* If the project has sprints, show the sprint board */}
            {project.sprints.length > 0 ? (
                <SprintBoard
                    sprints={project.sprints}
                    projectId={projectId}
                    orgId={project.organizationId}
                />
            ) : (
                // Message shown when no sprints are present
                <div className="m-12 font-semibold">
                    Create a Sprint from Button above
                </div>
            )}
        </div>
    );
}

export default ProjectPage;
