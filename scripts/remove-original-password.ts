import mongoose from "mongoose";
import { DBconnect } from "@/libs/mongodb";
import User from "@/models/user";

const execute = process.argv.includes("--execute");

async function main() {
  if (
    execute &&
    (process.env.MIGRATION_BACKUP_CONFIRMED !== "true" ||
      process.env.MIGRATION_CONFIRM !== "unset-original-password")
  ) {
    throw new Error(
      "Execution requires a confirmed backup and explicit migration confirmation",
    );
  }

  await DBconnect();
  const filter = { originalPassword: { $exists: true } };
  const matchedDocuments = await User.collection.countDocuments(filter);

  if (!execute) {
    console.log(
      JSON.stringify({
        migration: "unset-original-password",
        mode: "dry-run",
        matchedDocuments,
      }),
    );
    return;
  }

  const result = await User.collection.updateMany(filter, {
    $unset: { originalPassword: "" },
  });
  const remainingDocuments = await User.collection.countDocuments(filter);

  console.log(
    JSON.stringify({
      migration: "unset-original-password",
      mode: "execute",
      matchedDocuments,
      modifiedDocuments: result.modifiedCount,
      remainingDocuments,
    }),
  );

  if (remainingDocuments !== 0) {
    throw new Error("Migration verification failed");
  }
}

main()
  .catch(() => {
    console.error("Migration failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
