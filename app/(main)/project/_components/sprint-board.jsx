"use client" // Enables client-side rendering in Next.js

import React, { useEffect, useState } from 'react'
import SprintManager from './sprint-manager';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import statuses from "@/data/status";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import IssueCreationDrawer from './create-issue';
import useFetch from '@/hooks/use-fetch';
import { getIssuesForSprint, updateIssueOrder } from '@/actions/issues';
import { BarLoader } from 'react-spinners';
import IssueCard from '@/components/ui/issue-card';
import { toast } from 'sonner';
import BoardFilters from './board-filters';

// Rearranges a list when an item is moved
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed);

    return result;
}

// SprintBoard displays the kanban-style issue board for the current sprint
const SprintBoard = ({ sprints, projectId, orgId }) => {
    // Set default sprint (active one if available, else first)
    const [currentSprint, setCurrentSprint] = useState(
        sprints.find((spr) => spr.status === "ACTIVE") || sprints[0]
    );

    const [isDrawerOpen, setIsDrawerOpen] = useState(false) // Drawer toggle for creating issue
    const [selectedStatus, setSelectedStatus] = useState(null) // Track which column create-issue opens in

    // Called when "Create Issue" button is clicked
    const handleAddIssue = (status) => {
        setSelectedStatus(status);
        setIsDrawerOpen(true);
    }

    // Fetch issues from backend using custom hook
    const {
        loading: issuesLoading,
        error: issuesError,
        fn: fetchIssues,
        data: issues,
        setData: setIssues,
    } = useFetch(getIssuesForSprint);

    // Load issues when sprint changes
    useEffect(() => {
        if (currentSprint.id) {
            fetchIssues(currentSprint.id)
        }
    }, [currentSprint.id])

    // For filtered issues (e.g., by user or label)
    const [filteredIssues, setFilteredIssues] = useState(issues)

    // Called when filter changes (updates displayed issues)
    const handleFilterChange = (newFilterIssues) => {
        setFilteredIssues(newFilterIssues)
    }

    // Called when new issue is created
    const handleIssueCreated = () => {
        fetchIssues(currentSprint.id)
    }

    // Fetch function for updating issue order
    const {
        fn: updateIssueOrderFn,
        loading: updateIssueLoading,
        error: updateIssuesError,
    } = useFetch(updateIssueOrder);

    // Called when drag ends (reordering issues)
    const onDragEnd = async (result) => {
        // If sprint not started or is over, disallow reordering
        if (currentSprint.status === "PLANNED") {
            toast.warning("Start the sprint to update board");
            return;
        }

        if (currentSprint.status === "COMPLETED") {
            toast.warning("Cannot update board after sprint end");
            return;
        }

        const { destination, source } = result;
        if (!destination) return;

        // No change in position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Prepare updated list of issues
        const newOrderedData = [...issues];
        const sourceList = newOrderedData.filter((list) => list.status === source.droppableId);
        const destinationList = newOrderedData.filter((list) => list.status === destination.droppableId)

        // Move within same column
        if (source.droppableId === destination.droppableId) {
            const reorderedCards = reorder(
                sourceList, source.index, destination.index
            );

            // Update order field for each card
            reorderedCards.forEach((card, i) => {
                card.order = i;
            })
        } else {
            // Move to different column
            const [movedCard] = sourceList.splice(source.index, 1);
            movedCard.status = destination.droppableId;

            destinationList.splice(destination.index, 0, movedCard)

            // Update order field for both columns
            sourceList.forEach((card, i) => {
                card.order = i;
            });
            destinationList.forEach((card, i) => {
                card.order = i;
            })
        }

        // Combine all issues and sort by order
        const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);

        // Update UI and backend
        setIssues(newOrderedData, sortedIssues)
        updateIssueOrderFn(sortedIssues)
    };

    // Show error if failed to load issues
    if (issuesError) return <div>Error loading issues</div>

    return (
        <div>
            {/* Dropdown to select sprint */}
            <SprintManager
                sprint={currentSprint}
                setSprint={setCurrentSprint}
                sprints={sprints}
                projectId={projectId}
            />

            {/* Filters visible only when issues are loaded */}
            {issues && !issuesLoading && (
                <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
            )}

            {/* Show loading bar when fetching issues */}
            {issuesLoading && (
                <BarLoader className='mt-4' width={"100%"} color="#36d7b7" />
            )}

            {/* Show error if issue reordering fails */}
            {updateIssuesError && (
                <p className='text-red-500 mt-2'>{updateIssuesError.message}</p>
            )}

            {/* Show loader during drag update or fetch */}
            {(updateIssueLoading || issuesLoading) && (
                <BarLoader className='mt-4' width={"100%"} color="#36d7b7" />
            )}

            {/* Main kanban board */}
            <div className="px-12 pr-17">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg'>
                        {/* Loop through each status column */}
                        {statuses.map((column) => (
                            <Droppable key={column.key} droppableId={column.key}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className='space-y-2'
                                    >
                                        <h3 className="font-semibold mb-4 text-center">
                                            {column.name}
                                        </h3>

                                        {/* Show issues for this column */}
                                        {filteredIssues?.filter((issue) => issue.status === column.key)
                                            .map((issue, index) => (
                                                <Draggable
                                                    key={issue.id}
                                                    draggableId={issue.id}
                                                    index={index}
                                                    isDragDisabled={updateIssueLoading}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <IssueCard
                                                                issue={issue}
                                                                onDelete={() => fetchIssues(currentSprint.id)}
                                                                onUpdate={(updated) =>
                                                                    setIssues((issues) =>
                                                                        issues.map((issue) =>
                                                                            issue.id === updated.id
                                                                                ? updated
                                                                                : issue
                                                                        )
                                                                    )}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                        {provided.placeholder}

                                        {/* Show "Create Issue" button in TODO column if sprint is not completed */}
                                        {column.key === "TODO" &&
                                            currentSprint.status !== "COMPLETED" && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full"
                                                    onClick={() => handleAddIssue(column.key)}
                                                >
                                                    <Plus className='mr-2 h-4 w-4' />
                                                    Create Issue
                                                </Button>
                                            )}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                {/* Drawer for issue creation */}
                <IssueCreationDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    sprintId={currentSprint.id}
                    status={selectedStatus}
                    projectId={projectId}
                    onIssueCreated={handleIssueCreated}
                    orgId={orgId}
                />
            </div>
        </div>
    )
}

export default SprintBoard
