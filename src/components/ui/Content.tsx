"use client";
import { useState } from "react";
import { portfolio, type Section } from "@/data/portfolio";
export function ProjectsContent() {
  const [index, setIndex] = useState(0);
  const project = portfolio.projects[index];
  return (
    <div className="projects-content">
      <div className="project-meta">
        <span>SELECTED WORK</span>
        <span>0{index + 1} / 03</span>
      </div>
      <div className="project-art" style={{ background: project.color }}>
        <span>
          Small ideas.
          <br />
          <i>New possibilities.</i>
        </span>
        <span className="sample-stamp">SAMPLE PROJECT</span>
      </div>
      <p className="eyebrow">{project.category}</p>
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <div className="project-bottom">
        <span>
          {project.role} · {project.tools.join(" / ")}
        </span>
        <div>
          <button
            aria-label="Previous project"
            onClick={() => setIndex((index + 2) % 3)}
          >
            ←
          </button>
          <button
            aria-label="Next project"
            onClick={() => setIndex((index + 1) % 3)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
export function SectionContent({ section }: { section: Section }) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [touch, setTouch] = useState<number | null>(null);
  if (section === "PROJECTS") return <ProjectsContent />;
  if (section === "ABOUT")
    return (
      <>
        <p className="eyebrow">COME ON IN</p>
        <h2>
          A little about
          <br />
          <i>Shaivi.</i>
        </h2>
        <p className="intro-copy">{portfolio.person.about}</p>
        <div className="paper-note">
          <span>✳ A note to make your own</span>
          <p>{portfolio.person.note}</p>
        </div>
        <p className="quiet">A work in progress, in the nicest way.</p>
      </>
    );
  if (section === "GALLERY") {
    const art = portfolio.artworks[index];
    return (
      <div
        onTouchStart={(e) => setTouch(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (
            touch !== null &&
            Math.abs(e.changedTouches[0].clientX - touch) > 40
          )
            setIndex(
              (index + (e.changedTouches[0].clientX < touch ? 1 : 2)) % 3,
            );
          setTouch(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((index + 1) % 3);
          if (e.key === "ArrowLeft") setIndex((index + 2) % 3);
        }}
        tabIndex={0}
        aria-label="Artwork gallery. Use left and right arrows."
      >
        <p className="eyebrow">THE ART CORNER</p>
        <h2>
          Made of <i>little moments.</i>
        </h2>
        <div className="gallery-art" style={{ background: art.color }}>
          <span>
            Artwork
            <br />
            <i>goes here.</i>
          </span>
          <small>YOUR CANVAS, YOUR STORY</small>
        </div>
        <div className="gallery-caption">
          <div>
            <h3>{art.title}</h3>
            <p>
              {art.year} · {index + 1} of 3
            </p>
          </div>
          <div className="arrows">
            <button
              onClick={() => setIndex((index + 2) % 3)}
              aria-label="Previous artwork"
            >
              ←
            </button>
            <button
              onClick={() => setIndex((index + 1) % 3)}
              aria-label="Next artwork"
            >
              →
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (section === "JOURNEY")
    return (
      <>
        <p className="eyebrow">EVERY DOT HAS A STORY</p>
        <h2>
          A constellation
          <br />
          of <i>small beginnings.</i>
        </h2>
        <div className="constellation">
          {portfolio.timeline.map((m, i) => (
            <button
              key={m.title}
              className={i === index ? "selected" : ""}
              style={{ top: `${[55, 20, 48, 8, 32][i]}%` }}
              onClick={() => setIndex(i)}
              aria-label={m.title}
            >
              <span>✧</span>
              <small>{m.title}</small>
            </button>
          ))}
        </div>
        <p className="eyebrow">0{index + 1} / 05</p>
        <h3>{portfolio.timeline[index].title}</h3>
        <p>{portfolio.timeline[index].text}</p>
      </>
    );
  if (section === "CONTACT")
    return (
      <>
        <p className="eyebrow">FROM MY LITTLE WORLD TO YOURS</p>
        <h2>
          Good things start
          <br />
          with <i>a hello.</i>
        </h2>
        <p>Have a little idea or a big daydream? This is where we can begin.</p>
        <div className="letter">
          <span>To: Shaivi</span>
          {portfolio.contact.email ? (
            <>
              <a href={`mailto:${portfolio.contact.email}`}>
                {portfolio.contact.email}
              </a>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      portfolio.contact.email,
                    );
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? "Copied" : "Copy email"}
              </button>
            </>
          ) : (
            <>
              <h3>Your email goes here</h3>
              <p>Add your email address to enable the message link.</p>
            </>
          )}
          <div>
            {portfolio.contact.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
        <span className="signature">With a little curiosity, Shaivi</span>
      </>
    );
  return (
    <>
      <p className="eyebrow">OFF THE CLOCK</p>
      <h2>
        Things that
        <br />
        make life <i>lovely.</i>
      </h2>
      <p>
        A little collection of inspirations. Replace these prompts with your own
        favourites.
      </p>
      <ul className="interests">
        {portfolio.interests.map((item, i) => (
          <li key={item}>
            <span>0{i + 1}</span>
            {item}
            <span>{["♫", "▤", "◉", "✳"][i]}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
