// app/api/project-domains/route.ts
import { Vercel } from '@vercel/sdk';
import { RedirectStatusCode } from '@vercel/sdk/models/updateprojectdomainop.js';
import { NextRequest, NextResponse } from 'next/server';

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN!,
});

interface DomainRequest {
    projectId: string;
    domain: string;
    redirect?: string;
    redirectStatusCode?: number;
    gitBranch?: string;
}

// Get all domains for a project
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const domain = searchParams.get('domain');

        if (!projectId) {
            return NextResponse.json(
                { error: 'projectId is required' },
                { status: 400 }
            );
        }

        if (domain) {
            // Get specific domain
            const result = await vercel.projects.getProjectDomain({
                idOrName: projectId,
                domain,
            });

            return NextResponse.json({
                domain: result.name,
                verified: result.verified,
                redirect: result.redirect,
                redirectStatusCode: result.redirectStatusCode,
                gitBranch: result.gitBranch,
            });
        } else {
            // Get all domains for project
            const result = await vercel.projects.getProjectDomains({
                idOrName: projectId,
            });

            return NextResponse.json({
                domains: result.domains.map(d => ({
                    name: d.name,
                    verified: d.verified,
                    redirect: d.redirect,
                    redirectStatusCode: d.redirectStatusCode,
                    gitBranch: d.gitBranch,
                })),
            });
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get domains' },
            { status: 500 }
        );
    }
}

// Add domain to project
export async function POST(request: NextRequest) {
    try {
        const { projectId, domain, redirect, redirectStatusCode }: DomainRequest = await request.json();

        const result = await vercel.projects.addProjectDomain({
            idOrName: projectId,
            requestBody: {
                name: domain,
                redirect,
                redirectStatusCode: redirectStatusCode === undefined ? undefined : (redirectStatusCode as RedirectStatusCode),
            },
        });

        return NextResponse.json({
            success: true,
            domain: result.name,
            verified: result.verified,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add domain' },
            { status: 500 }
        );
    }
}

// Update domain configuration
export async function PATCH(request: NextRequest) {
    try {
        const { projectId, domain, redirect, redirectStatusCode, gitBranch }: DomainRequest = await request.json();

        const result = await vercel.projects.updateProjectDomain({
            idOrName: projectId,
            domain,
            requestBody: {
                redirect,
                redirectStatusCode: redirectStatusCode === undefined ? undefined : (redirectStatusCode as RedirectStatusCode),
                gitBranch,
            },
        });

        return NextResponse.json({
            success: true,
            domain: result.name,
            updated: true,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update domain' },
            { status: 500 }
        );
    }
}

// Remove domain from project
export async function DELETE(request: NextRequest) {
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

        await vercel.projects.removeProjectDomain({
            idOrName: projectId,
            domain,
        });

        return NextResponse.json({
            success: true,
            message: `Domain ${domain} removed from project`,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to remove domain' },
            { status: 500 }
        );
    }
}