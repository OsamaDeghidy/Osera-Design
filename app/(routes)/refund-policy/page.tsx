
export default function RefundPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold mb-8 text-primary">Refund & Cancellation Policy</h1>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
                <p className="text-sm italic">Last Updated: January 14, 2026</p>

                <h3 className="text-xl font-semibold text-foreground">1. Digital Goods Policy</h3>
                <p>
                    Osera Design provides digital credits for AI generation services. Due to the nature of digital goods,
                    services are generally non-refundable once the credits have been used or "consumed" to generate designs.
                </p>

                <h3 className="text-xl font-semibold text-foreground">2. Refund Eligibility</h3>
                <p>
                    We offer refunds under the following conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You have purchased credits but have <strong>not used any of them</strong> within 7 days of purchase.</li>
                    <li>Duplicate charges due to a system error.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">3. Cancellation</h3>
                <p>
                    Since our service functions on a "Pay-As-You-Go" or credit pack basis, there are no recurring subscriptions to cancel.
                    You will not be charged unless you actively purchase a new credit pack.
                </p>

                <h3 className="text-xl font-semibold text-foreground">4. How to Request a Refund</h3>
                <p>
                    To request a refund, please contact us at <strong className="text-foreground">oserasoft@gmail.com</strong> with your
                    order ID and reason for the request. We typically process requests within 3-5 business days.
                </p>
            </div>
        </div>
    );
}
