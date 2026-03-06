import { redirect } from "next/navigation";

export default function CheckoutPage() {
    // Redirect generic checkout page directly to the pricing page where all plans and checkout flows are located.
    // This satisfies payment gateway reviewers checking for a /checkout route.
    redirect("/pricing");
}
