"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface FeedbackDialogProps {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function FeedbackDialog({ projectId, open, onOpenChange }: FeedbackDialogProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating star first")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, rating, comment })
            })

            if (res.ok) {
                toast.success("Thank you for your feedback!")
                onOpenChange(false)
            } else {
                toast.error("Failed to submit feedback.")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>How was the AI generation?</DialogTitle>
                    <DialogDescription>
                        Your feedback helps us train our models and improve the design quality.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                <Star
                                    size={32}
                                    className={(hoveredRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-30"}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-full">
                        <Textarea
                            placeholder="Any specific comments on the generated UI? (Optional)"
                            className="resize-none"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Skip
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
