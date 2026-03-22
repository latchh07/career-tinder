# 🔥 Career-Tinder

**Career-Tinder** is an AI-powered career discovery engine designed to eliminate "choice paralysis" in the job market. Built with **Next.js 15** and **OpenAI**, it transforms traditional, static job searching into a dynamic, "swipe-based" experience. By analyzing user profiles against massive datasets, it provides personalized career coaching and role recommendations that feel like a conversation, not a search query.

## The "Tech Behind the Swipe"
I built this using a Modern **Full-Stack TypeScript** Architecture, prioritizing performance and type safety to handle real-time AI interactions.

**The Engine:** Powered by **OpenAI's GPT-4o**. I implemented a custom structured-output logic that parses user resumes and preferences to generate "Compatibility Scores," ensuring every match is backed by data-driven reasoning.

**The Data Layer:** To handle large-scale career datasets efficiently, I integrated **PapaParse**. This allows the app to process and stream complex CSV job data directly in the browser, reducing server load and ensuring the "swipe" interface remains lag-free.

**The UI/UX:** Built with **Tailwind CSS 4** and **Lucide React**. I focused on a "Mobile-First" design philosophy, implementing high-performance animations for the card-stack interface to mimic the responsiveness of native dating apps.

**The Frontend:** Built on **Next.js 16** and **React 19**. I architected the application to leverage React Server Components (RSC) for zero-bundle-size data fetching and improved SEO. By offloading heavy logic to the server and utilizing React Suspense for streaming, I ensured the "Swipe" interface stays interactive and maintains a 60fps performance target through optimized Client Component hydration and concurrent rendering.

## Key Features

1. **AI-Driven Matching Engine:** Uses OpenAI's GPT-4o to analyze candidate resumes against complex job descriptions, generating real-time "Compatibility Scores" and qualitative fit analysis.

2. **Gesture-Based Discovery:** A high-performance "Swipe" interface built with Framer Motion (or CSS transitions) that allows users to rapidly iterate through career paths with zero latency.

3. **Large-Scale Data Parsing:** Integrated PapaParse to handle asynchronous CSV processing, allowing the app to ingest and display thousands of job roles without taxing the server.

4. **AI Career Coach:** A dedicated mentorship module where users can ask follow-up questions about "matched" roles to receive personalized interview tips and skill-gap analysis.

5. **Universal Responsive Design:** A mobile-first UI built with Tailwind CSS 4, ensuring the "Tinder-style" experience feels native on both desktop and mobile browsers.

6. **Secure Profile Management:** Implements best practices for environment variable safety and structured JSON data handling for user preferences.

## Architecture
```
├── app/
│   ├── api/                # Backend: OpenAI match-making & profile logic
│   ├── coach/              # Feature: AI Career Mentorship & Chat module
│   ├── swipe/              # Feature: The core Tinder-style Card interface
│   ├── tracker/            # Feature: Application history & status dashboard
│   ├── layout.tsx          # Root Layout: Global providers and navigation
│   └── page.tsx            # Landing Page: Entry point for Career-Tinder
├── components/             # UI Components: Animated SwipeCards, Modals, & Buttons
├── data/                   # Datasets: CSV/JSON role mappings for PapaParse
├── lib/                    # Core Utilities: OpenAI client & PapaParse config
├── public/                 # Assets: Brand logos, icons, and static images
├── .env.local              # Secrets: API keys (GIT IGNORED)
├── next.config.ts          # Config: Next.js environment & image optimization
├── tailwind.config.ts      # Styling: Theme tokens & custom swipe animations
├── tsconfig.json           # TypeScript: Strict type-checking configurations
└── package.json            # Manifest: Project dependencies (Next 16, React 19)
```

## Prerequisites
Ensure you have Node.js 18+ installed. Install the dependencies:
```npm install```

## Installation 

1. **Clone this repository** 
Use `git clone https://github.com/latchh07/career-tinder.git` or download the ZIP.

2. **Set up the Environment** 
Create a `.env.local` file in the root directory and add your API keys:
   ```env
   OPENAI_API_KEY=your_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
3. **Launch the Development Server** 
Open your terminal and run: ```npm run dev```

4. **Start using Career-Tinder** 
Open http://localhost:3000 in your browser to see the app in action.

## What I Learned
This project taught me the complexity of Client-Side Data Processing. The hardest part wasn't the UI—it was managing the state of the card stack while asynchronously calling the OpenAI API. I had to learn how to pre-fetch "matches" in the background so the user never hits a "loading" screen while swiping. It also reinforced the importance of Type Safety in TypeScript when handling unpredictable AI responses.

## Future Roadmap
1. LinkedIn Integration: Allowing users to one-click import their professional history.

2. Market Insights: Real-time salary data visualization using Chart.js based on the "matched" roles.

3. Recruiter Mode: A reverse-swipe interface for hiring managers to find candidates who have "swiped right" on their company.