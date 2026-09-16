import { redirect } from "next/navigation";
import { isWhitelistEnabled } from "@/lib/flags";

export default function ListRedirect() {
  redirect(isWhitelistEnabled() ? "/status" : "/");
}
