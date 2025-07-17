"use client" // This tells Next.js to run this file on the client side

import * as React from "react"
// Import the ThemeProvider from next-themes to enable dark/light themes
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Custom ThemeProvider component
export function ThemeProvider({
  children, // All the content that will be wrapped inside the theme provider
  ...props // Any other props like defaultTheme or attribute
}) {
  // Wrap the children with the NextThemesProvider and pass all props to it
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
