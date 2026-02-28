# Spent Tracker
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/GhOstOP007/spent-tracker)

A modern and intuitive mobile application built with React Native and Expo to help you track your daily expenses seamlessly. The app features a clean user interface, multiple themes, and real-time data synchronization with Supabase.

## Features

- **Dashboard Overview:** Get a quick overview of your finances with an interactive dashboard that displays:
    - Total amount spent.
    - Monthly budget progress.
    - A pie chart visualizing spending by category.
    - A list of recent transactions.
- **Add Expenses:** Quickly add new expenses through an intuitive modal, specifying the title, amount, and category.
- **Data Persistence:** All expense data is securely stored and synchronized with a Supabase backend, ensuring your data is always up-to-date across sessions.
- **Theming:** Personalize your experience with three available themes: Light, Dark, and AMOLED.
- **State Management:** Utilizes Zustand for efficient and minimalistic state management.
- **Modern UI:** Built with React Native Paper, providing a polished and consistent user interface.

## Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **UI Library:** React Native Paper
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Backend & Database:** Supabase
- **Charting:** React Native Chart Kit
- **Styling:** StyleSheet, React Native Paper Theming

## Project Structure

The project is organized into the following main directories:

```
src
├── components/       # Reusable UI components (e.g., AddExpenseModal)
├── navigation/       # Navigation logic and configuration (AppNavigator)
├── screens/          # Application screens (e.g., DashboardScreen)
├── store/            # Zustand stores for state management (expenses, theme)
├── theme/            # Theme definitions and color palettes
└── supabase.ts       # Supabase client initialization
```

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (LTS version recommended)
- Expo CLI
- A Supabase account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GhOstOP007/spent-tracker.git
    cd spent-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    - Create a new project on [Supabase](https://supabase.com/).
    - In your Supabase project, create a new table named `expenses` with the following columns:
      - `id` (uuid, primary key)
      - `created_at` (timestamptz, default: `now()`)
      - `title` (text)
      - `amount` (float8)
      - `category` (text)
      - `date` (timestamptz)
    - Find your Project URL and anon (public) key in your Supabase project's API settings.
    - Update `src/supabase.ts` with your Supabase URL and Key.

    ```typescript
    // src/supabase.ts
    import { createClient } from "@supabase/supabase-js";

    const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
    const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

    export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    ```

### Running the App

Once the setup is complete, you can run the application using the following scripts:

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in the web browser
npm run web
```

This will start the Metro bundler. You can then run the app on an emulator/simulator or scan the QR code with the Expo Go app on your physical device.
