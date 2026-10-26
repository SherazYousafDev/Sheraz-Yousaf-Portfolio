/**
 * Every piece of content on the site lives here.
 * Source of truth: Sheraz_Yousaf_Resume_Updated.docx — nothing below is invented.
 * Search for "TODO" to find content the resume didn't contain.
 */

export const site = {
  // TODO: replace with your final production domain once deployed on Vercel.
  url: "https://sheraz-yousaf.vercel.app",
  title: "Sheraz Yousaf · Data Analyst & Frontend Developer, Lahore",
  description:
    "Sheraz Yousaf is a Data Analyst in Lahore working in product data management: data validation, catalog audits and reporting, with a background in frontend development.",
};

export const person = {
  firstName: "Sheraz",
  lastName: "Yousaf",
  initials: "SY",
  location: "Lahore, Pakistan",
  timeZone: "Asia/Karachi",
  coordinates: "31.5204° N, 74.3587° E",
  email: "sheraz.devv@gmail.com",
  phone: "+92 326 5897172",
  available: true,
  availabilityLabel: "Open to Data Analyst roles",
  /** Rotated through the scramble effect in the hero. */
  roles: ["Data Analyst", "Product Data Analyst", "Data Quality Analyst", "Frontend Developer"],
  /** Hero one-liner. Short, specific, true to the resume. */
  tagline: "I find what’s wrong in product data, and I still build what’s right on screen.",
  photo: { src: "/images/sheraz.webp", alt: "Portrait of Sheraz Yousaf in a navy blazer, arms crossed" },
  resume: "/Sheraz-Yousaf-Resume.pdf",
};

export const socials = [
  { label: "LinkedIn", short: "Li", href: "https://linkedin.com/in/sheraz-yousaf" },
  { label: "GitHub", short: "Gh", href: "https://github.com/SherazYousafDev" },
  { label: "Old portfolio", short: "Pf", href: "https://sheraz-yousaf.netlify.app/" },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Playground", href: "#playground" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  /**
   * Words light up as you scroll.
   * *word* = serif-italic accent · [word words] = data term, gets a red-pen underline.
   */
  manifesto:
    "I spend my days inside spreadsheets nobody else wants to open, comparing vendor sheets, WooCommerce and TireGuru line by line until every [SKU], [bolt pattern] and [price] *agrees*. Before data, I built responsive interfaces in React and Tailwind. Same instinct, different medium: find what’s *broken*, document it, fix it, follow up.",
  /** The spec sheet — key facts, all from the resume. */
  facts: [
    { k: "Based in", v: "Lahore, Pakistan", live: true },
    { k: "Now", v: "Data Analyst at EDatix since June 2026" },
    { k: "Catalog", v: "SD Tire & Wheel product data" },
    { k: "Before", v: "Frontend Developer at Zaions and CodeAlpha" },
    { k: "Studied", v: "BS Information Technology, University of Education" },
    { k: "Looking for", v: "Data Analyst · Product Data Analyst · Data Quality Analyst" },
  ],
  /** How the work actually goes, condensed from the EDatix bullets. */
  method: [
    { t: "Compare", d: "Vendor spreadsheets against WooCommerce and TireGuru, line by line, to surface every inconsistency." },
    { t: "Audit", d: "SKU, wheel size, bolt pattern, center bore, offset, finish and pricing: missing, wrong or duplicated." },
    { t: "Report", d: "Product audit reports covering missing SKUs, attributes, images and other catalog issues." },
    { t: "Fix & follow up", d: "Clean brand sheets for upload, request corrections from the team and follow every update through." },
  ],
};

export const experience = [
  {
    role: "Data Analyst",
    company: "EDatix",
    location: "Lahore, Pakistan",
    period: "June 2026 to Present",
    current: true,
    summary: "Product data management for SD Tire & Wheel operations.",
    points: [
      "Organize, clean, validate and review product data in Excel and Google Sheets for SD Tire & Wheel operations.",
      "Compare product information across vendor spreadsheets, WooCommerce and TireGuru (TG) to identify inconsistencies.",
      "Audit wheel attributes (SKU, wheel size, bolt pattern, center bore, offset, finish, pricing) for missing info, wrong attributes, duplicate groups and inconsistent descriptions.",
      "Review product searchability by wheel size and bolt pattern in TireGuru and document products that aren’t searchable.",
      "Prepare product audit reports covering missing SKUs, attributes, images and other catalog issues.",
      "Clean and prepare spreadsheets for each brand for TireGuru upload; organize product images and add image links to data sheets.",
      "Support pricing and inventory checks by comparing supplier data with existing catalog information.",
      "Coordinate with the team to report issues, request corrections and follow up on product data updates.",
    ],
    tags: ["Excel", "Google Sheets", "WooCommerce", "TireGuru", "Data Auditing"],
  },
  {
    role: "Frontend Developer Intern",
    company: "CodeAlpha",
    location: "Remote",
    period: "March 2025 to April 2025",
    current: false,
    summary: "Responsive UI components, shipped remotely.",
    points: [
      "Built and improved responsive UI components using HTML, CSS and JavaScript for different devices and screen sizes.",
      "Gained practical experience working on frontend development tasks in a remote environment.",
    ],
    tags: ["HTML", "CSS", "JavaScript"],
  },
  {
    role: "Frontend Developer",
    company: "Zaions",
    location: "Lahore, Pakistan",
    period: "May 2024 to July 2024",
    current: false,
    summary: "Layouts, page structure and visual consistency.",
    points: [
      "Developed and improved responsive layouts using HTML and CSS for different screen sizes.",
      "Assisted with refining UI components, page structure and visual consistency.",
    ],
    tags: ["HTML", "CSS", "Responsive"],
  },
];

export type Project = {
  name: string;
  /** Short client/industry line shown under the name. */
  client: string;
  kind: string;
  /** Leave undefined to hide the year until you confirm it. */
  year?: string;
  /** Shows a "Latest" badge. */
  latest?: boolean;
  stack: string[];
  href?: string;
  linkLabel?: string;
  image?: string;
  problem: string;
  solution: string;
  result: string;
};

/** Order = order on the page. Problem/solution lines are based on what each live site actually offers. */
export const projects: Project[] = [
  {
    name: "NAG Prime Engineering",
    client: "Electrical & solar contractor",
    kind: "Client website",
    year: "2026",
    latest: true,
    // Verified from the live build: React + Vite bundle, Tailwind CSS v4, served by Netlify.
    stack: ["React", "Vite", "Tailwind CSS", "Netlify", "Cloudflare"],
    href: "https://nagprimeengineering.com",
    linkLabel: "nagprimeengineering.com",
    image: "/images/projects/nag-prime.webp",
    problem:
      "An electrical and solar contractor needed one clear home for seven service lines (wiring, solar, industrial, maintenance, AC, optical fibre and lifts) that turns visitors into quote requests.",
    solution:
      "A fast React + Vite site styled with Tailwind CSS: a service page for each line with the typical work listed, a running services ticker, and call / Get a Quote actions always in reach.",
    // TODO: add a measurable result if the client shares one (enquiries, calls, load time).
    result: "Delivered for the client and live on Netlify, on a custom domain managed through Cloudflare.",
  },
  {
    name: "Arkgenisys",
    client: "Digital agency",
    kind: "Agency website",
    // TODO: add the year you built Arkgenisys.
    stack: ["React", "Tailwind CSS", "React Router", "Netlify"],
    href: "https://arkgenisys.com",
    linkLabel: "arkgenisys.com",
    image: "/images/projects/arkgenisys.webp",
    problem:
      "A digital agency needed a site that sells four services (UI/UX, web development, graphic design and marketing) and shows its featured work.",
    solution: "A React + Tailwind single page app with React Router navigation, so pages switch without full reloads.",
    // TODO: add a measurable result if you have one (traffic, Lighthouse score, client feedback).
    result: "Deployed on Netlify behind a custom domain configured through Hostinger, live today.",
  },
  {
    name: "Geo Leaders",
    client: "Piling & geotechnical contractor, Dubai",
    kind: "Company website",
    // TODO: add the year you built Geo Leaders.
    stack: ["React", "Tailwind CSS", "React Router", "Netlify"],
    href: "https://geo-leaders.com/",
    linkLabel: "geo-leaders.com",
    image: "/images/projects/geo-leaders.webp",
    problem:
      "A Dubai piling and geotechnical contractor needed its services, projects and certificates presented clearly, with a quote request one click away.",
    solution: "Built in React and Tailwind with React Router for instant page changes across every screen size.",
    // TODO: add a measurable result if you have one.
    result: "Deployed on Netlify with a custom domain through Namecheap, live today.",
  },
  {
    name: "CargoSphere",
    client: "Parcel booking & tracking",
    kind: "Final Year Project",
    // TODO: add the year (your BSIT finished May 2025) and a live preview or GitHub link.
    stack: ["React", "Tailwind CSS"],
    problem: "Booking a parcel usually means guessing at freight modes and prices before you can track anything.",
    solution: "A parcel booking app with a freight mode selector, a pricing calculator and a tracking dashboard.",
    result: "Designed around responsive layouts, accessibility and usability from the first screen.",
  },
];

export type Experiment = {
  /** File label carried over from the old portfolio's playground. */
  file: string;
  name: string;
  stack: string[];
  blurb: string;
  href?: string;
  image?: string;
};

/** "My Playground" — side experiments, taken from the old portfolio and GitHub. */
export const playground: Experiment[] = [
  {
    file: "RAW_FILE_V01",
    name: "MacOS Portfolio",
    stack: ["React", "Tailwind CSS"],
    blurb: "A personal portfolio inspired by the polish and smoothness of macOS, with clean, responsive React + Tailwind interfaces.",
    href: "https://sheraz-yousaf1.netlify.app/",
    image: "/images/playground/macos-portfolio.webp",
  },
  {
    file: "RAW_FILE_V02",
    name: "TuneHub",
    stack: ["JavaScript", "HTML", "CSS"],
    blurb: "A sleek browser music player with playlists, a responsive layout and smooth UI animations.",
    href: "https://sherazyousafdev.github.io/TuneHub/",
    image: "/images/playground/tunehub.webp",
  },
  {
    file: "RAW_FILE_V03",
    name: "Code Editor",
    stack: ["HTML", "CSS", "JavaScript"],
    blurb: "Write and test HTML, CSS and JavaScript in the browser with an instant live preview.",
    href: "https://sherazyousafdev.github.io/Code-Editor/",
    image: "/images/playground/code-editor.webp",
  },
  {
    file: "RAW_FILE_V04",
    name: "SkillSwap",
    stack: ["React", "Tailwind CSS", "Supabase"],
    // TODO: add a one-line description and the live link for SkillSwap.
    blurb: "A React + Tailwind app backed by Supabase. Live link coming soon.",
  },
  {
    file: "RAW_FILE_V05",
    name: "Pulse.Media",
    stack: ["React", "Supabase"],
    // TODO: add a one-line description and the live link for Pulse.Media.
    blurb: "A React app with a Supabase backend. Live link coming soon.",
  },
];

export const githubProfile = "https://github.com/SherazYousafDev";

export const skills = {
  marqueeTop: ["Excel", "Google Sheets", "SQL", "WooCommerce", "TireGuru", "Data Validation", "Data Cleaning"],
  marqueeBottom: ["React", "JavaScript", "Tailwind CSS", "HTML", "CSS", "Git", "Supabase", "Netlify", "Bootstrap"],
  groups: [
    { title: "Data & Databases", items: ["Microsoft Excel", "Google Sheets", "SQL"] },
    {
      title: "Analysis & Operations",
      items: [
        "Data Cleaning",
        "Data Validation",
        "Data Quality Checks",
        "Data Auditing",
        "Product Data Management",
        "Product Catalog Management",
        "Inventory Data Comparison",
        "Data Reporting",
      ],
    },
    { title: "Ecommerce & Tools", items: ["WooCommerce", "TireGuru (TG)", "Git", "GitHub", "Netlify", "Supabase"] },
    { title: "Frontend", items: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS", "Bootstrap"] },
  ],
};

export const education = [
  { degree: "BS Information Technology (BSIT)", school: "University of Education, Lahore", period: "Aug 2023 to May 2025" },
  { degree: "BS Computer Science (ADP)", school: "Riphah International University", period: "Mar 2021 to Aug 2023" },
];

export const certifications = [
  { name: "JavaScript for Beginners", issuer: "Simplilearn" },
  { name: "Fundamentals of Database", issuer: "Simplilearn" },
  { name: "Programming with Python", issuer: "Simplilearn" },
];

/** Section index used for the "SY-0X / 07" labels and the rail. */
export const chapters = [
  { id: "hero", label: "Index" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Selected Work" },
  { id: "playground", label: "Playground" },
  { id: "stack", label: "Stack" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;
