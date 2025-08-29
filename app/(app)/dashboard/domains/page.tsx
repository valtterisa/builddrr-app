import { SiteHeader } from "@/components/site-header";
import DomainsListClient from "./DomainsListClient";

export default function DomainsPage() {
    return (
        <div className="md:px-4">
            <SiteHeader title="Domains" />
            <div className="pt-4">
                <DomainsListClient />
            </div>
        </div>
    );
}
