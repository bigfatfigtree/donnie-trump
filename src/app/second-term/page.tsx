import { redirect } from "next/navigation";
export default function SecondTermPage() {
  redirect("/archive?term=second");
}
