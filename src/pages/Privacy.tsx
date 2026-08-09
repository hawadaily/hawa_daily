import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-4xl font-bold text-[#0077b6] mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Hawa Daily collects information to provide better services to our users. The types of information we collect include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device type</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and navigation patterns</li>
                <li><strong>Location Data:</strong> Approximate geographic location based on IP address</li>
                <li><strong>Session Information:</strong> Visit timestamps and session identifiers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>To provide and maintain our service</li>
                <li>To monitor and analyze usage patterns</li>
                <li>To improve our content and user experience</li>
                <li>To detect and prevent technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">3. Data Storage and Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information. Your data is stored securely on Firebase servers and is accessible only to authorized personnel. We regularly review our security practices to ensure data protection.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">4. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Hawa Daily may use third-party services to enhance our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li><strong>Firebase:</strong> For data storage and analytics</li>
                <li><strong>Weather APIs:</strong> To provide weather information</li>
                <li><strong>Social Media Platforms:</strong> For content sharing and authentication</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These third parties have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">6. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Hawa Daily does not knowingly collect personally identifiable information from children under the age of 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. We may retain certain data for longer periods for legal, regulatory, or business reasons.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">8. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to object to processing of your information</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of the Maldives. By using our service, you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Email: info@hawadaily.com<br />
                Website: https://www.hawadaily.com
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Last updated: August 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
