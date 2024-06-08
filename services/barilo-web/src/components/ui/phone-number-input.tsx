import * as React from "react";

import { cn } from "@/lib/utils";

export interface PhoneNumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 8) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }

  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6, 11)}`;
};

const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(({ className, type, value, onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    if (onChange)
      onChange({ ...e, target: { ...e.target, value: formattedValue } });
  };

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
});
PhoneNumberInput.displayName = "PhoneNumberInput";

export { PhoneNumberInput };
