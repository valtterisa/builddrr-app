export async function GET(request: Request) {
  const { appName, machineId } = await request.json();

  const response = await fetch(
    `${process.env.FLY_API_URL}/apps/${appName}/machines/${machineId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
      },
    }
  );

  const machine = await response.json();

  if (!machine) {
    return Response.json(
      {
        error: "Machine not found",
      },
      { status: 404 }
    );
  }

  return Response.json({
    machine,
  });
}
