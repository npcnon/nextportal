// components/dashboard/registration-button.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileEdit, AlertCircle, CheckCircle2, Loader, LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RegistrationStatus = 'required' | 'incomplete' | 'complete' | 'pending' | 'loading';
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusConfig {
  icon: LucideIcon;
  text: string;
  tooltip: string;
  badgeText: string;
  badgeVariant: BadgeVariant;
  badgeClassName?: string;
  indicator: boolean;
}

interface RegistrationButtonProps {
  status?: RegistrationStatus;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const statusConfig: Record<RegistrationStatus, StatusConfig> = {
  required: {
    icon: AlertCircle,
    text: "Student Registration Required",
    tooltip: "Required: Complete your student registration form",
    badgeText: "Required",
    badgeVariant: "destructive",
    indicator: true,
  },
  incomplete: {
    icon: FileEdit,
    text: "Continue Registration",
    tooltip: "Continue your incomplete registration",
    badgeText: "In Progress",
    badgeVariant: "secondary",
    badgeClassName: "bg-yellow-500 hover:bg-yellow-600 text-white",
    indicator: false,
  },
  complete: {
    icon: CheckCircle2,
    text: "Form Submission Completed",
    tooltip: "View your registration details",
    badgeText: "Complete",
    badgeVariant: "default",
    badgeClassName: "bg-green-500 hover:bg-green-600 text-white",
    indicator: false,
  },
  pending: {
    icon: FileEdit,
    text: "Registration Pending",
    tooltip: "Your registration is being processed",
    badgeText: "Pending",
    badgeVariant: "outline",
    indicator: false,
  },
  loading: {
    icon: Loader,
    text: "Registration Processing",
    tooltip: "Your registration is being processed",
    badgeText: "Loading",
    badgeVariant: "outline",
    indicator: false,
  },
};

export const RegistrationButton: React.FC<RegistrationButtonProps> = ({
  status = 'required',
  className,
  disabled,
  onClick,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Button
      size="lg"
      variant={status === 'required' ? "default" : "secondary"}
      className={cn(
        "relative inline-flex items-center gap-2 pr-4",
        "transition-all duration-200 ease-in-out",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 animate-spin" />
      <span className="font-medium">{config.text}</span>
      <Badge
        variant={config.badgeVariant}
        className={cn(
          "ml-2 h-5",
          config.badgeClassName
        )}
      >
        {config.badgeText}
      </Badge>
      {config.indicator && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </Button>
  );
};