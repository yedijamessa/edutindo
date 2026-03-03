"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { ModeToggle } from "../mode-toggle"
import { AuthNavActions } from "../auth/auth-nav-actions"
import { AdminNavMenu } from "../admin/admin-nav-menu"

const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
]

const portalItems = [
    { name: "Student Portal", href: "/student" },
    { name: "Teacher Portal", href: "/teacher" },
    { name: "Parent Portal", href: "/parent" },
    { name: "Principal Portal", href: "/principal" },
]

const portalRoutePrefixes = ["/student", "/teacher", "/parent", "/principal", "/admin"] as const
const headerSurfaceClassName =
    "border-b border-[#d8cdb7] bg-[#fdf5e3]/95 shadow-[0_10px_28px_-24px_rgba(78,58,38,0.85)] backdrop-blur supports-[backdrop-filter]:bg-[#fdf5e3]/88"
const subtleHeaderButtonClassName =
    "border-[#d8cdb7] bg-white/60 text-slate-700 shadow-none hover:border-[#cabb9f] hover:bg-white/85 hover:text-slate-900"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isAdminUser, setIsAdminUser] = React.useState(false)
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)
    const [authResolved, setAuthResolved] = React.useState(false)
    const pathname = usePathname()
    const isFocusedScienceRoute = /^\/(student|teacher|principal|admin)\/materials\/year-7\/science\/[^/]+(\/[^/]+)?$/.test(pathname)
    const isPortalRoute = portalRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
    const isAdminRoute = pathname.startsWith("/admin")
    const showAdminBackButton = isAdminRoute && pathname !== "/admin" && isAdminUser

    React.useEffect(() => {
        let isMounted = true

        const loadAuthState = async () => {
            try {
                const res = await fetch("/api/auth/me", { cache: "no-store" })
                const data = await res.json()
                if (!isMounted) return
                setIsAuthenticated(Boolean(data?.authenticated))
                setIsAdminUser(
                    Boolean(
                        data?.authenticated &&
                        (data?.user?.isAdmin || data?.user?.portals?.includes("admin"))
                    )
                )
            } catch (error) {
                console.error("navbar auth state load error:", error)
                if (isMounted) {
                    setIsAuthenticated(false)
                    setIsAdminUser(false)
                }
            } finally {
                if (isMounted) setAuthResolved(true)
            }
        }

        loadAuthState()

        return () => {
            isMounted = false
        }
    }, [pathname])

    const getPortalHref = React.useCallback(
        (portalPath: string) => {
            if (authResolved && !isAuthenticated) {
                return `/demo-access?next=${encodeURIComponent(portalPath)}`
            }
            return portalPath
        },
        [authResolved, isAuthenticated]
    )

    if (isFocusedScienceRoute) {
        return null
    }

    return (
        <header className={cn("sticky top-0 z-50 w-full", headerSurfaceClassName)}>
            <div className="container-custom flex h-[4.5rem] items-center justify-between">
                <div className="flex items-center gap-2">
                    {isAdminRoute && <AdminNavMenu />}
                    <Link href="/" className="group flex items-center">
                        <Image
                            src="/logo-edutindo.png"
                            alt="Edutindo"
                            width={180}
                            height={44}
                            priority
                            className="h-8 w-auto md:h-9 transition-all group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.35)]"
                        />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-6 md:flex">
                    {!isPortalRoute && navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-slate-900",
                                pathname === item.href
                                    ? "text-slate-900"
                                    : "text-slate-600"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {showAdminBackButton && (
                        <Button asChild size="sm" variant="outline" className={subtleHeaderButtonClassName}>
                            <Link href="/admin" className="gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                                Admin Dashboard
                            </Link>
                        </Button>
                    )}

                    {!isPortalRoute && (
                        <Button
                            asChild
                            size="sm"
                            variant="default"
                            className="shadow-[0_12px_24px_-14px_rgba(37,99,235,0.7)]"
                        >
                            <Link href="/donate">Support Us</Link>
                        </Button>
                    )}
                    <AuthNavActions />
                    <ModeToggle />
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 md:hidden">
                    {showAdminBackButton && (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className={cn("h-9 px-3", subtleHeaderButtonClassName)}
                        >
                            <Link href="/admin" aria-label="Back to admin dashboard">
                                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>
                        </Button>
                    )}
                    <button
                        className="rounded-full border border-[#d8cdb7] bg-white/60 p-2 text-slate-700 transition-colors hover:bg-white/85 hover:text-slate-900"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="border-t border-[#e1d5be] bg-[#fdf5e3]/98 p-4 md:hidden">
                    <nav className="flex flex-col space-y-4">
                        {showAdminBackButton && (
                            <Button asChild variant="outline" className={cn("w-full", subtleHeaderButtonClassName)}>
                                <Link href="/admin" onClick={() => setIsOpen(false)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Admin Dashboard
                                </Link>
                            </Button>
                        )}

                        {!isPortalRoute && navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-slate-900",
                                    pathname === item.href
                                        ? "text-slate-900"
                                        : "text-slate-600"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="border-t pt-4">
                            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-slate-500">PORTALS</p>
                            {portalItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={getPortalHref(item.href)}
                                    className={cn(
                                        "block py-2 text-sm font-medium transition-colors hover:text-slate-900",
                                        pathname.startsWith(item.href)
                                            ? "text-slate-900"
                                            : "text-slate-600"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {!isPortalRoute && (
                            <Button
                                asChild
                                className="w-full shadow-[0_12px_24px_-14px_rgba(37,99,235,0.7)]"
                                variant="default"
                            >
                                <Link href="/donate" onClick={() => setIsOpen(false)}>Support Us</Link>
                            </Button>
                        )}
                        <AuthNavActions mobile onNavigate={() => setIsOpen(false)} />
                        <div className="flex justify-center pt-2">
                            <ModeToggle />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
