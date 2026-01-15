import { useState } from "react";
import emailjs from "emailjs-com";
import styles from "../styles/Help.module.css";

const FAQS = [
  {
    question: "Is FreeFinders free to use?",
    answer: "Yes! FreeFinders is completely free.",
  },
  {
    question: "How do I create a listing?",
    answer: `You can create a listing by logging in and then clicking on the "Create Listing" button at the top of your screen.`,
  },
  {
    question: "How do I contact a seller?",
    answer:
      "You can find contact information by viewing the seller's info on the listing page.",
  },
  {
    question: "Why can't I see a seller's contact information?",
    answer: "You must create an account and log in to see contact information.",
  },
];

export default function Help() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formState;

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      setStatus("Sending...");
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
        { name, email, message },
        import.meta.env.VITE_EMAILJS_USER_ID || "",
      );

      if (response.status === 200) {
        setStatus("Message sent successfully!");
        setFormState({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setStatus("Failed to send message. Please try again later.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.faqs}>
        <h1>Help</h1>
        {FAQS.map(({ question, answer }, index) => (
          <div key={index} className={styles.faqItem}>
            <p className={styles.question}>{question}</p>
            <p>{answer}</p>
          </div>
        ))}
      </div>

      <div className={styles.contact}>
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={formState.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={formState.email}
            onChange={handleInputChange}
            required
          />
          <textarea
            id="message"
            placeholder="Your Message"
            value={formState.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <button type="submit" className={styles.submit}>
            Submit
          </button>
        </form>
        {status && <p className={styles.statusMessage}>{status}</p>}
      </div>
    </main>
  );
}
