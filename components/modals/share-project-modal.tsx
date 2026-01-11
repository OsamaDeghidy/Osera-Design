"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Globe, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";

import { updateProjectVisibility } from "@/actions/update-visibility";

interface ShareProjectModalProps {
    projectId: string;
    projectName: string;
    trigger?: React.ReactNode;
    // We will add 'visibility' prop later when DB is ready
}

export function ShareProjectModal({
    projectId,
    projectName,
    trigger,
}: ShareProjectModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false); // Mock state for now
    const [isUnlisted, setIsUnlisted] = useState(false);

    const shareUrl = `${window.location.origin}/view/${projectId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    const handleVisibilityChange = async (checked: boolean) => {
        try {
            const newVisibility = checked ? "PUBLIC" : "PRIVATE";
            await updateProjectVisibility(projectId, newVisibility);
            setIsPublic(checked);
            // If turning public, we also inherently allow link sharing (or logic can differ)
            // For simplicity V1: Public = Public in Gallery AND Link accessible.
            // Private = Link NOT accessible? Or separate UNLISTED?

            // Let's stick to the UI logic:
            // Switch 1: Public Gallery (sets PUBLIC)
            // Switch 2: Shareable Link (sets UNLISTED if not Public)

            toast.success(checked ? "Project is now Public 🌍" : "Project is now Private 🔒");
        } catch (error) {
            toast.error("Failed to update visibility");
            setIsPublic(!checked); // Revert
        }
    };

    const handleUnlistedChange = async (checked: boolean) => {
        if (isPublic) return; // Cannot be unlisted if Public (Public > Unlisted)

        try {
            const newVisibility = checked ? "UNLISTED" : "PRIVATE";
            await updateProjectVisibility(projectId, newVisibility);
            setIsUnlisted(checked);
            toast.success(checked ? "Link sharing enabled 🔗" : "Link sharing disabled 🔒");
        } catch (error) {
            toast.error("Failed to update settings");
            setIsUnlisted(!checked);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="size-4" />
                        Share
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                    <DialogDescription>
                        Manage who can see your project <strong>{projectName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Option 1: Public Gallery */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="public-mode" className="flex items-center gap-2">
                                <Globe className="size-4 text-primary" />
                                Public Gallery
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                Visible to everyone in the Community Gallery.
                            </span>
                        </div>
                        <Switch
                            id="public-mode"
                            checked={isPublic}
                            onCheckedChange={handleVisibilityChange}
                        />
                    </div>

                    {/* Option 2: Unlisted Link */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="link-mode" className="flex items-center gap-2">
                                <Share2 className="size-4 text-blue-500" />
                                Shareable Link
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                Anyone with the link can view (Read Only).
                            </span>
                        </div>
                        <Switch
                            id="link-mode"
                            checked={isUnlisted || isPublic}
                            disabled={isPublic} // Implicitly true if public
                            onCheckedChange={handleUnlistedChange}
                        />
                    </div>

                    {/* Copy Link Section */}
                    {(isPublic || isUnlisted) && (
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    defaultValue={shareUrl}
                                    readOnly
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                            <Button size="sm" className="px-3" onClick={handleCopyLink}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {!isPublic && !isUnlisted && (
                    <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="size-3" />
                        This project is currently private (You only).
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
