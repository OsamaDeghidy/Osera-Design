
export default function ShippingPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold mb-8 text-primary">Delivery & Shipping Policy</h1>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
                <p className="text-sm italic">Last Updated: January 14, 2026</p>

                <h3 className="text-xl font-semibold text-foreground">1. Digital Delivery</h3>
                <p>
                    Osera Design is a purely digital service. We do not ship physical products.
                </p>

                <h3 className="text-xl font-semibold text-foreground">2. Delivery Time</h3>
                <p>
                    Upon successful payment, your account credits are delivered <strong>instantly</strong>.
                    You can immediately start generating designs.
                </p>

                <h3 className="text-xl font-semibold text-foreground">3. Failed Delivery</h3>
                <p>
                    In rare cases of system delays, if you do not receive your credits within 15 minutes of payment confirmation,
                    please contact us at <strong className="text-foreground">oserasoft@gmail.com</strong> for immediate assistance.
                </p>
            </div>
        </div>
    );
}
