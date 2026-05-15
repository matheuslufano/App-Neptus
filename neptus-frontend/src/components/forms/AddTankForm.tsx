import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { AddTankSchema, addTankSchema } from "@/schemas/addTank-schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AddTankFormProps {
  onSubmit: (data: AddTankSchema) => void;
  id?: string;
  initialValues?: Partial<AddTankSchema>;
}

const AddTankForm = ({ onSubmit, id, initialValues }: AddTankFormProps) => {
  const form = useForm<AddTankSchema>({
    resolver: zodResolver(addTankSchema),
    defaultValues: {
      name: initialValues?.name || "",
      type: initialValues?.type || "",
      fish: initialValues?.fish || "",
      fishCount: initialValues?.fishCount || undefined,
      averageWeight: initialValues?.averageWeight || undefined,
      tankArea: initialValues?.tankArea || undefined,
    },
  });

  const { handleSubmit, reset, control } = form;

  const handleFormSubmit = (data: AddTankSchema) => {
    onSubmit(data);
    if (!initialValues) {
      reset();
    }
  };

  return (
    <Form {...form}>
      <form
        id={id}
        className="space-y-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do tanque</FormLabel>
              <FormControl>
                <Input placeholder="Tanque de Tilápia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Tanque de peixe</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      fieldState.error &&
                        "border-error focus:border-error focus:ring-error"
                    )}
                  >
                    <SelectValue placeholder="Selecione o tipo de tanque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevado">Elevado</SelectItem>
                    <SelectItem value="barramento">Barramento</SelectItem>
                    <SelectItem value="escavado">Escavado</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fish"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da espécie</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Tilápia, Tambaqui, Carpa..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="fishCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de peixes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="150"
                    step="1"
                    autoComplete="off"
                    inputMode="numeric"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseInt(value);
                        field.onChange(isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="averageWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso médio (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.8"
                    step="0.1"
                    autoComplete="off"
                    inputMode="decimal"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseFloat(value);
                        field.onChange(isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="tankArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área do tanque (m²)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="25.0"
                  step="0.1"
                  autoComplete="off"
                  inputMode="decimal"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      field.onChange(undefined);
                    } else {
                      const numValue = parseFloat(value);
                      field.onChange(isNaN(numValue) ? undefined : numValue);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default AddTankForm;
