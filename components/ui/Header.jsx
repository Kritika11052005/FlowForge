import { SignedIn, SignedOut ,SignInButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "./button"
import Link from "next/link";
import Image from "next/image"
import { PenBox } from "lucide-react";
import UserMenu from "../user-meny";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "../user-loading";


const Header = async() => {
    await checkUser();
    return (
        <header className="container mx-auto">
    <nav className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href='/'>
            <Image src={'/FlowForge.png'} alt="FlowForgeLogo"
            width={200} height={80} className="h-10 w-auto object-contain"/>
        </Link>
        
        <div className="flex items-center gap-4">
            <Link href='/project/create'>
                <Button variant="destructive" className="flex items-center gap-2">
                    <PenBox size={18}/>
                    <span>Create Project</span>
                </Button>
            </Link>
            <SignedOut>
                <SignInButton forcedredirecturl="/onboarding"/>
                <Button variant="outline">Login</Button>
            </SignedOut>
            <SignedIn>
                <UserMenu/>
            </SignedIn>
        </div>
    </nav>
    <UserLoading/>
</header>
    )
}

export default Header
