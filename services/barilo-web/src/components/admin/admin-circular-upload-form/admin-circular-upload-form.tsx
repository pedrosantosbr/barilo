"use client";

import * as React from "react";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { TrashIcon, UploadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Título deve ter ao menos 2 caracteres.",
  }),
  expirationDate: z.date(),
});

export function UploadCircularForm() {
  // 1. Define your form.
  const [file, setFile] = React.useState<File>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    if (!file) {
      throw new Error("File is required.");
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("expiration_date", values.expirationDate.toISOString());
    formData.append("csv", file as Blob);

    console.log(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                Nome do encarte que será exibido no site.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Validade</FormLabel>
              <FormControl>
                <DatePicker date={field.value} setDate={field.onChange} />
              </FormControl>
              <FormDescription>Data de expiração do encarte.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem className="flex flex-col">
          <FormLabel>Arquivo</FormLabel>
          {!!file && (
            <div className="flex items-center font-medium">
              {file.name}{" "}
              <Button variant={"link"}>
                <TrashIcon />
                remove
              </Button>
            </div>
          )}
          <Uploader className={cn(!!file && "hidden")} {...{ file, setFile }} />
          <FormDescription>Data de expiração do encarte.</FormDescription>

          <FormMessage />
        </FormItem>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

type DatePickerProps = {
  date: Date;
  setDate: () => void;
};

export function DatePicker({ date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const Uploader: React.FC<{
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  className?: string;
}> = ({ file, setFile, className }) => {
  const [onDragEnterClass, setOnDragEnterClass] = React.useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      Array.from(event.dataTransfer.files).forEach((file) => setFile(file));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div
      className={cn(
        "p-8 border border-dashed rounded-lg flex flex-col justify-center items-center",
        className,
        onDragEnterClass
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={() => setOnDragEnterClass("bg-blue-50")}
      onDragLeave={() => setOnDragEnterClass("")}
    >
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }} // Hide the original file input
      />
      <UploadIcon fontSize={24} className="mb-4" />
      Arraste e solte arquivos aqui ou{" "}
      <Button className="mt-4">Selectionar arquivo</Button>
    </div>
  );
};

export default Uploader;
