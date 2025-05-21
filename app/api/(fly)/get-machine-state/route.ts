export async function POST(request: Request) {
  const { appName, machineId } = await request.json();

  console.log(
    "Getting machine state for app: ",
    appName,
    " and machine: ",
    machineId
  );
  const response = await fetch(
    `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/wait?state=started`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
      },
    }
  );

  const machine = await response.json();

  console.log("Machine state: ", machine.machine);

  if (!machine) {
    return Response.json(
      {
        error: "Machine not found",
      },
      { status: 404 }
    );
  }

  console.log("Machine state: ", machine);

  return Response.json({
    machine,
  });
}
