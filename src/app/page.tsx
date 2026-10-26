import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Placeholder } from "@/components/sections/placeholder";

export default function Home() {
  return (
    <main id="main" className="relative z-10">
      <Hero />
      <About />
      <Experience />
      <Placeholder id="work" chapter="ink" />
      <Placeholder id="stack" chapter="accent" />
      <Placeholder id="education" chapter="paper" />
      <Placeholder id="contact" chapter="ink" />
    </main>
  );
}
