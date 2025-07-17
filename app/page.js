// Import necessary components and icons
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Calendar, ChevronRight, Layout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Import FAQ data and UI components
import faqs from "@/data/faqs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import CompanyCarousel from "@/components/CompanyCarousel";

// Define list of features with title, description, and icon
const features = [
  {
    title: "Intuitive Kanban Boards",
    description: "Visualize your workflow and optimize team productivity with our easy-to-use Kanban boards.",
    icon: Layout,
  },
  {
    title: "Powerful Sprint Planning",
    description: "Plan and manage sprints effectively, ensuring your team stays focused on delivering value.",
    icon: Calendar,
  },
  {
    title: "Comprehensive Reporting",
    description: "Gain insight into your team's performance with detailed, customizable reports and analytics.",
    icon: BarChart,
  },
];

// Main homepage component
export default function Home() {
  return (
    <div className="min-h-screen">
      
      {/* Hero section with heading, subtitle, and buttons */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pulse-text pb-6 flex flex-col">
          Forge Your Workflow,<br />
          <span>
            Unleash Efficiency with{" "}
            <Image
              src={"/FlowForgeBanner.png"} // Logo image
              alt="FlowForge"
              width={600}
              height={120}
              className="h-[120px] sm:h-[120px] w-auto object-contain inline-block"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Intuitive Tools for Seamless Management and Collaboration.
        </p>

        {/* Action buttons */}
        <Link href="/onboarding">
          <Button size="lg" className="mr-2">
            Get Started
            <ChevronRight size={18} />
          </Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="secondary" className="mr-4 bg-black text-white hover:bg-gray-900 !important">
            Learn More
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </Link>
      </section>

      {/* Features section */}
      <section id="features" className="bg-gradient-to-b from-[#2E8B8B] to-[#1A252F] py-20 px-5 text-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>

          {/* Render feature cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="pt6">
                  <feature.icon className="h-12 w-12 mb-4 text-blue-300" />
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted companies carousel section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Trusted by Industry Leaders</h3>
          <CompanyCarousel />
        </div>
      </section>

      {/* FAQ section using accordion */}
      <section className="bg-gradient-to-b from-[#2E8B8B] via-[#1A252F] to-[#0F1A24] py-20 px-5 text-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h3>

          {/* Loop through FAQ items */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final call-to-action section */}
      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-xl mb-12">
            Join thousands of teams already using FlowForge to streamline their projects and boost productivity
          </p>

          {/* Start for Free button */}
          <Link href="/onboarding">
            <Button size="lg" className="animate-bounce">
              Start For Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
