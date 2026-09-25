/** Content for the "Load example" link — lets a visitor try the tool without
    having their own resume and job posting on hand yet. Deliberately built
    so the job posting asks for a couple of things (GraphQL, experimentation)
    the example resume doesn't mention, so the match analysis has something
    real to show. LaTeX source, since that's the only format the tool
    accepts. */
export const EXAMPLE_RESUME = `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large \\textbf{Priya Raghavan}} \\\\
Frontend Engineer \\\\
priya.raghavan@email.com \\quad (416) 555-0148 \\quad Toronto, ON
\\end{center}

\\section*{Experience}

\\textbf{Frontend Engineer, Bellwood Systems} (2022--Present)
\\begin{itemize}
  \\item Rebuilt the customer billing dashboard in React, cutting page load time from 4.1s to 1.6s
  \\item Led migration of the design system to Tailwind CSS across 12 product surfaces
  \\item Mentored two junior engineers through their first full feature launches
\\end{itemize}

\\textbf{Frontend Developer, Casewell Studio} (2020--2022)
\\begin{itemize}
  \\item Built marketing and onboarding flows for six client web apps
  \\item Introduced automated accessibility checks into the CI pipeline
  \\item Partnered with designers to turn Figma files into production components
\\end{itemize}

\\section*{Education}
B.Sc. Computer Science, University of Waterloo, 2020

\\section*{Skills}
React, TypeScript, Tailwind CSS, REST APIs, Jest, Git

\\end{document}`;

export const EXAMPLE_JOB_DESCRIPTION = `Senior Frontend Engineer, Growth
Alderleaf Health

We're looking for a Senior Frontend Engineer to join our growth team and help patients find and book care faster.

What you'll do:
- Own frontend architecture for our booking and intake flows
- Partner with product and design on experiments that move activation and conversion
- Build accessible, performant interfaces in React and TypeScript
- Set up and interpret A/B tests using our in-house experimentation platform
- Collaborate with backend engineers on GraphQL API design

What we're looking for:
- 4+ years building production React applications
- Experience with TypeScript, GraphQL, and component-driven design systems
- A track record of shipping measurable improvements to conversion or engagement
- Comfort working directly with product and design in a fast-moving team
- Experience with experimentation or A/B testing platforms is a plus`;
