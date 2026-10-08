export const REPO = "https://github.com/tcvdh/leakybyte";
export const EMAIL = "hello@leakybyte.xyz";

export const PRODUCTS = [
  { slug: "veil", name: "Veil", where: "Before the model", blurb: "Redact secrets and personal data before a prompt leaves." },
  { slug: "canary", name: "Canary", where: "In your data", blurb: "Plant fake keys and prove when one leaks." },
  { slug: "plug", name: "Plug", where: "After the model", blurb: "Block data theft through model output." },
] as const;

export const UPDATED = "8 October 2026";

// Fill these in before launch. While any required value still starts with "[", legal pages show a draft banner.
export const LEGAL = {
  name: "[Legal name of the person or company that runs LeakyByte]",
  address: "[Street, postcode, city, country]",
  jurisdiction: "[Country or state whose law governs these terms]",
  registration: "", // company registration number, if you have one (leave empty to hide)
  vat: "", // VAT ID, if you have one (leave empty to hide)
};

export const legalDraft = [LEGAL.name, LEGAL.address, LEGAL.jurisdiction].some((v) => v.startsWith("["));
