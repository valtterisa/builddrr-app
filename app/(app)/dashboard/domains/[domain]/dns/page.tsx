import { SiteHeader } from "@/components/site-header";
import DNSSettingsClient from "./DNSSettingsClient";

interface DNSSettingsPageProps {
    params: {
        domain: string;
    };
}

export default function DNSSettingsPage({ params }: DNSSettingsPageProps) {
    const domainName = decodeURIComponent(params.domain);

    return (
        <div className="px-4 md:px-6">
            <SiteHeader
                title={`DNS Settings - ${domainName}`}
                showBackButton={true}
                backUrl="/dashboard/domains"
            />
            <div className="pt-4">
                <DNSSettingsClient domain={domainName} />
            </div>
        </div>
    );
}
