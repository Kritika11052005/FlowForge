"use client"

import React from 'react'
import Autoplay from 'embla-carousel-autoplay';
import { Carousel ,CarouselContent, CarouselItem } from './ui/carousel';
import companies from "@/data/companies"
import Image from 'next/image';
const CompanyCarousel = () => {
return (
<Carousel
    plugins={[
        Autoplay({
        delay: 2000,
        }),
    ]}
    className="w-full py-10"
    >
<CarouselContent className="flex gap-5 sm:gap-20 items-center">
    {companies.map((company)=>{
        return(
            <CarouselItem key={company.id} className="basis-1/3 lg:basis-1/6">
                <Image className='h-9 sm:h-14 w-auto object-contain'src={company.path} alt={company.name} width={200} height={56}/>
            </CarouselItem>
            
        )
    })}
</CarouselContent>

    </Carousel>
)
}

export default CompanyCarousel
