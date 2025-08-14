import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from '@vercel/sdk';

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN!,
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
    }

    try {
        const records = await vercel.dns.getRecords({ domain });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch DNS records' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { domain, name, type, value, ttl } = await request.json();

    try {
        const record = await vercel.dns.createRecord({
            domain,
            requestBody: { name: name, type: type, value: value, ttl: ttl }
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create DNS record' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const { recordId, name, value, ttl, type } = await request.json();

    try {
        const record = await vercel.dns.updateRecord({
            recordId,
            requestBody: { name: name, value: value, ttl: ttl, type: type }
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update DNS record' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const recordId = searchParams.get('recordId');

    if (!domain || !recordId) {
        return NextResponse.json({ error: 'Domain and recordId required' }, { status: 400 });
    }

    try {
        await vercel.dns.removeRecord({ domain, recordId });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete DNS record' }, { status: 500 });
    }
}