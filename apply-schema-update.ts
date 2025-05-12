import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

async function applySchemaUpdate() {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Error: Supabase URL or key not found in environment variables."
    );
    process.exit(1);
  }

  try {
    // Create Supabase client with service role key for full access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the SQL update file
    const sqlFilePath = path.join(process.cwd(), "schema-update.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Applying schema updates to Supabase...");

    // Execute the SQL
    const { error } = await supabase.rpc("pg_execute", { query: sql });

    if (error) {
      console.error("Error applying schema updates:", error);
      process.exit(1);
    }

    console.log("Schema updates applied successfully!");

    // Verify the websites table has the machine_id column
    const { data, error: verifyError } = await supabase
      .from("websites")
      .select("machine_id")
      .limit(1);

    if (verifyError) {
      console.error("Error verifying schema update:", verifyError);
    } else {
      console.log(
        "Verification successful: websites table has machine_id column"
      );
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

// Run the function
applySchemaUpdate();
