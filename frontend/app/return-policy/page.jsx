import LegalPage from "@/components/LegalPage";

const sections = [
  {
    heading: "Digital service access",
    paragraphs: [
      "THEDealMaker provides online property discovery and listing-access services. The one-time Rs. 251/- service access pass is a digital service and is not a physical product that can be returned.",
      "Once access has been activated for your account, it cannot be returned, transferred, exchanged, or resold.",
    ],
  },
  {
    heading: "Property transactions",
    paragraphs: [
      "THEDealMaker enables enquiries and connections relating to houses and plots. A property sale, purchase, lease, deposit, token amount, or agreement entered into with an owner, buyer, tenant, agent, or third party is governed by the terms agreed between those parties.",
      "We do not accept returns of property, booking arrangements, documents, or services supplied by independent property partners.",
    ],
  },
  {
    heading: "Incorrect or duplicate payment",
    paragraphs: [
      "If you believe you were charged more than once or access was not activated after a successful payment, contact us with the payment reference and registered contact details. We will review the account and payment record.",
    ],
  },
];

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      intro="This policy explains the non-returnable nature of digital access and the scope of property-related services available through THEDealMaker."
      sections={sections}
      title="Return Policy"
    />
  );
}
