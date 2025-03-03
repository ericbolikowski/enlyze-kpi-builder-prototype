import { NextRequest, NextResponse } from "next/server";
import { generateMachineData } from "@/lib/dataGenerator";
import { getMachineById } from "@/lib/machines";

export async function GET(request: NextRequest) {
  try {
    const machineId = request.nextUrl.pathname.split("/")[4];
    const machine = getMachineById(machineId);

    if (!machine) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get("count") || "100", 10);

    const data = generateMachineData(machineId, count);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating machine data:", error);
    return NextResponse.json(
      { error: "Failed to generate machine data" },
      { status: 500 }
    );
  }
}
