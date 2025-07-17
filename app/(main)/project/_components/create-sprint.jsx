// This is a client-side component
"use client"

// Importing the action to create a new sprint
import { createSprint } from '@/actions/sprints';
// Importing the schema to validate sprint form data
import { sprintSchema } from '@/app/lib/validators';
// UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// For form validation using zod
import { zodResolver } from '@hookform/resolvers/zod';
// Utility to add days to a date
import { addDays, format } from 'date-fns';
// Icon used in the date picker
import { CalculatorIcon } from 'lucide-react';
// React core functionality
import React, { useState } from 'react'
// react-hook-form for handling form logic
import { Controller, useForm } from 'react-hook-form';
// Date picker component
import { DayPicker } from 'react-day-picker';
import "react-day-picker/dist/style.css";
// Custom hook to handle async API calls
import useFetch from '@/hooks/use-fetch';
// Toast for user feedback after actions
import { toast } from 'sonner';
// Used to refresh or navigate pages
import { useRouter } from 'next/navigation';

// The main component for creating sprints
const SprintCreationForm = ({ projectTitle, projectKey, projectId, sprintKey }) => {
    // State to toggle form visibility (true = show form, false = hide form)
    const [showForm, setForm] = useState(false);

    // Default date range: today to 14 days later
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: addDays(new Date(), 14),
    });

    // Router to refresh page after creating sprint
    const router = useRouter();

    // Setup form handling using useForm
    const { register, handleSubmit, formState: { errors }, control } = useForm({
        // zod will validate the form inputs based on schema
        resolver: zodResolver(sprintSchema),
        // Default values for form inputs
        defaultValues: {
            name: `${projectKey}-${sprintKey}`,  // Automatically generate sprint name
            startDate: dateRange.from,
            endDate: dateRange.to,
        },
    });

    // useFetch handles the async function and loading state
    const { loading: createSprintLoading, fn: createSprintFn } = useFetch(createSprint);

    // Function called when form is submitted
    const onSubmit = async (data) => {
        // Call createSprint API with form data
        await createSprintFn(projectId, {
            ...data,
            startDate: dateRange.from,
            endDate: dateRange.to,
        });

        // Hide the form after successful creation
        setForm(false);

        // Show success message
        toast.success("Sprint Created Successfully!");

        // Refresh the page to show new sprint
        router.refresh();
    }

    return (
        <>
            {/* Top section: Project title and button to show/hide form */}
            <div className="px-6 py-4 mx-6">
                <div className="flex items-center justify-start">
                    <h1 className="text-5xl font-bold gradient-title px-4">
                        {projectTitle}
                    </h1>

                    {/* Toggle create sprint form on button click */}
                    <Button
                        onClick={() => setForm(!showForm)}
                        variant={showForm ? "destructive" : "default"}
                        className="ml-auto mr-6"
                    >
                        {showForm ? "Cancel" : "Create New Sprint"}
                    </Button>
                </div>
            </div>

            {/* Show form only if showForm is true */}
            {showForm && (
                <div className="mx-10">
                    <Card className="pt-4 mb-4">
                        <CardContent>
                            <form className="flex gap-4 items-end" onSubmit={handleSubmit(onSubmit)}>

                                {/* Sprint name input (read-only) */}
                                <div className="flex-1 px-6">
                                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                                        Sprint Name
                                    </label>
                                    <Input
                                        id="name"
                                        readOnly
                                        className="bg-slate-950"
                                        {...register("name")}
                                    />
                                    {/* Show validation error if any */}
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Sprint duration picker */}
                                <div className='flex-1'>
                                    <label className='block text-sm font-medium mb-1'>
                                        Sprint Duration
                                    </label>
                                    <Controller
                                        control={control}
                                        name="dateRange"
                                        render={({ field }) => {
                                            return (
                                                <Popover>
                                                    {/* Button that shows selected date or asks to pick one */}
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={`w-full justify-start text-left font-normal bg-slate-950 ${!dateRange && "text-muted-foreground"}`}>
                                                            <CalculatorIcon className='mr-2 h-4 w-4' />
                                                            {dateRange.from && dateRange.to ? (
                                                                format(dateRange.from, "LLL dd,y") + " - " + format(dateRange.to, "LLL dd,y")
                                                            ) : (
                                                                <span>Pick a Date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>

                                                    {/* Actual date range selector popup */}
                                                    <PopoverContent className="w-auto bg-slate-900" align="start">
                                                        <DayPicker
                                                            mode="range"
                                                            selected={dateRange}
                                                            onSelect={(range) => {
                                                                // When user selects valid range, update state and form value
                                                                if (range?.from && range?.to) {
                                                                    setDateRange(range)
                                                                    field.onChange(range)
                                                                }
                                                            }}
                                                            classNames={{
                                                                chevron: "fill-blue-500",
                                                                range_start: "bg-blue-700",
                                                                range_end: "bg-blue-700",
                                                                range_middle: "bg-blue-400",
                                                                day_button: "border-none",
                                                                today: "border-2 border-blue-700",
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )
                                        }}
                                    />
                                </div>

                                {/* Submit button to create sprint */}
                                <Button type="submit" disabled={createSprintLoading}>
                                    {createSprintLoading ? "Creating..." : "Create Sprint"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}

export default SprintCreationForm
