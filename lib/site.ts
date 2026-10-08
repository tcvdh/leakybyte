export const REPO = "https://github.com/tcvdh/leakybyte";
export const EMAIL = "hello@leakybyte.xyz";

export const PRODUCTS = [
  { slug: "veil", name: "Veil", where: "Before the model", blurb: "Redact secrets and personal data before a prompt leaves." },
  { slug: "canary", name: "Canary", where: "In your data", blurb: "Plant fake keys and prove when one leaks." },
  { slug: "plug", name: "Plug", where: "After the model", blurb: "Block data theft through model output." },
] as const;
