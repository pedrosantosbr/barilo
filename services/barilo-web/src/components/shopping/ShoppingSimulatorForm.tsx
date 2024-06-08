"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  Form,
  FormControl,
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
  Delete,
  DeleteIcon,
  DollarSign,
  MapPin,
  SearchIcon,
  User,
} from "lucide-react";
import React from "react";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  search: z.string().nonempty(),
});

export function ShoppingSimulatorForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "Leite",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-x-2 flex items-start w-full"
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex bg-white items-center border p-1 rounded-md px-2">
                    <SearchIcon className="w-4 mr-2 text-gray-500" />
                    <Input
                      className="border-none focus-visible:ring-offset-0 focus-visible:ring-0 h-8 focus:ring-0"
                      placeholder="Pesquise algum produto"
                      {...field}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {/*  */}
      <div className="border shadow-md p-4 rounded-md mt-0.5 bg-background">
        <ul className="text-sm space">
          <li className="hover:bg-gray-100 p-1 px-4 rounded-lg">
            Leite <strong>Longa Vida Integral</strong>
          </li>
          <li className="hover:bg-gray-50 p-1 px-4 rounded-lg">
            Leite <strong>Barra Mansa Desnatado</strong>
          </li>
        </ul>
      </div>
      {/* selected products */}
      <div className="flex flex-col p-4">
        <ul className="text-sm space-y-2">
          <li className="flex items-center">
            <div>
              <span className="font-bold">2x</span> Patinho moído{" "}
              <kbd className="price">Kg</kbd>
            </div>
            <div className="px-4 font-bold">❌</div>
          </li>
          <li className="flex items-center">
            <div>
              <span className="font-bold">2x</span> Leite longa vida integral{" "}
              <kbd className="price">1L</kbd>
            </div>
            <div className="px-4 font-bold">❌</div>
          </li>
          <li className="flex items-center">
            <div>
              <span className="font-bold">1x</span> Arroz Palmares{" "}
              <kbd className="price">5Kg</kbd>
            </div>
            <div className="px-4 font-bold">❌</div>
          </li>
          <li className="flex items-center">
            <div>
              <span className="font-bold">4x</span> Leite em pó Ninho 400g
              <kbd className="price">Lata</kbd>
            </div>
            <div className="px-4 font-bold">❌</div>
          </li>
          <li className="flex items-center">
            <div>
              <span className="font-bold">2kg</span> Linguiça de pernil
            </div>
            <div className="px-4 font-bold">❌</div>
          </li>
        </ul>
      </div>
    </div>
  );
}

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
