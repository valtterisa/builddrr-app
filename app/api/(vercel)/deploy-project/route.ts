// app/api/deploy-project/route.ts
import { Vercel } from '@vercel/sdk';
import { CreateProjectFramework } from '@vercel/sdk/models/createprojectop.js';
import { NextRequest, NextResponse } from 'next/server';

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN!,
});

interface CreateProjectRequest {
    projectName: string;
    gitRepo: string;
    gitOrg: string;
    framework?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateProjectRequest = await request.json();
        const { projectName, gitRepo, gitOrg, framework = 'nextjs' } = body;

        // Create project
        const project = await vercel.projects.createProject({
            requestBody: {
                name: projectName,
                framework: framework as CreateProjectFramework,
                gitRepository: {
                    repo: `${gitOrg}/${gitRepo}`,
                    type: 'github',
                },
            },
        });

        // Create deployment
        const deployment = await vercel.deployments.createDeployment({
            requestBody: {
                name: projectName,
                target: 'production',
                gitSource: {
                    type: 'github',
                    repo: gitRepo,
                    ref: 'main',
                    org: gitOrg,
                },
            },
        });

        return NextResponse.json({
            project: project.id,
            deployment: deployment.id,
            url: deployment.url,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}