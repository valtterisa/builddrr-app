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
        {/* Responsive SVG background */}
        <svg
          className="svg-hero absolute inset-0 w-full h-full z-0 select-none pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 560"
          aria-hidden="true"
        >
          <g mask="url(#SvgjsMask1000)" fill="none">
            <rect
              width="1440"
              height="560"
              x="0"
              y="0"
              fill="rgba(250, 242, 255, 1)"
            />
            <path
              d="M0,480.628C92.909,485.99,198.936,477.783,264.798,412.033C329.633,347.308,309.085,239.972,330.331,150.857C346.893,81.386,384.922,16.799,375.916,-54.049C366.836,-125.484,321.191,-183.604,280.284,-242.867C234.543,-309.132,196.289,-385.948,123.32,-419.989C46.001,-456.059,-43.711,-450.885,-127.118,-432.925C-215.012,-413.999,-313.082,-389.45,-363.674,-315.126C-413.583,-241.805,-380.594,-143.861,-384.206,-55.24C-387.399,23.1,-407.281,100.449,-383.656,175.21C-358.133,255.977,-312.127,329.806,-245.857,382.561C-175.401,438.649,-89.905,475.439,0,480.628"
              fill="#e7c0ff"
            />
            <path
              d="M1440 982.008C1526.015 993.044 1618.17 997.4390000000001 1693.376 954.261 1769.9279999999999 910.3109999999999 1827.1100000000001 832.376 1849.394 746.9639999999999 1870.297 666.846 1828.47 587.526 1810.124 506.784 1793.41 433.223 1786.237 358.523 1746.556 294.367 1701.879 222.13299999999998 1644.713 158.051 1569.744 118.13400000000001 1483.612 72.27300000000002 1379.797 11.783999999999992 1290.741 51.670000000000016 1199.915 92.34899999999999 1192.598 218.02499999999998 1148.033 307.009 1115.104 372.759 1073.429 433.004 1063.283 505.836 1053.1680000000001 578.447 1062.341 651.92 1090.557 719.585 1119.431 788.828 1165.237 849.143 1225.227 894.194 1288.352 941.5989999999999 1361.699 971.961 1440 982.008"
              fill="#ffffff"
            />
          </g>
          <defs>
            <mask id="SvgjsMask1000">
              <rect width="1440" height="560" fill="#ffffff" />
            </mask>
          </defs>
        </svg>
        <style>{`
          @media (max-width: 768px) {
            .svg-hero {
              object-size: cover;
            }
          }
        `}</style>
        <Navbar user={user?.user_metadata} />
        <PromptTool user={user} />
      </div>

      <DemoVideo />
      <Footer />
    </>
  );
}
