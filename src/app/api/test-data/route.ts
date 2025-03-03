import { NextResponse } from "next/server";
import { generateMachineData } from "@/lib/dataGenerator";
import { getMachineById } from "@/lib/machines";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get("machineId");
    const rowCountParam = searchParams.get("rowCount");
    const rowCount = rowCountParam ? parseInt(rowCountParam, 10) : 100;

    if (!machineId) {
      return NextResponse.json(
        { error: "Missing machineId parameter" },
        { status: 400 }
      );
    }

    const machine = getMachineById(machineId);
    if (!machine) {
      return NextResponse.json(
        { error: `Machine with ID ${machineId} not found` },
        { status: 404 }
      );
    }

    const data = generateMachineData(machineId, rowCount);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating test data:", error);
    return NextResponse.json(
      { error: "Failed to generate test data" },
      { status: 500 }
    );
  }
}
