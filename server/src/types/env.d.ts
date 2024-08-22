declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      DATABASE_URL: string
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      GOOGLE_CLIENT_ID: string;
      SESSION_ENCRYPTION_KEY: string;
      GOOGLE_CLIENT_SECRET: string;
      CLIENT_URL: string;
    }
  }
}

export {}
