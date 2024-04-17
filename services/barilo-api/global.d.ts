namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    OPENAI_API_KEY: string;
    // add more environment variables and their types here
  }
}