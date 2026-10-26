# Sheraz Yousaf · Portfolio

Next.js 16 (App Router) · Tailwind CSS 4 · GSAP + ScrollTrigger + SplitText · Lenis · Motion · React Three Fiber · next-themes

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

The preloader plays once per browser session. Open a new tab (or a private window) to see it again.

## Edit content

Everything visible on the site lives in **`src/data/portfolio.ts`**: name, roles, tagline, about copy, experience, projects, playground, skills, education, certificates, links and the site URL. Search that file for `TODO` to find gaps.

Images live in `public/images/` (`sheraz.webp` portrait, `projects/`, `playground/`). The résumé PDF is `public/Sheraz-Yousaf-Resume.pdf`.

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `SherazYousafDev/Sheraz-Yousaf-Portfolio`.
2. Framework preset: **Next.js** (detected automatically). Leave build settings as they are.
3. Click **Deploy**.
4. Copy your live URL into `site.url` in `src/data/portfolio.ts`, commit and push. Vercel redeploys on every push to `main`. This URL feeds the sitemap, robots file and social preview links.
5. Optional custom domain: in Vercel open **Project → Settings → Domains**, add the domain, and create the DNS records Vercel shows you (in Cloudflare, set them to **DNS only**, grey cloud).

## Easter egg

Type `sheraz` anywhere (or the Konami code). On phones, tap the footer name five times.
