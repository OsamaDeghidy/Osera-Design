
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold mb-8 text-primary">Contact Us</h1>
            <p className="text-lg text-muted-foreground mb-12">
                Have questions or need support? We're here to help. Reach out to us through any of the channels below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6 bg-muted/40 rounded-xl text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Mail size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Email Us</h3>
                    <p className="text-sm text-muted-foreground">oserasoft@gmail.com</p>
                </div>

                <div className="flex flex-col items-center p-6 bg-muted/40 rounded-xl text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <MapPin size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Visit Us</h3>
                    <p className="text-sm text-muted-foreground">Cairo, Egypt</p>
                </div>

                <div className="flex flex-col items-center p-6 bg-muted/40 rounded-xl text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Phone size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-sm text-muted-foreground">+20 106 690 6132</p>
                </div>
            </div>
        </div>
    );
}
