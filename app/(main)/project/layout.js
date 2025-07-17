// Define a Layout component that accepts `children` (the nested page content)
const Layout = ({ children }) => {
    return (
        // This wrapper div centers the content and adds top margin
        <div className="container mx-auto mt-5">
            {/* Render whatever is passed as children inside this layout */}
            {children}
        </div>
    );
}

// Export the Layout component so it can be used in other files
export default Layout;
