import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  name,
  label,
  placeholder,
  defaultValue,
  onChange,
}) => {
  const { register, formState: { errors }, watch } = useFormContext();
  const fieldValue = watch(name);

  const getNestedError = (path: string) => {
    return path.split('.').reduce((acc: any, curr: string) => {
      return acc?.[curr];
    }, errors);
  };

  const error = getNestedError(name);
  const registerProps = register(name, {
    onChange,
    valueAsNumber: true, // Treat the input value as a number
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <FormLabel className="text-sm font-medium" htmlFor={name}>{label}</FormLabel>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="inline-flex">
                <AlertCircle
                  className={`h-4 w-4 cursor-help ${
                    fieldValue !== undefined ? "text-green-500" : "text-red-500"
                  }`}
                  aria-label="This field is required"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">This field is required</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id={name}
        {...registerProps}
        type="number"
        defaultValue={defaultValue}
        className={`${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "focus:border-primary focus:ring-primary"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <span className="text-sm text-red-500">{error.message}</span>
      )}
    </div>
  );
};