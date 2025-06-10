import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const lobbies = await prisma.lobby.findMany();

  return NextResponse.json(lobbies);
}