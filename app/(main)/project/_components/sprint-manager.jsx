"use client"
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useFetch from '@/hooks/use-fetch';
import { updateSprintStatus } from '@/actions/sprints';
import { BarLoader } from 'react-spinners';
import { useRouter, useSearchParams } from 'next/navigation';
const SprintManager = ({ sprint, setSprint, sprints, projectId }) => {
    const [status, setStatus] = useState(sprint.status);
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();
    const searchParams = useSearchParams();
    const canStart = isBefore(now, endDate) && isAfter(now, startDate) && status === "PLANNED";
    const router = useRouter()
    const canEnd = status === "ACTIVE";
    const {
        fn: updateStatus,
        loading,
        data: updatedStatus,
    } = useFetch(updateSprintStatus);

    const handleStatusChange = async (newStatus) => {
        updateStatus(sprint.id, newStatus);

    }
    useEffect(() => {
        if (updatedStatus && updatedStatus.success) {
            setStatus(updatedStatus.sprint.status)
            setSprint({
                ...sprint,
                status: updatedStatus.sprint.status,

            });
        }
    }, [updatedStatus, loading])
    useEffect(() => {
        const sprintId = searchParams.get("sprint");
        if (sprintId && sprintId !== sprint.id) {
            const selectedSprint = sprints.find((s) => s.id === sprintId)
            if (selectedSprint) {
                setSprint(selectedSprint);
                setStatus(selectedSprint.status)
            }
        }
    }, [searchParams, sprints])

    const handleSprintChange = (value) => {
        const selectedSprint = sprints.find((s) => s.id === value);
        setSprint(selectedSprint);
        setStatus(selectedSprint.status);
        router.replace(`/project/${projectId}`, undefined, { shallow: true });

    }
    const getStatusText = () => {
        if (status === "COMPLETED") {
            return `Sprint Ended`
        }
        if (status === "ACTIVE" && isAfter(now, endDate)) {
            return `Overdue by ${formatDistanceToNow(endDate)}`
        }

        if (status === "PLANNED" && isBefore(now, startDate)) {
            return `Start in ${formatDistanceToNow(startDate)}`
        }
        return null;
    }

    return (
        <>
            <div className='px-12 flex justify-between items-center mr-3  gap-4'>
                <Select value={sprint.id} onValueChange={handleSprintChange}>
                    <SelectTrigger className="bg-slate-950 self-start w-300">
                        <SelectValue placeholder="Select Sprint" />
                    </SelectTrigger>
                    <SelectContent >
                        {sprints.map((sprint) => {
                            return (
                                <SelectItem key={sprint.id} value={sprint.id}>
                                    {sprint.name} ({format(sprint.startDate, "MMM d,yyyy")})to{" "}{format(sprint.endDate, "MMM d,yyyy")}
                                </SelectItem>
                            )
                        })}

                    </SelectContent>
                </Select>

                <div className="flex gap-2 mr-3">
                    {canStart && (<Button
                        onClick={() => handleStatusChange("ACTIVE")}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        disabled={loading}>
                        Start Sprint
                    </Button>
                    )}
                    {loading && <BarLoader width={"100%"} className="mt-2" color="#36d7b7" />}
                    {canEnd && (
                        <Button variant="destructive"
                            onClick={() => handleStatusChange("COMPLETED")}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                            End Sprint
                        </Button>
                    )}
                </div>
            </div>
            <div className='px-11'>
                {getStatusText() && (
                    <Badge className="mr-3  mt-3 ml-1 self start">
                        {getStatusText()}
                    </Badge>
                )}
            </div>


        </>
    )
}

export default SprintManager
