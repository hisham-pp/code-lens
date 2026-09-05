export async function GET(request: Request) {
  return Response.json({ users: ['Alice', 'Bob'] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ created: body });
}
