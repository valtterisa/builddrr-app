import { SiteHeader } from "@/components/site-header";
import DomainsClient from "./DomainsClient";

export default function DomainsPage() {
  return (
    <div className="px-4 md:px-6">
      <SiteHeader title="Domains" />
      <div className="pt-4">
        <DomainsClient />
      </div>
    </div>
  );
}
