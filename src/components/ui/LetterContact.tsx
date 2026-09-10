"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contact } from "@/data/contact";
export default function LetterContact() {
  const [status, setStatus] = useState<"writing" | "folding" | "ready">(
    "writing",
  );
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  const post = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for(const name of ['name','email','message']){const field=e.currentTarget.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement;field.setCustomValidity(field.value.trim()?'':'Please write something here.');}
    if (!e.currentTarget.reportValidity()) return;
    setStatus("folding");
    timeout.current = setTimeout(() => setStatus("ready"), 700);
  };
  return (
    <div className="letter-scene">
      <div className="letter-intro">
        <p className="section-kicker">THE LITTLE POST OFFICE</p>
        <h2>
          {contact.heading.split("little")[0]}
          <br />
          <i>little note.</i>
        </h2>
        <p>{contact.intro}</p>
        <span className="letter-handwriting">
          some things are better
          <br />
          written down.
        </span>
      </div>
      <div className={`letter-paper letter-${status}`}>
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
            <p>{contact.success}</p>
            <p>
            Nothing was sent or saved. This is a preview of the letter-posting interaction.
            </p>
            <button
              className="post-letter"
              onClick={() => setStatus("writing")}
            >
              Write another little letter ↗
            </button>
          </div>
        ) : (
          <form onSubmit={post} onInput={e=>{const field=e.target as HTMLInputElement;field.setCustomValidity('');}}>
            <div className="letter-fields">
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="The name on the envelope"
                />
              </label>
              <label>
                Your email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="Somewhere to write back"
                />
              </label>
              <label>
                Your little note
                <textarea
                  name="message"
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={5}
                  placeholder="Dear Shaivi, …"
                />
              </label>
            </div>
            <div className="letter-signoff">
              <span>With a little curiosity,</span>
              <button
                className="post-letter"
                type="submit"
                disabled={status === "folding"}
              >
                {status === "folding"
                  ? "Folding your letter…"
                  : contact.button + " ↗"}
              </button>
            </div>
            <p className="demo-note">{contact.disclaimer}</p>
          </form>
        )}
      </div>
    </div>
  );
}
