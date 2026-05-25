import MapExperience from "@/components/MapExperience";
import { Reveal, Stagger, StaggerItem } from "@/components/MotionReveal";

const nearby = [
  { name: "Sea Link Residences", area: "Bandra West", time: "6 min to promenade" },
  { name: "Carter Road House", area: "Bandra West", time: "9 min to dining district" },
  { name: "Palm Court Villa", area: "Juhu", time: "14 min to airport" },
];

export default function MapPage() {
  return (
    <main className="interior-shell">
      <Reveal className="map-page-head">
        <div>
          <p className="eyebrow">Nearby discoveries</p>
          <h1>See each residence in its world.</h1>
        </div>
        <p>
          Explore neighborhoods in satellite view and understand proximity
          before arranging a private viewing.
        </p>
      </Reveal>
      <Reveal delay={0.12}>
        <MapExperience location="Bandra West, Mumbai" />
      </Reveal>
      <Stagger className="nearby-grid">
        {nearby.map((property) => (
          <StaggerItem className="nearby-card" key={property.name}>
            <small>{property.area}</small>
            <h2>{property.name}</h2>
            <p>{property.time}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </main>
  );
}
