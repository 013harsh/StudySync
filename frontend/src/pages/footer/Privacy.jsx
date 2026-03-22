const Privacy = () => {
  return (
    <main className="min-h-screen bg-base-100 text-base-content py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-primary mb-3">
            Privacy Policy
          </h1>
          <p className="text-base-content/50 text-sm tracking-wider uppercase">
            Effective Date: March 2025
          </p>
          <div className="divider" />
        </div>

        <div className="space-y-8 text-base-content/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect basic information you provide when creating an account,
              such as your name, email address, and profile details. We also
              collect data about how you use StudySync to improve the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              Your information is used solely to operate and improve StudySync.
              This includes managing your account, enabling group collaboration,
              and sending you relevant notifications about your study groups.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              3. Data Sharing
            </h2>
            <p>
              We do not sell, trade, or share your personal information with
              third parties. Your data stays within the StudySync platform and
              is accessible only to you and the members of groups you join.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              4. Data Security
            </h2>
            <p>
              We take reasonable measures to protect your data from unauthorised
              access or disclosure. However, no system is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              5. Cookies
            </h2>
            <p>
              StudySync may use cookies or local storage to maintain your
              session and preferences. These are not used for tracking or
              advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information at any time through your account settings. To request
              account deletion, contact us via our{" "}
              <a href="/contact" className="link link-primary">
                Contact
              </a>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated effective date.
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

export default Privacy;
