import fs from "fs";
import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);
const seedsDir = "dist/database/seeds";

function getSeedFiles() {
  return fs.readdirSync(seedsDir).filter(file => file.endsWith(".js"));
}

async function markSeedsAsExecuted() {
  const seedFiles = getSeedFiles();

  if (seedFiles.length === 0) {
    logger.info("No seed files found in the seeds directory.")
    return;
  }
  logger.info(`Found ${seedFiles.length} seed files. Marking them as executed...`)

  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeData" (
        "name" VARCHAR(255),
        PRIMARY KEY ("name")
      )
    `);

    await sequelize.query(
      `INSERT INTO "SequelizeData" (name) VALUES ${seedFiles
        .map(seed => `('${seed}')`)
        .join(", ")}`
    );
  } catch (error) {
    logger.error("Error marking seeds as executed:", error);
  } finally {
    await sequelize.close();
  }
}

markSeedsAsExecuted();
