import { LegalLayout } from "./LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 14, 2026">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Who we are</h2>
        <p className="mt-3">
          ScamShield AI ("ScamShield", "we", "us") is a scam-detection tool that analyzes
          user-submitted messages, URLs, phone numbers, and screenshots and returns a risk
          assessment. This Privacy Policy explains what data we handle when you use the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. Data we process</h2>
        <p className="mt-3">When you use the analyzer, we process:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>The content you submit (message text, URL, phone number, or screenshot).</li>
          <li>Basic request metadata (timestamp, IP address, user-agent) for abuse prevention.</li>
          <li>The analysis result returned by the AI model.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. How we use it</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>To generate the scam risk analysis you requested.</li>
          <li>To protect the service against abuse, spam, and automated attacks.</li>
          <li>To debug and improve reliability.</li>
        </ul>
        <p className="mt-3">
          We do not sell your data, and we do not use submitted content to train advertising models.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Storage & retention</h2>
        <p className="mt-3">
          Submitted content is processed in-memory to generate the analysis and is not persisted in
          a ScamShield database. Your recent analysis history is stored locally in your browser
          (localStorage) and never leaves your device — clearing your browser storage removes it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Third-party AI processing</h2>
        <p className="mt-3">
          To generate the analysis, submitted content is sent to a large-language-model provider
          (Google Gemini via the Google AI Studio API, or a fallback AI gateway). These providers
          process the content under their own privacy terms. Do not submit passwords, one-time
          codes, government identifiers, or financial account numbers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Cookies & tracking</h2>
        <p className="mt-3">
          ScamShield does not set advertising cookies. We use only strictly necessary browser
          storage (localStorage) to remember your recent analyses on this device.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Your rights</h2>
        <p className="mt-3">
          Because we do not maintain accounts or a server-side database of your submissions, there
          is no personal profile to access, correct, or delete. You can clear locally stored history
          from the "Recent analyses" section of the app.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">8. Children</h2>
        <p className="mt-3">
          ScamShield is not directed to children under 13, and we do not knowingly collect data from
          them.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">9. Changes</h2>
        <p className="mt-3">
          We may update this policy from time to time. Material changes will be reflected by
          updating the "Last updated" date at the top of this page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
        <p className="mt-3">
          Questions about this policy? Contact the ScamShield team through the support channel
          listed on the app.
        </p>
      </section>
    </LegalLayout>
  );
}
