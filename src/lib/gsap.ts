"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);
  CustomEase.create("curtain", "0.76,0,0.24,1");
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
