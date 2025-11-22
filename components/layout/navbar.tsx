"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { ModeToggle } from "../mode-toggle"

const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Get Involved", href: "/get-involved" },
    { name: "Contact", href: "/contact" },
]

const portalItems = [
    { name: "Student Portal", href: "/student" },
    { name: "Teacher Portal", href: "/teacher" },
    { name: "Parent Portal", href: "/parent" },
    { name: "Principal Portal", href: "/principal" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isPortalDropdownOpen, setIsPortalDropdownOpen] = React.useState(false)
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-custom flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 group">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 transition-all group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]">
                        Edutindo
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Portal Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                                portalItems.some(item => pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href))
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            Portals
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isPortalDropdownOpen && "rotate-180")} />
                        </button>

                        {isPortalDropdownOpen && (
                            <div className="absolute top-full mt-2 right-0 w-48 bg-background border rounded-lg shadow-lg py-2 z-50">
                                {portalItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsPortalDropdownOpen(false)}
                                        className={cn(
                                            "block px-4 py-2 text-sm transition-colors hover:bg-accent",
                                            pathname.startsWith(item.href)
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button asChild size="sm" variant="default">
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <ModeToggle />
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <nav className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="border-t pt-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">PORTALS</p>
                            {portalItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block py-2 text-sm font-medium transition-colors hover:text-primary",
                                        pathname.startsWith(item.href)
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <Button asChild className="w-full" variant="default">
                            <Link href="/donate" onClick={() => setIsOpen(false)}>Donate Now</Link>
                        </Button>
                        <div className="flex justify-center pt-2">
                            <ModeToggle />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
