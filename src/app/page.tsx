import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Stack } from "@/components/sections/stack";
import { Education } from "@/components/sections/education";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <main id="main" className="relative z-10">
      <Hero />
      <About />
      <Experience />
      <Work />
      <Stack />
      <Education />
      <Contact />
    </main>
  );
}
