import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-[#0b1d3a] text-white">
            <div className="container-custom py-12 md:py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-xl font-bold text-white">
                            Edutindo
                        </Link>
                        <p className="mt-3 text-sm text-slate-400 max-w-xs leading-6">
                            Breaking Barriers, Building The Future.
                        </p>
                        <div className="mt-4 space-y-1 text-sm text-slate-400 max-w-xs">
                            <p>Registration Number: 5025111131101093</p>
                            <p>AHU Number: AHU-0027575.AH.01.01</p>
                            <p>Foundation Number: AHU-0042444.AH.01.12</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-white text-sm">Links</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/get-involved" className="hover:text-white transition-colors">Get Involved</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-white text-sm">Legal</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Yayasan Edutindo. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
