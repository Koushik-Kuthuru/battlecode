# **App Name**: BattleCode

## Core Features:

- Email and ID Verification: Email and ID number verification during registration/login.
- Secure Authentication: JWT-based user authentication and bcrypt for password hashing.
- Question Filters: Display coding questions filtered by difficulty (Easy, Medium, Hard) and programming language (C, C++, Java, Python).
- Online Code Editor: Built-in code editor (Monaco Editor or CodeMirror) with syntax highlighting. Enhanced with anti-copy and anti-paste to discourage plagiarism. If the user navigates to a different browser tab during the coding assessment, use a tool to generate a submission using their in-progress code.
- Live Leaderboard: Leaderboard displays top 10 users with gold, silver, bronze badges and updates live after submissions with user name, points, and rank.
- Anti-Cheat Features: Implement anti-cheat measures to disable copy, paste, and inspect element in the editor, detect tab switches using the visibilitychange event, and prevent multiple logins from the same account.
- Infinite Scroll: Dashboard will implement infinite scroll in order to quickly load additional challenges as needed

## Style Guidelines:

- Primary color: A vibrant SMEC Blue (#3498DB) to resonate with the college theme. Chosen for its familiarity and calming effect, promoting focus during coding challenges. This saturated blue contrasts effectively with the light background.
- Background color: Light blue (#EBF5FB), a desaturated variant of the primary blue, creating a soft and non-distracting backdrop.
- Accent color: A lively cyan (#45B39D), analogous to the primary blue, adding a refreshing touch to the interface, used for interactive elements and notifications.
- Body and headline font: 'Inter' (sans-serif) provides a modern and clean look suitable for both headlines and body text.
- Use icons that are minimalist and consistent with the SMEC theme, focusing on clarity and ease of recognition. Badges should have a clean vector style
- The layout will emphasize code readability, question clarity, and intuitive navigation with an interface focused on SMEC branding.
- Implement subtle, non-intrusive animations for feedback and user interactions, enhancing usability without distracting from the coding process.