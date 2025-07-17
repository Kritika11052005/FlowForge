import { ThemeProvider } from "@/components/ui/theme-provider"; // Enables dark/light theme toggling
import "./globals.css"; // Global CSS styles
import { Github, Linkedin, Mail } from "lucide-react"; // Social icons
import { Inter } from 'next/font/google'; // Google Font
import Header from "@/components/ui/Header"; // Top navigation bar
import { ClerkProvider } from "@clerk/nextjs"; // Clerk for authentication
import { shadesOfPurple } from "@clerk/themes"; // Clerk UI theme
import { Toaster } from "@/components/ui/sonner"; // Toast notifications

// Metadata used for SEO and favicon
export const metadata = {
  title: "FlowForge - Modern Project Management & Task Collaboration Platform",
  description: "FlowForge is a sleek, fast, and intuitive project management tool designed for teams and individuals. Plan tasks, track progress, collaborate in real-time, and boost productivity—all in one powerful platform.",
  icons: {
    icon: '/FlowForge.png'
  },
};

const inter = Inter({ subsets: ["latin"] }); // Loads the Inter font

// Root layout of the app, wraps all pages
export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple, // Sets base Clerk theme
        variables: {
          colorPrimary: '#3b82f6', // Button & link color
          colorBackground: '#1a202c', // Main background color
          colorInputBackground: '#2D3748', // Input box background
          colorInputText: '#F3F4F6', // Input text color
        },
        elements: {
          formButtonPrimary: "!text-white", // Form button text color
          headerTitle: "!text-blue-400", // Title color
          headerSubtitle: "!text-gray-400", // Subtitle color
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} gradient-background`}> {/* Uses Inter font and background gradient */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system" // Uses system theme by default
            enableSystem // Enables switching between light and dark automatically
            disableTransitionOnChange // Disables animation flicker on theme change
          >
            <Header /> {/* Renders the top navigation header */}

            <main className="min-h-screen">
              {children} {/* Renders the content of the page */}
            </main>

            <Toaster richColors /> {/* Toast notification component */}

            {/* Footer section */}
            <footer className="bg-gray-900 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200 space-y-4">
                <p className="text-lg">Made by: </p>
                <p className="text-3xl font-bold">Kritika Benjwal</p>
                <p className="text-lg">Connect with me:</p>
                <div className="flex justify-center items-center gap-6 text-gray-300">
                  {/* LinkedIn link */}
                  <a
                    href="https://www.linkedin.com/in/kritika-benjwal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition"
                  >
                    <Linkedin size={28} />
                  </a>
                  {/* GitHub link */}
                  <a
                    href="https://github.com/Kritika11052005"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-500 transition"
                  >
                    <Github size={28} />
                  </a>
                  {/* Gmail link */}
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
