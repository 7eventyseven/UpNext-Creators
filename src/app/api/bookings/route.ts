import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapBooking } from "@/lib/mappers";
import type { Booking } from "@/types";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings.map(mapBooking));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Booking;

  const created = await prisma.booking.create({
    data: {
      id: body.id,
      creatorId: body.creatorId,
      creatorName: body.creatorName,
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      price: body.price,
      date: body.date,
      time: body.time,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      notes: body.notes ?? "",
      status: body.status ?? "pending",
    },
  });

  return NextResponse.json(mapBooking(created), { status: 201 });
}
