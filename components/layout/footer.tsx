import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container-custom py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                            Edutindo
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                            Education with Light. Building futures, breaking barriers for Indonesia's next generation.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                            <li><Link href="/get-involved" className="hover:text-primary">Get Involved</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Yayasan Edutindo. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
