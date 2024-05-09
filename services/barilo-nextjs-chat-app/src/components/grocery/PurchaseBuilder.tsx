"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  DollarSign,
  MapPin,
  SearchIcon,
  User,
} from "lucide-react";

const formSchema = z.object({
  family_members: z.object({
    adults: z.number().int().positive(),
    children: z.number().int().positive(),
  }),
  budget: z.number().int().positive(),
  address: z.string().nonempty(),
});

export const PurchaseBuilderForm = () => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      family_members: {
        adults: 0,
        children: 0,
      },
      address: "",
      budget: 0,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="p-4 rounded-md shadow-sm border mt-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4 justify-center items-center"
        >
          <div className="flex items-center space-x-4">
            <DropdownMenuMembers />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center border p-1 rounded-md px-2">
                      <DollarSign className="w-4 mr-2 text-gray-500" />
                      <Input
                        className="border-none focus-visible:ring-0 h-8 focus:ring-0"
                        placeholder="Orçamento"
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center border p-1 rounded-md px-2">
                      <MapPin className="w-4 mr-2 text-gray-500" />
                      <Input
                        className="border-none focus-visible:ring-0 h-8 focus:ring-0"
                        placeholder="Seu endereço"
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>{" "}
          <div className="text-center">
            <Button type="submit">
              <SearchIcon className="w-4 mr-2" /> Pesquisar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function DropdownMenuMembers() {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className="flex items-center">
            <User className="w-4 mr-2 text-gray-500" />
            <span>1</span>
            <ChevronDown className="w-4 ml-2" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          disabled
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
