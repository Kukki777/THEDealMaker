import LegalPage from "@/components/LegalPage";

const sections = [
  {
    heading: "Marketplace information",
    paragraphs: [
      "Property descriptions, photographs, prices, availability, ownership statements, location information, and amenities may be provided by owners or property partners. Users should independently verify all material details before making decisions or payments.",
    ],
  },
  {
    heading: "No professional advice",
    paragraphs: [
      "THEDealMaker is a property discovery and connection platform. Website content is not legal, financial, valuation, tax, title, or investment advice. Appropriate independent professional advice should be obtained where required.",
    ],
  },
  {
    heading: "Maps and third-party services",
    paragraphs: [
      "Maps, satellite imagery, payment services, authentication, media hosting, and email delivery may depend on third-party providers. Availability, accuracy, and processing time may vary according to those providers.",
    ],
  },
  {
    heading: "Transaction responsibility",
    paragraphs: [
      "Users remain responsible for due diligence, documentation, identity checks, regulatory compliance, and the terms of any property transaction. THEDealMaker does not guarantee completion, title, returns, rental outcome, or suitability of a listing.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Important notice"
      intro="Please review these limitations before relying on a listing or entering any property-related arrangement."
      sections={sections}
      title="Disclaimer"
    />
  );
}
