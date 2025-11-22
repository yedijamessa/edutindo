import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Section>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
                        <p className="text-muted-foreground">Last updated: January 22, 2025</p>
                    </div>

                    <Card>
                        <CardContent className="p-8 space-y-6">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Agreement to Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    By accessing or using the Edutindo learning platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Use of Service</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Eligibility</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You must be at least 13 years old to use this Service. Users under 18 require parental or guardian consent. By using the Service, you represent that you meet these requirements.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Account Registration</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You must provide accurate and complete information when creating an account. You are responsible for:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                                            <li>Maintaining the security of your account credentials</li>
                                            <li>All activities that occur under your account</li>
                                            <li>Notifying us immediately of any unauthorized access</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Acceptable Use</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You agree not to:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                                            <li>Use the Service for any illegal or unauthorized purpose</li>
                                            <li>Violate any laws in your jurisdiction</li>
                                            <li>Infringe upon the rights of others</li>
                                            <li>Transmit viruses, malware, or harmful code</li>
                                            <li>Attempt to gain unauthorized access to the Service</li>
                                            <li>Harass, abuse, or harm other users</li>
                                            <li>Share your account with others</li>
                                            <li>Use automated systems to access the Service</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Educational Content</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Content Ownership</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            All educational materials, courses, quizzes, and content provided through the Service are owned by Edutindo or our content partners and are protected by intellectual property laws.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">License to Use</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We grant you a limited, non-exclusive, non-transferable license to access and use the educational content for personal, non-commercial learning purposes only.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">User-Generated Content</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You retain ownership of content you create (notes, assignments, etc.). By submitting content, you grant us a license to use, display, and distribute it as necessary to provide the Service.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Payment and Subscriptions</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Fees</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Some features of the Service may require payment. All fees are stated in Indonesian Rupiah (IDR) and are non-refundable unless otherwise stated.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Billing</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            By providing payment information, you authorize us to charge the applicable fees. Subscription fees are billed in advance on a recurring basis.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Cancellation</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Disclaimers</h2>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                        THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE ARE NOT RESPONSIBLE FOR ANY EDUCATIONAL OUTCOMES OR RESULTS.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    To the maximum extent permitted by law, Edutindo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Termination</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason. Upon termination, your right to use the Service will immediately cease.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Changes to Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Governing Law</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms shall be governed by and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Contact Information</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    For questions about these Terms, please contact us:
                                </p>
                                <div className="bg-muted p-4 rounded-lg mt-2">
                                    <p className="font-medium">Yayasan Edutindo</p>
                                    <p className="text-muted-foreground">Email: hello@edutindo.org</p>
                                    <p className="text-muted-foreground">Address: [Your Address]</p>
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
