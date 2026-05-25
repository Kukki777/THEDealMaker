import LegalPage from "@/components/LegalPage";

const sections = [
  {
    heading: "Service access fee",
    paragraphs: [
      "The Rs. 111 one-time access fee unlocks THEDealMaker services for the account used at checkout. Because access is supplied digitally upon successful payment, the fee is generally non-refundable once activated.",
    ],
  },
  {
    heading: "Refund eligibility",
    paragraphs: [
      "A refund may be reviewed where payment was debited but service access was not activated, a duplicate charge occurred for the same account, or payment was collected because of a technical error attributable to THEDealMaker.",
      "Requests should be submitted through our Contact page with your registered email or mobile number, payment reference, payment date, and a short description of the issue.",
    ],
  },
  {
    heading: "Review and processing",
    paragraphs: [
      "Approved refunds will be initiated to the original payment method. Banking and payment-gateway settlement timelines may apply after a refund is initiated.",
      "Refunds do not cover property deposits, brokerage, rent, token payments, or other amounts exchanged directly with third parties outside THEDealMaker's service-access checkout.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Payments"
      intro="Our refund terms are designed for the digital access pass used to discover and present properties on THEDealMaker."
      sections={sections}
      title="Refund Policy"
    />
  );
}
