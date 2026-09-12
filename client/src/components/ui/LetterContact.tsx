"use client";

import { useContactSettings } from "@/providers/ContentProvider";
import { contentService } from "@/services/content.service";
import { safeEmitSecretEvent } from "@/services/secretEventBus";
import { useSecretStore } from "@/store/useSecretStore";
import { useEffect, useRef, useState, type FormEvent } from "react";

export default function LetterContact() {
  const contact = useContactSettings();
  const [status, setStatus] = useState<
    "writing" | "submitting" | "folding" | "ready"
  >("writing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const post = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.currentTarget;
    for (const name of ["name", "email", "message"]) {
      const field = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (field) {
        field.setCustomValidity(
          field.value.trim() ? "" : "Please write something here.",
        );
      }
    }

    if (!form.reportValidity()) return;

    setStatus("submitting");

    try {
      await contentService.submitLetter({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      // API confirmed persistence -> update secret session state & emit event
      useSecretStore.getState().setLetterSentSession(true);
      safeEmitSecretEvent({
        type: "LETTER_SENT",
        targetType: "MAILBOX",
        targetId: "contact-mailbox",
      });

      // Trigger the folding animation
      setStatus("folding");
      timeout.current = setTimeout(() => {
        setStatus("ready");
      }, 700);
    } catch (err: any) {
      setStatus("writing");
      setErrorMsg(
        err?.message ||
          "We couldn't post your letter. Please check your connection and try again.",
      );
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "" });
    setErrorMsg(null);
    setStatus("writing");
  };

  return (
    <div className="letter-scene">
      <div className="letter-intro">
        <p className="section-kicker">THE LITTLE POST OFFICE</p>
        <h2>
          {contact?.heading ? (
            contact.heading.includes("little") ? (
              <>
                {contact.heading.split("little")[0]}
                <br />
                <i>little {contact.heading.split("little")[1] || "note."}</i>
              </>
            ) : (
              contact.heading
            )
          ) : (
            <>
              Leave a
              <br />
              <i>little note.</i>
            </>
          )}
        </h2>
        <p>{contact?.intro}</p>
        <span className="letter-handwriting" style={{ whiteSpace: "pre-line" }}>
          {contact?.handwrittenNote || "some things are better\nwritten down."}
        </span>
      </div>

      <div
        className={`letter-paper letter-${status === "submitting" ? "writing" : status}`}
      >
        <div className="postal-heading">
          <span>
            TO: SHAIVI
            <br />
            THE LITTLE WORLD
          </span>
          <span className="postage-stamp">
            ✳
            <small>
              A LITTLE
              <br />
              HELLO
            </small>
          </span>
        </div>

        {status === "ready" ? (
          <div className="letter-success" role="status">
            <span>✉</span>
            <h3>Beautifully put.</h3>
            <p>
              {contact?.successMessage ||
                "Your letter has been placed in the mailbox."}
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Delivered safely to Shaivi&apos;s desk.
            </p>
            <button className="post-letter" onClick={handleReset}>
              Write another little letter ↗
            </button>
          </div>
        ) : (
          <form
            onSubmit={post}
            onInput={(e) => {
              const field = e.target as HTMLInputElement;
              field.setCustomValidity("");
            }}
          >
            {errorMsg && (
              <div
                style={{
                  background: "rgba(180, 80, 80, 0.1)",
                  border: "1px solid rgba(180, 80, 80, 0.3)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  marginBottom: "12px",
                  fontSize: "0.85rem",
                  color: "#9c3b3b",
                }}
                role="alert"
              >
                {errorMsg}
              </div>
            )}

            <div className="letter-fields">
              <label>
                {contact?.fieldLabels?.name || "Your name"}
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="The name on the envelope"
                  disabled={status === "submitting" || status === "folding"}
                />
              </label>

              <label>
                {contact?.fieldLabels?.email || "Your email"}
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="Somewhere to write back"
                  disabled={status === "submitting" || status === "folding"}
                />
              </label>

              <label>
                {contact?.fieldLabels?.message || "Your little note"}
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={5}
                  placeholder="Dear Shaivi, …"
                  disabled={status === "submitting" || status === "folding"}
                />
              </label>
            </div>

            <div className="letter-signoff">
              <span>{contact?.signoff || "With a little curiosity,"}</span>
              <button
                className="post-letter"
                type="submit"
                disabled={status === "submitting" || status === "folding"}
              >
                {status === "submitting"
                  ? "Posting your letter…"
                  : status === "folding"
                    ? "Folding your letter…"
                    : `${contact?.buttonText || "Post Letter"} ↗`}
              </button>
            </div>

            {contact?.disclaimer && (
              <p className="demo-note">{contact.disclaimer}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
