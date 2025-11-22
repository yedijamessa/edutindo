import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Section>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: January 22, 2025</p>
                    </div>

                    <Card>
                        <CardContent className="p-8 space-y-6">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Yayasan Edutindo ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning management platform and services.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Information We Collect</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We collect information that you provide directly to us, including:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                                            <li>Name and contact information (email address, phone number)</li>
                                            <li>Account credentials (username and password)</li>
                                            <li>Student information (grade level, subjects of interest)</li>
                                            <li>Parent/guardian information for minor students</li>
                                            <li>Payment information (processed securely through third-party providers)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Learning Data</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We collect data related to your use of our educational platform:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                                            <li>Course progress and completion status</li>
                                            <li>Quiz and assessment results</li>
                                            <li>Notes and study materials you create</li>
                                            <li>Time spent on materials and activities</li>
                                            <li>Interaction with teachers and other students</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Technical Information</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We automatically collect certain information when you use our platform:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                                            <li>Device information (type, operating system, browser)</li>
                                            <li>IP address and location data</li>
                                            <li>Usage data and analytics</li>
                                            <li>Cookies and similar tracking technologies</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">How We Use Your Information</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use the information we collect to:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                                    <li>Provide, maintain, and improve our educational services</li>
                                    <li>Personalize your learning experience</li>
                                    <li>Track student progress and generate reports for parents/guardians</li>
                                    <li>Communicate with you about courses, updates, and support</li>
                                    <li>Process payments and prevent fraud</li>
                                    <li>Comply with legal obligations</li>
                                    <li>Analyze usage patterns to improve our platform</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Information Sharing</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We do not sell your personal information. We may share your information with:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                                    <li><strong>Teachers and Instructors:</strong> To facilitate learning and provide feedback</li>
                                    <li><strong>Parents/Guardians:</strong> Progress reports and learning analytics for minor students</li>
                                    <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Data Security</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Your Rights</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    You have the right to:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                                    <li>Access and review your personal information</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your account and data</li>
                                    <li>Opt-out of marketing communications</li>
                                    <li>Export your learning data</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Children's Privacy</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We are committed to protecting the privacy of children. For students under 18, we require parental consent before collecting personal information. Parents have the right to review, modify, or delete their child's information at any time.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold">Contact Us</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If you have questions about this Privacy Policy or our data practices, please contact us at:
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
