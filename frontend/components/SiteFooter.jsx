import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="luxury-footer">
      <div className="footer-shell">
        <div className="footer-brand footer-brand-panel">
          <Link className="brand" href="/">
            <span aria-hidden="true" className="brand-mark" />
            <span className="brand-name">THE<span>DealMaker</span></span>
          </Link>
          <p>Premium property discovery for refined houses and plots. Sell, rent, or find your next address with confidence.</p>
          <Link className="footer-contact-link" href="/contact">
            <span>Concierge support</span>
            Start an enquiry
          </Link>
        </div>
        <div className="footer-columns">
          <div>
            <strong>Explore</strong>
            <Link href="/#services">Services</Link>
            <Link href="/#services">Property access</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
          </div>
          <div>
            <strong>Account</strong>
            <Link href="/login">Client login</Link>
            <Link href="/register">Create account</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div>
            <strong>Policies</strong>
            <Link href="/return-policy">Return Policy</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 THEDealMaker. Property Sale &amp; Purchase Firm.</p>
        <p>Payments secured through Razorpay | Private enquiries protected</p>
      </div>
    </footer>
  );
}
