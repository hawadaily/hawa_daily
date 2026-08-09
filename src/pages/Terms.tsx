import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-4xl font-bold text-[#0077b6] mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Hawa Daily, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Hawa Daily is a news and information platform that provides weather updates, job listings, and other relevant content for the Maldives region. We strive to provide accurate and up-to-date information, but we make no warranties about the completeness, reliability, or accuracy of this information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users of Hawa Daily agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>Use the service for lawful purposes only</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not interfere with or disrupt the service or servers</li>
                <li>Not post or transmit any harmful, threatening, or inappropriate content</li>
                <li>Respect the intellectual property rights of others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">4. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of Hawa Daily is also governed by our Privacy Policy, which can be found at <a href="/privacy" className="text-[#0077b6] hover:underline">https://www.hawadaily.com/privacy</a>. Please review our Privacy Policy, which also governs the service and informs users of our data collection practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content, features, and functionality of Hawa Daily, including but not limited to text, graphics, logos, and software, are the exclusive property of Hawa Daily and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Hawa Daily be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">7. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your access to Hawa Daily at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">8. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Maldives, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page. Your continued use of the service after such modifications constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00b4d8] mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
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
