import app from "./app";
import { sequelize } from "./config/database";

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

startServer();
