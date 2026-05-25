import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/MotionReveal";
import { HOME_PHOTOS } from "@/lib/showcase";

const values = [
  {
    title: "Considered curation",
    text: "Our catalogue prioritizes thoughtful architecture, excellent locations, and homes ready for genuine enquiry.",
  },
  {
    title: "Transparent connection",
    text: "Verified accounts and clear listing review give owners and residents confidence before they speak.",
  },
  {
    title: "Premium presentation",
    text: "High-resolution galleries and elevated membership help special properties present at their best.",
  },
];

export default function AboutPage() {
  return (
    <main className="interior-shell">
      <section className="story-grid">
        <Reveal className="story-copy">
          <p className="eyebrow">About THEDealMaker</p>
          <h1>Finding a home should feel personal again.</h1>
          <p>
            THEDealMaker is a modern real estate destination built for refined homes
            across India. We join exceptional presentation with direct owner
            connection, intelligent discovery, and secure subscription tools.
          </p>
          <Link className="gold-button link-button" href="/#properties">View collection</Link>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="story-image" style={{ backgroundImage: `url("${HOME_PHOTOS[0].image}")` }} />
        </Reveal>
      </section>
      <Stagger className="values-grid">
        {values.map((value) => (
          <StaggerItem className="value-card" key={value.title}>
            <p className="eyebrow">Our promise</p>
            <h2>{value.title}</h2>
            <p>{value.text}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </main>
  );
}
