# **App Name**: Ndanga Agent

## Core Features:

- User Authentication: Secure user authentication using Firebase Phone Auth.
- Lead Discovery: Discover leads using Algolia Search based on defined targets (platform, type, term).
- Lead Scoring and Filtering: Rate leads by relevance (confidence score) using generative AI and enable users to filter them accordingly
- Automated Reply Generation: Use generative AI to generate draft replies for leads, as a helpful starting point for the user. This will require using the lead content, confidence score and user's instructions as a tool to build the automated response
- Lead Management: Manage leads with status updates (e.g., 'pending', 'replied', 'ignored'), tags, and draft replies.
- Worker Management: Manage worker accounts for each platform with cookie and account status (admin only).
- Activity Tracking: Track user actions (replies, ignores) associated with each lead, logging into the actions collection.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to convey trust, intelligence, and focus on the core lead finding mission.
- Background color: Light Lavender (#E6E6FA), a very light tint of indigo.
- Accent color: Teal (#008080), to give affordances a strong call to action without distracting from the overall tone.
- Headline font: 'Space Grotesk', a sans-serif with a contemporary, somewhat techy style.
- Body font: 'Inter', a grotesque-style sans-serif with a modern, neutral look.
- Modern, minimalist icons representing lead sources and actions.
- Clean, intuitive layout with clear visual hierarchy to highlight important information.
- Subtle animations to provide feedback on user interactions (e.g., lead updates, reply sends).