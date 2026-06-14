import { z } from "zod";

export const bluetoothCommandSchema = z.enum([
  "START_CAL",
  "CONFIRM",
  "GET_TURBIDEZ",
]);

export type BluetoothCommand = z.infer<typeof bluetoothCommandSchema>;

export const bluetoothCommands = {
  START_CAL: "START_CAL" as const,
  CONFIRM: "CONFIRM" as const,
  GET_TURBIDEZ: "GET_TURBIDEZ" as const,
};
