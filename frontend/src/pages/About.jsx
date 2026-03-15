const About = () => {
  return (
    <main className="min-h-screen bg-base-100 text-base-content py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-primary mb-3">
            About StudySync
          </h1>
          <div className="divider" />
        </div>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-3">
            Our Mission
          </h2>
          <p className="text-base-content/80 leading-relaxed">
            StudySync is a collaborative learning platform designed to help
            students connect, create study groups, and achieve more together. We
            believe that learning is better when shared — our platform makes it
            easy to organize sessions, share resources, and stay in sync with
            your peers.
          </p>
        </section>

        {/* What We Offer */}
        <section className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-3">
            What We Offer
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base-content/80 leading-relaxed">
            <li>Create and join study groups with ease</li>
            <li>Real-time collaboration and messaging</li>
            <li>Resource sharing within groups</li>
            <li>Personalised dashboard to track your groups</li>
            <li>Secure and private study rooms</li>
          </ul>
        </section>

        {/* Developer */}
        <section className="card bg-base-200 shadow-md p-6 rounded-2xl">
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-3">
            Developer
          </h2>
          <p className="text-base-content/80 leading-relaxed">
            <span className="font-semibold text-base-content">
              Harsh Aggarwal
            </span>
            <br />
            B.Tech 3rd Year · GTB4CEC College
          </p>
          <p className="mt-3 text-base-content/60 text-sm">
            Built with passion to empower students through technology.
          </p>
        </section>
      </div>
    </main>
  );
};

export default About;
