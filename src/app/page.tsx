import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Stack } from "@/components/sections/stack";
import { Placeholder } from "@/components/sections/placeholder";

export default function Home() {
  return (
    <main id="main" className="relative z-10">
      <Hero />
      <About />
      <Experience />
      <Work />
      <Stack />
      <Placeholder id="education" chapter="paper" />
      <Placeholder id="contact" chapter="ink" />
    </main>
  );
}
