import { VariantProps } from "class-variance-authority";
import { HTMLAttributes, ButtonHTMLAttributes } from "react";

export interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    borderColor: string;
    index: number;
}

export interface AboutCard {
    title: string;
    description: string;
    icon: string;
    borderColor: string;
}

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

// Note: buttonVariants is imported from where it's defined
declare const buttonVariants: (props?: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; size?: "default" | "sm" | "lg" | "icon"; } & { class?: string; className?: string; }) => string; 