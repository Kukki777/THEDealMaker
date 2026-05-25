import LegalPage from "@/components/LegalPage";

const sections = [
  {
    heading: "Information we collect",
    paragraphs: [
      "We may collect account identifiers, name, email address, mobile number, enquiry content, property listing details, uploaded property images, payment status, and authentication information required to provide our services.",
    ],
  },
  {
    heading: "How information is used",
    paragraphs: [
      "We use information to authenticate users, deliver OTP or Google sign-in flows, manage listings and enquiries, unlock paid access, provide customer support, review platform activity, and improve service quality.",
      "Images submitted with listings may be stored using our configured media-storage service or local development storage while the service is being tested.",
    ],
  },
  {
    heading: "Service providers and disclosure",
    paragraphs: [
      "We may use providers for authentication, payments, media hosting, mapping, email delivery, and infrastructure. Information is shared only as reasonably required for those functions or where required by law.",
      "Property contact information may be made available where necessary to support a genuine enquiry or property connection.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You may contact us to request correction or deletion of your personal information, subject to legal, fraud-prevention, payment, and record-keeping requirements.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      intro="This notice describes how THEDealMaker handles personal data supplied through the website and related property services."
      sections={sections}
      title="Privacy Policy"
    />
  );
}
