export async function POST(request: Request) {
  const { appName, machineId } = await request.json();

  const response = await fetch(
    `${process.env.FLY_API_URL}/apps/${appName}/machines/${machineId}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
      },
    }
    
  );

  const machine = await response.json();

  return Response.json({
    machine,
  });
}
