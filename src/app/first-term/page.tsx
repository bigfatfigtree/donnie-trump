import { redirect } from "next/navigation";
export default function FirstTermPage() {
  redirect("/archive?term=first");
}
