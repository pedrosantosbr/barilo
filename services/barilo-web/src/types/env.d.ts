// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    API_URL: string;
    AGOLIA_ID: string;
    AGOLIA_SEARCH_KEY: string;
    NEXT_PUBLIC_API_URL: string;
    // Add other environment variables as needed
  }
}
