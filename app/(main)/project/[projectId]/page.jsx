import { fetchProject } from '@/actions/projects';
import { notFound } from 'next/navigation';
import React from 'react'
import SprintCreationForm from '../_components/create-sprint';
import SprintBoard from '../_components/sprint-board';
const ProjectPage = async ({ params }) => {
    const { projectId } = await params;

    const project = await fetchProject(projectId);
    if (!project) {
        notFound();
    }

    return (
        <div className='container mx-auto'>
            <SprintCreationForm
                projectTitle={project.name}
                projectId={projectId}
                projectKey={project.key}
                sprintKey={project.sprints?.length + 1}

            />
            {project.sprints.length > 0 ? (
                <>
                    <SprintBoard
                        sprints={project.sprints}
                        projectId={projectId}
                        orgId={project.organizationId}
                    />
                </>
            ) : (
                <div className="m-12 font-semibold">
                    Create a Sprint from Button above
                </div>
            )}
        </div>
    )
}

export default ProjectPage
