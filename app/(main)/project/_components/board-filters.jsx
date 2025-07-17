// Import components and tools needed from your UI library and React
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// Define the possible priority values for issues
const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

// Main filter component. It takes in:
// 1. issues → list of all issues
// 2. onFilterChange → function that updates filtered results
const BoardFilters = ({ issues, onFilterChange }) => {
    // Stores the text typed in the search box
    const [searchTerm, setSearchTerm] = useState("")

    // Stores which assignees (users) have been selected to filter by
    const [selectedAssignees, setSelectedAssignees] = useState([])

    // Stores selected priority to filter by (e.g. HIGH, LOW)
    const [selectedPriority, setSelectedPriority] = useState("")

    // Create a list of all unique assignees from the issues
    const assignees = issues
        .map((issue) => issue.assignee)
        .filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.id === item.id) // Remove duplicates
        );

    // Check if any filter is currently active
    const isFilterApplied =
        searchTerm !== "" ||
        selectedAssignees.length > 0 ||
        selectedPriority !== "";

    // Clear all filters (reset to default)
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedAssignees([]);
        setSelectedPriority("");
    }

    // When filters change, update the filtered issue list
    useEffect(() => {
        const filteredIssues = issues.filter((issue) =>
            // Check if issue title includes the search term
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) &&

            // Check if the assignee is selected (or skip if no assignee selected)
            (selectedAssignees.length === 0 || selectedAssignees.includes(issue.assignee?.id)) &&

            // Check if issue priority matches the selected one (or skip if none)
            (selectedPriority === "" || issue.priority === selectedPriority)
        );

        // Send filtered issues to parent component
        onFilterChange(filteredIssues)
    }, [searchTerm, selectedAssignees, selectedPriority, issues]);

    // Toggle (add/remove) assignee from selection
    const toggleAssignee = (assigneeId) => {
        setSelectedAssignees((prev) =>
            prev.includes(assigneeId)
                ? prev.filter((id) => id !== assigneeId) // Remove if already selected
                : [...prev, assigneeId] // Add if not selected
        );
    }

    return (
        <div>
            {/* Filter UI layout */}
            <div className='flex flex-col pr-2 sm:flex-row gap-4 sm:gap-6 mt-6 px-12'>
                
                {/* Search input */}
                <Input
                    className="w-full sm:w-72"
                    placeholder="Search issues...."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Assignee Avatars */}
                <div className="flex-shrink-0">
                    <div className='flex gap-2 flex-wrap'>
                        {assignees.map((assignee, i) => {
                            const selected = selectedAssignees.includes(assignee.id);
                            return (
                                <div
                                    key={assignee.id}
                                    className={`rounded-full ring ${selected ? "ring-blue-600" : "ring-black"} ${i > 0 ? "-ml-6" : ""}`}
                                    style={{ zIndex: i }}
                                    onClick={() => toggleAssignee(assignee.id)}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={assignee.imageUrl} />
                                        <AvatarFallback>
                                            {assignee.name[0]} {/* Show first letter of name if image fails */}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Priority Dropdown Selector */}
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                                {priority}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Clear filters button */}
                {isFilterApplied && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="flex items-center"
                    >
                        <X className='h-4 w-4' />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    )
}

export default BoardFilters
