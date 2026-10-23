import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const sheetUri = import.meta.env.VITE_GOOGLESHEETURI;

    try {
      if (sheetUri) {
        await fetch(sheetUri, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            message: form.message.trim(),
          }),
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError("Failed to send your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-100 text-base-content py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-primary mb-3">
            Contact Us
          </h1>
          <p className="text-base-content/60 text-sm">
            Have a question or feedback? We'd love to hear from you.
          </p>
          <div className="divider" />
        </div>

        {submitted ? (
          <div className="card bg-base-200 shadow-md rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Message Sent!
            </h2>
            <p className="text-base-content/70">
              Thanks for reaching out. We'll get back to you soon.
            </p>
            <button
              className="btn btn-primary mt-6 btn-sm"
              onClick={() => {
                setForm({ name: "", email: "", message: "" });
                setError(null);
                setSubmitted(false);
              }}
            >
              Send Another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="card bg-base-200 shadow-md rounded-2xl p-8 space-y-6"
          >
            {error && (
              <div className="alert alert-error rounded-xl">
                <span>❌</span>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold uppercase tracking-wider text-xs">
                  Your Name
                </span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Harsh Aggarwal"
                className="input input-bordered w-full"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold uppercase tracking-wider text-xs">
                  Email Address
                </span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Message */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold uppercase tracking-wider text-xs">
                  Message
                </span>
              </label>
              <textarea
                name="message"
                placeholder="Write your message here..."
                className="textarea textarea-bordered w-full h-36 resize-none"
                value={form.message}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Sending Message...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        )}

        {/* Developer info */}
        <div className="divider mt-12" />
        <p className="text-center text-base-content/40 text-xs tracking-wider uppercase">
          StudySync · Harsh Aggarwal · B.Tech 3rd Year · GTB4CEC College
        </p>
      </div>
    </main>
  );
};

export default Contact;
