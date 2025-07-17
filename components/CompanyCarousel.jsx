"use client" // Tells Next.js this component should render on the client side

import React from 'react'
// Import autoplay plugin for the carousel
import Autoplay from 'embla-carousel-autoplay'
// Import Carousel components from your UI library
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
// Import company logos data
import companies from "@/data/companies"
// Import Next.js Image component for optimized image rendering
import Image from 'next/image'

// Component that shows a scrolling list of company logos
const CompanyCarousel = () => {
    return (
        <Carousel
            // Enable autoplay plugin with 2 second delay
            plugins={[
                Autoplay({
                    delay: 2000,
                }),
            ]}
            className="w-full py-10" // Full width with vertical padding
        >
            <CarouselContent className="flex gap-5 sm:gap-20 items-center">
                {/* Loop through each company and render its logo */}
                {companies.map((company) => {
                    return (
                        <CarouselItem key={company.id} className="basis-1/3 lg:basis-1/6">
                            {/* Logo image with fixed height and responsive width */}
                            <Image
                                className='h-9 sm:h-14 w-auto object-contain'
                                src={company.path}
                                alt={company.name}
                                width={200}
                                height={56}
                            />
                        </CarouselItem>
                    )
                })}
            </CarouselContent>
        </Carousel>
    )
}

export default CompanyCarousel
