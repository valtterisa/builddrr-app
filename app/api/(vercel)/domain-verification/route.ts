import { Vercel } from '@vercel/sdk';
import { NextRequest, NextResponse } from 'next/server';

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN!,
});

// Vercel's IP addresses for A/AAAA records
const VERCEL_IPS = {
    A: ['76.76.19.19', '76.223.126.88'],
    AAAA: ['2600:1f18:147f:e850::2', '2600:1f18:147f:e851::2']
};

interface VerificationRequest {
    projectId: string;
    domain: string;
}

function isApexDomain(domain: string): boolean {
    return !domain.includes('.') || domain.split('.').length === 2;
}

// Get DNS verification requirements for external domain
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const domain = searchParams.get('domain');

        if (!projectId || !domain) {
            return NextResponse.json(
                { error: 'projectId and domain are required' },
                { status: 400 }
            );
        }

        const domainInfo = await vercel.projects.getProjectDomain({
            idOrName: projectId,
            domain,
        });

        const domainConfig = await vercel.domains.getDomainConfig({
            domain,
        });

        const isApex = isApexDomain(domain);

        const requiredRecords = [];

        if (isApex) {
            // Apex domain needs A and AAAA records
            VERCEL_IPS.A.forEach(ip => {
                requiredRecords.push({
                    type: 'A',
                    name: '@',
                    value: ip,
                    ttl: 3600
                });
            });

            VERCEL_IPS.AAAA.forEach(ip => {
                requiredRecords.push({
                    type: 'AAAA',
                    name: '@',
                    value: ip,
                    ttl: 3600
                });
            });
        } else {
            // Subdomain uses CNAME
            requiredRecords.push({
                type: 'CNAME',
                name: domain.split('.')[0],
                value: 'cname.vercel-dns.com',
                ttl: 3600
            });
        }

        // Add TXT record for verification if needed
        if (domainInfo.verification) {
            requiredRecords.push({
                type: 'TXT',
                name: '_vercel',
                value: domainInfo.verification.value,
                ttl: 3600
            });
        }

        return NextResponse.json({
            domain: domainInfo.name,
            verified: domainInfo.verified,
            isApexDomain: isApex,
            verification: domainInfo.verification,
            dnsRecords: {
                required: requiredRecords,
                current: domainConfig.configuredBy === 'VERCEL' ? 'Managed by Vercel' : 'External DNS',
                instructions: isApex
                    ? 'Add A and AAAA records for apex domain'
                    : 'Add CNAME record for subdomain'
            },
            misconfigured: domainConfig.misconfigured,
            acceptedChallenges: domainConfig.acceptedChallenges
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get verification info' },
            { status: 500 }
        );
    }
}

// Verify domain after DNS setup
export async function POST(request: NextRequest) {
    try {
        const { projectId, domain }: VerificationRequest = await request.json();

        const result = await vercel.projects.verifyProjectDomain({
            idOrName: projectId,
            domain,
        });

        return NextResponse.json({
            success: true,
            domain,
            verified: result.verified,
            message: result.verified ? 'Domain verified successfully' : 'Domain verification pending'
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to verify domain' },
            { status: 500 }
        );
    }
}