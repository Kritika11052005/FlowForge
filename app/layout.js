
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";
import { Github, Linkedin, Mail } from "lucide-react";
import { Inter } from 'next/font/google'
import Header from "@/components/ui/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";



export const metadata = {
  title: "FlowForge - Modern Project Management & Task Collaboration Platform",
  description: "FlowForge is a sleek, fast, and intuitive project management tool designed for teams and individuals. Plan tasks, track progress, collaborate in real-time, and boost productivity—all in one powerful platform.",
  icons: {
    icon: '/FlowForge.png'
  },
};
const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({ children }) {


  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#1a202c',
          colorInputBackground: '#2D3748',
          colorInputText: '#F3F4F6',
        },
        
        elements: {
          formButtonPrimary: "!text-white",

          headerTitle: "!text-blue-400",
          headerSubtitle: "!text-gray-400",
        },
      }}

    >
      <html lang="en" suppressHydrationWarning>

        <body className={`${inter.className} gradient-background`}>

          <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>

            <Header />


            <main className="min-h-screen">
              {children}

            </main>
            <Toaster richColors />
            <footer className="bg-gray-900 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200 space-y-4">
                <p className="text-lg">Made by: </p>
                <p className="text-3xl font-bold">Kritika Benjwal</p>
                <p className="text-lg">Connect with me:</p>
                <div className="flex justify-center items-center gap-6 text-gray-300">
                  <a
                    href="https://www.linkedin.com/in/kritika-benjwal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition"
                  >
                    <Linkedin size={28} />
                  </a>
                  <a
                    href="https://github.com/Kritika11052005"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-500 transition"
                  >
                    <Github size={28} />
                  </a>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=ananya.benjwal@gmail.com"
                    target="_blank"
                    className="hover:text-red-400 transition"
                  >
                    <Mail size={28} />
                  </a>
                </div>
              </div>
            </footer>

          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}

