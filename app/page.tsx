import PromptTool from "@/components/interactive/prompt-tool";
import { DemoVideo } from "@/components/landing-page/demo-video";
import Pricing from "@/components/landing-page/pricing-section";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="relative">
        <Navbar user={user?.user_metadata} />
        <PromptTool user={user} />
      </div>

      <DemoVideo />
      <Footer />
    </>
  );
}
