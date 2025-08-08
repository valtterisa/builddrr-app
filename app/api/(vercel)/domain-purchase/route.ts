// app/api/domain-purchase/route.ts
import { Vercel } from '@vercel/sdk';
import { NextRequest, NextResponse } from 'next/server';

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN!,
});

interface PurchaseDomainRequest {
    domain: string;
    expectedPrice: number;
    projectId?: string;
}

// Check domain availability and price
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');

        if (!domain) {
            return NextResponse.json(
                { error: 'domain parameter is required' },
                { status: 400 }
            );
        }

        // Check availability
        const availability = await vercel.domains.checkDomain({
            domain,
        });

        // Check price
        const price = await vercel.domains.checkDomain({
            domain,
        });

        return NextResponse.json({
            domain,
            available: availability.available,
            price: price.price,
            period: price.period,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to check domain' },
            { status: 500 }
        );
    }
}

// Purchase domain
export async function POST(request: NextRequest) {
    try {
        const { domain, expectedPrice, projectId }: PurchaseDomainRequest = await request.json();

        const result = await vercel.domains.buyDomain({
            requestBody: {
                name: domain,
                expectedPrice,
            },
        });

        // Optionally add to project after purchase
        if (projectId) {
            await vercel.projects.addProjectDomain({
                idOrName: projectId,
                requestBody: {
                    name: domain,
                },
            });
        }

        return NextResponse.json({
            success: true,
            domain: result.domain.name,
            purchased: true,
            addedToProject: !!projectId,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to purchase domain' },
            { status: 500 }
        );
    }
}