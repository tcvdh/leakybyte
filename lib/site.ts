export const REPO = "https://github.com/tcvdh/leakybyte";
export const EMAIL = "hello@leakybyte.xyz";

export const PRODUCTS = [
  { slug: "veil", name: "Veil", where: "Before the model", blurb: "Redact secrets and personal data before a prompt leaves." },
  { slug: "canary", name: "Canary", where: "In your data", blurb: "Plant fake keys and prove when one leaks." },
  { slug: "plug", name: "Plug", where: "After the model", blurb: "Block data theft through model output." },
] as const;

export const UPDATED = "8 October 2026";

export const LEGAL = {
  name: "Thijs van den Heuvel",
  country: "the Netherlands",
  address: "", // optional postal address; leave empty to omit
  jurisdiction: "the Netherlands",
  registration: "", // company registration number (KvK), if you have one
  vat: "", // VAT ID, if you have one
};

// "Name, address" when an address is set, otherwise "Name (country)".
export const OPERATOR = LEGAL.address ? `${LEGAL.name}, ${LEGAL.address}` : `${LEGAL.name} (${LEGAL.country})`;

// While a required value still starts with "[", legal pages show a draft banner.
export const legalDraft = [LEGAL.name, LEGAL.jurisdiction].some((v) => v.startsWith("["));
