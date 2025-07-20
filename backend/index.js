import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import prisma from "./src/config/prisma.js";

const PORT = process.env.PORT || 5000;

try {
  await prisma.$connect();
  console.log('🚀 Prisma connected to PostgreSQL successfully');
} catch (error) {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});