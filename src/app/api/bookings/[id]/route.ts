import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapBooking } from "@/lib/mappers";
import type { Booking } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { status?: Booking["status"] };

  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(mapBooking(updated));
  } catch {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
}
