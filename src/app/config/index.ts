import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    expires: process.env.EMAIL_EXPIRES,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    address: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    email_from: process.env.RESEND_EMAIL_FROM,
  },
  stripe: {
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    gminiApiKey: process.env.GMINI_API_KEY,
    xaiApiKey: process.env.XAI_API_KEY,
    groqApikey: process.env.GROQ_API_KEY,
    googleApikey: process.env.GOOGLE_API_KEY,
    qdrantApiKey: process.env.QDRANG_API_KEY,
    qdrangEnpoind: process.env.QDRANG_ENPOINT,
  },

  frontendUrl: process.env.FRONTEND_URL,
};
