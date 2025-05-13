import { NextRequest, NextResponse } from "next/server";

const GITLAB_API_URL = "https://gitlab.com/api/v4";
const PROJECT_ID = process.env.GITLAB_PROJECT_ID; // e.g., '123456'
const TRIGGER_TOKEN = process.env.GITLAB_TRIGGER_TOKEN; // Your GitLab trigger token
const REF = "main"; // Branch to trigger the pipeline on
const JOB_NAME = "build_and_push"; // Name of the job that generates the artifact (update as needed)

export async function POST(req: NextRequest) {
  try {
    // Step 1: Trigger the pipeline
    const triggerResponse = await fetch(
      `${GITLAB_API_URL}/projects/${PROJECT_ID}/trigger/pipeline`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: TRIGGER_TOKEN,
          ref: REF,
        }),
      }
    );

    if (!triggerResponse.ok) {
      const errorData = await triggerResponse.json();
      return NextResponse.json(
        { message: errorData.message },
        { status: triggerResponse.status }
      );
    }

    const triggerData = await triggerResponse.json();
    const pipelineId = triggerData.id;

    // Step 2: Poll the pipeline status
    let pipelineStatus = "";
    const maxAttempts = 40; // up to ~200s
    let attempts = 0;
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(
        `${GITLAB_API_URL}/projects/${PROJECT_ID}/pipelines/${pipelineId}`,
        {
          headers: { "PRIVATE-TOKEN": TRIGGER_TOKEN },
        }
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        return NextResponse.json(
          { message: errorData.message },
          { status: statusResponse.status }
        );
      }

      const statusData = await statusResponse.json();
      pipelineStatus = statusData.status;

      if (pipelineStatus === "success") {
        break;
      } else if (pipelineStatus === "failed") {
        return NextResponse.json(
          { message: "Pipeline failed to complete successfully." },
          { status: 500 }
        );
      }

      // Wait for a short interval before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (pipelineStatus !== "success") {
      return NextResponse.json(
        { message: "Pipeline did not complete in expected time." },
        { status: 500 }
      );
    }

    // Step 3: Retrieve the artifact containing the image tag
    const artifactResponse = await fetch(
      `${GITLAB_API_URL}/projects/${PROJECT_ID}/jobs/artifacts/${REF}/raw/build.env?job=${JOB_NAME}`,
      {
        headers: { "PRIVATE-TOKEN": TRIGGER_TOKEN },
      }
    );

    if (!artifactResponse.ok) {
      const errorData = await artifactResponse.json();
      return NextResponse.json(
        { message: errorData.message },
        { status: artifactResponse.status }
      );
    }

    const artifactContent = await artifactResponse.text();
    const imageTagMatch = artifactContent.match(/IMAGE_TAG=(.*)/);

    if (!imageTagMatch) {
      return NextResponse.json(
        { message: "IMAGE_TAG not found in artifact." },
        { status: 500 }
      );
    }

    const imageTag = imageTagMatch[1].trim();

    return NextResponse.json({
      message: "Pipeline completed successfully.",
      imageTag,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}
