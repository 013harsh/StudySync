const Terms = () => {
  return (
    <main className="min-h-screen bg-base-100 text-base-content py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-primary mb-3">
            Terms of Service
          </h1>
          <p className="text-base-content/50 text-sm tracking-wider uppercase">
            Effective Date: March 2025
          </p>
          <div className="divider" />
        </div>

        <div className="space-y-8 text-base-content/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using StudySync, you agree to be bound by these
              Terms of Service. If you do not agree with any part of these
              terms, you may not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              2. Use of the Platform
            </h2>
            <p>
              StudySync is intended solely for educational and collaborative
              purposes. You agree not to misuse the platform, post harmful
              content, or engage in any activity that disrupts other users'
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. Any activity that occurs under your account
              is your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              4. Intellectual Property
            </h2>
            <p>
              All content, design, and code on StudySync are the intellectual
              property of Harsh Aggarwal. You may not copy, reproduce, or
              distribute any part of the platform without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              5. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the platform after changes constitutes your acceptance of
              the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              6. Contact
            </h2>
            <p>
              For any questions regarding these terms, please reach out via our{" "}
              <a href="/contact" className="link link-primary">
                Contact
              </a>{" "}
              page.
            </p>
          </section>
        </div>

        <div className="divider mt-12" />
        <p className="text-center text-base-content/40 text-xs tracking-wider uppercase">
          StudySync · Harsh Aggarwal · GTB4CEC College
        </p>
      </div>
    </main>
  );
};

export default Terms;
