import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: August 16th, 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              At Builddrr, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, and protect your information when
              you use our AI-powered website building platform.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Information We Collect
              </h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="font-medium">Account Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address and name when you create an account</li>
                  <li>Profile information you choose to provide</li>
                  <li>Billing information for paid plans</li>
                </ul>

                <h3 className="font-medium">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Websites and content you create using our platform</li>
                  <li>Chat interactions with our AI system</li>
                  <li>Analytics data about how you use our service</li>
                </ul>

                <h3 className="font-medium">Technical Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Essential cookies required for service functionality</li>
                  <li>Session data to maintain your login status</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and improve our AI website building service</li>
                <li>Process payments and manage your account</li>
                <li>Send important service updates and notifications</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Provide customer support when requested</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Information Sharing
              </h2>
              <p className="text-gray-700 mb-3">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in these
                limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  With service providers who help us operate our platform
                  (hosting, payment processing, analytics)
                </li>
                <li>
                  When required by law or to protect our rights and safety
                </li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Data Security
              </h2>
              <p className="text-gray-700">
                We implement industry-standard security measures to protect your
                information, including encryption, secure data storage, and
                regular security audits. However, no method of transmission over
                the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Your Rights
              </h2>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of non-essential communications</li>
                <li>
                  Request information about data we collect and how it's used
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Cookies and Data Collection
              </h2>
              <p className="text-gray-700">
                We only use essential cookies that are necessary for our service
                to function properly, such as maintaining your login session and
                storing your preferences. We do not use tracking cookies,
                analytics cookies, or collect personal identifiers like IP
                addresses or device information. You can disable cookies in your
                browser, but this may affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any significant changes by email or through our
                platform. Your continued use of our service after changes
                indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy or how we handle
                your data, please contact us:
              </p>
              <ul className="list-none space-y-1 text-gray-700 mt-2">
                <li>Email: savonen.emppu@gmail.com</li>
                <li>
                  <a
                    href="https://discord.gg/Fg8qtgMN"
                    className="text-blue-500 hover:text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support (Discord)
                  </a>
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
