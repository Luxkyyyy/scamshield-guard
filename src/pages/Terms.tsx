import { LegalLayout } from "./LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="July 14, 2026">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of terms</h2>
        <p className="mt-3">
          By using ScamShield AI (the "Service") you agree to these Terms of Service. If you do not
          agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. What the Service does</h2>
        <p className="mt-3">
          ScamShield analyzes user-submitted messages, URLs, phone numbers, and screenshots and
          returns an AI-generated risk assessment. The output is decision support only — it is not
          professional, legal, financial, or security advice, and it does not guarantee that a given
          message is or is not a scam.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. Acceptable use</h2>
        <p className="mt-3">You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Submit content you have no right to share.</li>
          <li>Submit passwords, one-time codes, banking credentials, or government IDs.</li>
          <li>Use the Service to develop, train, or benchmark competing products.</li>
          <li>Attempt to overload, disrupt, scrape, or reverse-engineer the Service.</li>
          <li>Use the Service for anything illegal or to harass others.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Your content</h2>
        <p className="mt-3">
          You retain ownership of the content you submit. By submitting content you grant
          ScamShield a limited licence to process it for the purpose of returning an analysis to
          you, as described in the Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. No warranty</h2>
        <p className="mt-3">
          The Service is provided "as is" and "as available", without warranties of any kind,
          express or implied. We do not warrant that the analysis will be accurate, complete, or
          fit for a particular purpose. Always verify suspicious contact through the official
          channels of the organisation involved.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Limitation of liability</h2>
        <p className="mt-3">
          To the maximum extent permitted by law, ScamShield and its operators are not liable for
          any indirect, incidental, consequential, or punitive damages, or for any loss of data,
          profits, or business, arising from your use of, or inability to use, the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Third-party services</h2>
        <p className="mt-3">
          The Service relies on third-party AI providers (including Google Gemini). Your use of the
          Service is also subject to those providers' terms. We are not responsible for third-party
          outages or changes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">8. Changes to the Service</h2>
        <p className="mt-3">
          We may modify, suspend, or discontinue the Service at any time without notice. We may
          also update these Terms; continued use of the Service after changes take effect
          constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">9. Termination</h2>
        <p className="mt-3">
          We may restrict or terminate access to the Service if we believe you have violated these
          Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">10. Governing law</h2>
        <p className="mt-3">
          These Terms are governed by the laws of the jurisdiction in which the ScamShield operator
          is established, without regard to conflict-of-laws principles.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
        <p className="mt-3">
          Questions? Reach out via the support channel listed on the ScamShield app.
        </p>
      </section>
    </LegalLayout>
  );
}
