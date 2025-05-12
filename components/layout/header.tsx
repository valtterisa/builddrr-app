import { createClient } from "@/lib/supabase/server";
import Navbar from "./navbar";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <Navbar user={user} />;
}
