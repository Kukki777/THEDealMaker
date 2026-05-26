"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import ServiceAccessModal from "@/components/ServiceAccessModal";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { Reveal, Stagger, StaggerItem } from "@/components/MotionReveal";
import { API_URL } from "@/lib/api";
import { HOME_PHOTOS } from "@/lib/showcase";

const highlights = [
  { value: "400+", label: "Private residences" },
  { value: "18", label: "Prime neighborhoods" },
  { value: "24/7", label: "Concierge support" },
];

const marketOptions = [
  {
    icon: "home-search",
    title: "Buy a House",
    text: "Discover villas and houses crafted for ownership.",
    action: "Browse houses",
    purpose: "sale",
    propertyType: "house",
  },
  {
    icon: "key",
    title: "Rent a House",
    text: "Find refined homes available for immediate living.",
    action: "Browse rentals",
    purpose: "rent",
    propertyType: "house",
  },
  {
    icon: "home-plus",
    title: "Sell a House",
    text: "Present your residence to verified buyers.",
    action: "List your house",
    href: "/list-property?purpose=sale&propertyType=house",
  },
  {
    icon: "land-plus",
    title: "Sell a Plot",
    text: "Introduce your land to serious buyers.",
    action: "List your plot",
    href: "/list-property?purpose=sale&propertyType=plot",
  },
  {
    icon: "land-search",
    title: "Buy a Plot",
    text: "Explore select land ready for your next vision.",
    action: "Browse plots",
    purpose: "sale",
    propertyType: "plot",
  },
];

function ServiceIcon({ type }) {
  const icons = {
    "home-search": <><path d="m3 11 9-8 9 8" /><path d="M6 10v9h6" /><circle cx="16" cy="16" r="3" /><path d="m18.5 18.5 2.5 2.5" /></>,
    key: <><path d="M3 13 12 5l9 8" /><path d="M7 11v9h5" /><circle cx="16" cy="16" r="3" /><path d="M13 16h-2" /></>,
    "home-plus": <><path d="m3 11 9-8 9 8" /><path d="M6 10v10h12V10" /><path d="M12 12v6" /><path d="M9 15h6" /></>,
    "land-plus": <><path d="M3 18 9 6l6 12 3-7 3 7" /><path d="M7 21h14" /><path d="M18 3v6" /><path d="M15 6h6" /></>,
    "land-search": <><path d="M3 18 9 6l6 12 3-7 3 7" /><path d="M5 21h8" /><circle cx="17" cy="18" r="3" /><path d="m19.5 20.5 2 2" /></>,
  };
  return <svg aria-hidden="true" className="service-icon" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">{icons[type]}</svg>;
}

export default function Home() {
  const router = useRouter();
  const { loading: authLoading, user } = useFirebaseAuth();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [pendingService, setPendingService] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [accessOpen, setAccessOpen] = useState(false);

  const loadProperties = async (query = "") => {
    setLoading(true);
    setUnavailable(false);
    try {
      const response = await fetch(`${API_URL}/properties?${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load listings");
      const result = await response.json();
      setProperties(result.properties);
      setTotal(result.total);
    } catch {
      setUnavailable(true);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/properties?`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load listings");
        return response.json();
      })
      .then((result) => {
        if (active) {
          setProperties(result.properties);
          setTotal(result.total);
        }
      })
      .catch(() => {
        if (active) setUnavailable(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (city.trim()) query.set("city", city.trim());
    if (purpose) query.set("purpose", purpose);
    if (propertyType) query.set("propertyType", propertyType);
    void loadProperties(query.toString());
  };

  const browseMarket = (option) => {
    setPurpose(option.purpose);
    setPropertyType(option.propertyType);
    void loadProperties(`purpose=${option.purpose}&propertyType=${option.propertyType}`);
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
  };

  const requestService = (option) => {
    setPendingService(option);
    setAccessOpen(true);
  };

  const openUnlockedService = () => {
    setAccessOpen(false);
    if (!pendingService) return;
    if (pendingService.href) {
      router.push(pendingService.href);
      return;
    }
    setActiveService(pendingService);
    browseMarket(pendingService);
  };

  const startJourney = () => {
    router.push("/register");
  };

  return (
    <main className="luxury-home">
      <section className="hero-luxury page-container">
        <Reveal className="hero-content">
          <p className="eyebrow">THE Deal Maker</p>
          <div className="hero-offer">
            <p className="eyebrow">Direct owner connection</p>
            <h2>Save brokerage.</h2>
            <p>
              List all your properties for just <strong>Rs. 251/-</strong> and
              connect directly with your customers.
            </p>
          </div>
          <div className="hero-actions">
            {!authLoading && !user && (
              <button
                className="gold-button link-button"
                onClick={startJourney}
                type="button"
              >
                Get started
              </button>
            )}
            <Link className="ghost-button link-button" href="/contact">Contact us</Link>
          </div>
          <div className="hero-metrics">
            {highlights.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="mosaic-gallery" delay={0.15}>
          {HOME_PHOTOS.map((home, index) => (
            <motion.div
              className={`mosaic-image mosaic-${index + 1}`}
              key={home.title}
              style={{ backgroundImage: `url("${home.image}")` }}
              whileHover={{ scale: 1.025 }}
            >
              <span>{home.title}</span>
              <small>{home.location}</small>
            </motion.div>
          ))}
          <div className="mosaic-badge">Premium portfolio</div>
        </Reveal>
      </section>

      <section className="market-options page-container" id="services">
        <div className="section-heading-dark">
          <div>
            <p className="eyebrow">Our services</p>
            <h2>Every property move, expertly handled.</h2>
          </div>
        </div>
        <Stagger className="market-grid">
          {marketOptions.map((option) => (
            <StaggerItem key={option.title}>
              <button className="market-card service-tile glass-panel" onClick={() => requestService(option)} type="button">
                <div className="service-tile-top">
                  <ServiceIcon type={option.icon} />
                  <span className="access-chip">Rs. 251/- access</span>
                </div>
                <h3>{option.title}</h3>
                <p>{option.text}</p>
                <span className="market-action">{option.action}</span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {activeService && (
        <section className="service-workspace page-container" id="properties">
          <div className="section-heading-dark">
            <div>
              <p className="eyebrow">Unlocked service</p>
              <h2>{activeService.title}: explore available listings</h2>
            </div>
            {activeService.title === "Rent a House" && (
              <Link className="outline-gold-button link-button" href="/list-property?purpose=rent&propertyType=house">
                List a rental home
              </Link>
            )}
          </div>
          <form className="luxury-search glass-panel" onSubmit={submitSearch}>
        <label>
          <span>Destination</span>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Mumbai, Goa, Bengaluru" />
        </label>
        <label>
          <span>Residence</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Penthouse, villa, waterfront" />
        </label>
        <label>
          <span>Intent</span>
          <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
            <option value="">Rent or purchase</option>
            <option value="rent">Rent</option>
            <option value="sale">Purchase</option>
          </select>
        </label>
        <label>
          <span>Property type</span>
          <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
            <option value="">All property types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
        <button className="gold-button" type="submit">Search</button>
          </form>
          <div className="service-results">
            {!loading && !unavailable && <p className="results-count">{total} available listing{total === 1 ? "" : "s"}</p>}
            {loading ? (
              <div className="luxury-grid">{[1, 2, 3].map((item) => <div className="dark-skeleton" key={item} />)}</div>
            ) : properties.length ? (
              <Stagger className="luxury-grid">
                {properties.map((property, index) => (
                  <StaggerItem key={property._id}><PropertyCard index={index} property={property} /></StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="empty-state">No matching listings yet. Try another location or check again soon.</div>
            )}
          </div>
        </section>
      )}

      {!activeService && <section className="residences-section page-container">
        <div className="section-heading-dark">
          <div>
            <p className="eyebrow">Portfolio preview</p>
            <h2>Homes that define the standard</h2>
          </div>
        </div>
        <Stagger className="curated-grid">
            {HOME_PHOTOS.slice(0, 3).map((home) => (
              <StaggerItem className="curated-card" key={home.title}>
                <div style={{ backgroundImage: `url("${home.image}")` }}>
                  <span className="premium-pill">Signature</span>
                </div>
                <h3>{home.title}</h3>
                <p>{home.location} | Portfolio preview</p>
              </StaggerItem>
            ))}
          </Stagger>
      </section>}

      <ServiceAccessModal onClose={() => setAccessOpen(false)} onUnlocked={openUnlockedService} open={accessOpen} />
    </main>
  );
}
