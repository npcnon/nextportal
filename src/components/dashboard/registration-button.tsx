import React from 'react';
import { Button } from "@/components/ui/button";
import { FileEdit, AlertCircle, CheckCircle2, Loader2, LucideIcon } from "lucide-react";
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
  buttonStyle: string;
  badgeStyle: string;
  iconStyle: string;
  indicator?: boolean;
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
    buttonStyle: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
    badgeStyle: "bg-white/20 text-white border-none",
    iconStyle: "text-white/90",
    indicator: true,
  },
  incomplete: {
    icon: FileEdit,
    text: "Continue Registration",
    tooltip: "Continue your incomplete registration",
    badgeText: "In Progress",
    badgeVariant: "secondary",
    buttonStyle: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl",
    badgeStyle: "bg-white/20 text-white border-none",
    iconStyle: "text-white/90",
  },
  complete: {
    icon: CheckCircle2,
    text: "Form Submission Completed",
    tooltip: "View your registration details",
    badgeText: "Complete",
    badgeVariant: "default",
    buttonStyle: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl",
    badgeStyle: "bg-white/20 text-white border-none",
    iconStyle: "text-white/90",
  },
  pending: {
    icon: FileEdit,
    text: "Registration Pending",
    tooltip: "Your registration is being processed",
    badgeText: "Pending",
    badgeVariant: "outline",
    buttonStyle: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    badgeStyle: "bg-white/20 text-white border-none",
    iconStyle: "text-white/90",
  },
  loading: {
    icon: Loader2,
    text: "Registration Processing",
    tooltip: "Your registration is being processed",
    badgeText: "Loading",
    badgeVariant: "outline",
    buttonStyle: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    badgeStyle: "bg-white/20 text-white border-none",
    iconStyle: "text-white/90",
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "relative inline-flex items-center gap-3 px-6 py-6",
              "transition-all duration-300 ease-in-out",
              "font-medium rounded-lg",
              config.buttonStyle,
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={disabled}
            onClick={onClick}
          >
            <Icon className={cn(
              "h-5 w-5",
              config.iconStyle,
              status === 'loading' && "animate-spin"
            )} />
            
            <span className="font-semibold tracking-wide">
              {config.text}
            </span>
            
            <Badge
              variant={config.badgeVariant}
              className={cn(
                "ml-2 px-3 py-1",
                "text-xs font-medium",
                "transition-all duration-300",
                config.badgeStyle
              )}
            >
              {config.badgeText}
            </Badge>

            {config.indicator && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RegistrationButton;