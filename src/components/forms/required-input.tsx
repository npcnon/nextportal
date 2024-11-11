// components/ui/required-form-field.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Control, Controller, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RequiredFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | number; // Allow both string and number
  type: 'input' | 'textarea' | 'date' | 'select';
  control?: Control<any>;
  options?: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const RequiredFormField: React.FC<RequiredFormFieldProps> = ({
  name,
  label,
  placeholder,
  defaultValue,
  type,
  control,
  options,
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
  const registerProps = register(name, { onChange });

  const renderField = () => {
    switch(type) {
      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue?.toString()} // Convert to string
            render={({ field }) => (
              <Select
                value={field.value?.toString()} // Convert to string
                onValueChange={field.onChange}
              >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                  <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            id={name}
            {...registerProps}
            defaultValue={defaultValue}
            className={`${error ? 
              "border-red-500 focus:border-red-500 focus:ring-red-500" : 
              "focus:border-primary focus:ring-primary"}`}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={name}
            {...registerProps}
            defaultValue={defaultValue}
            className={`${error ? 
              "border-red-500 focus:border-red-500 focus:ring-red-500" : 
              "focus:border-primary focus:ring-primary"}`}
            placeholder={placeholder}
          />
        );
      default:
        return (
          <Input
            id={name}
            {...registerProps}
            defaultValue={defaultValue}
            className={`${error ? 
              "border-red-500 focus:border-red-500 focus:ring-red-500" : 
              "focus:border-primary focus:ring-primary"}`}
            placeholder={placeholder}
          />
        );
    }
  };

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
                    fieldValue ? "text-green-500" : "text-red-500"
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
      {renderField()}
      {error && (
        <span className="text-sm text-red-500">{error.message}</span>
      )}
    </div>
  );
};