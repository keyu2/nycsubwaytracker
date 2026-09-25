import { notFound, redirect } from "next/navigation";
import { RAILROAD_ENABLED } from "../lib/features";

export default function Railroads() {
  if (!RAILROAD_ENABLED) notFound();
  redirect("/railroad/lirr");
}
