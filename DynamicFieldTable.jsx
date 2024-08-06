// DynamicFieldTable.jsx
import React, { useMemo, useEffect } from "react";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HiTrash } from "react-icons/hi";
import CustomButton from "../customButton";
import useCustomButton from "../customButton/useCustomButton";

export const DynamicFieldTable = ({
  columns,
  control,
  name,
  label,
  addRowText,
  onAddRow,
  errors,
}) => {
  const { customButtonVariants } = useCustomButton();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });

  const watchedFields = useWatch({
    control,
    name: name,
  });

  const disabledStates = useMemo(() => {
    return fields.map((field, index) => {
      const rowValues =
        watchedFields && watchedFields.length != 0 ? watchedFields[index] : {};
      return columns.reduce((acc, column) => {
        if (column.disabled) {
          acc[column.field] = column.disabled(rowValues);
        }
        return acc;
      }, {});
    });
  }, [fields, watchedFields, columns]);

  useEffect(() => {
    fields.forEach((field, index) => {
      const updatedField = { ...field };
      let hasChanges = false;

      columns.forEach((column) => {
        if (disabledStates[index]?.[column.field]) {
          if (!updatedField[column.field]) {
            updatedField[column.field] = null;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        update(index, updatedField);
      }
    });
  }, [disabledStates, fields, columns, update]);

  const renderHeaderCell = (column) => {
    const isRequired = column.rules && column.rules.required;
    return (
      <>
        {column.header}
        {isRequired && <span className="text-red-500 mr-1">*</span>}
      </>
    );
  };

  const renderCell = (column, field, index) => {
    const isDisabled = disabledStates[index]?.[column.field] || false;

    switch (column.type) {
      case "select":
        return (
          <Controller
            name={`${name}.${index}.${column.field}`}
            control={control}
            rules={column.rules}
            render={({ field: selectField }) => (
              <Select
                onValueChange={(value) => {
                  selectField.onChange(column.field === "required" ? value === "true" : value);
                }}
                value={
                  isDisabled
                    ? ""
                    : column.field === "required"
                    ? selectField.value?.toString()
                    : selectField.value
                }
                disabled={isDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${column.field}`} />
                </SelectTrigger>
                <SelectContent>
                  {column.options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case "action":
        return (
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="destructive"
            size="icon"
            className="w-8 h-8 flex items-center justify-center"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        );
      default:
        return (
          <Controller
            name={`${name}.${index}.${column.field}`}
            control={control}
            rules={column.rules}
            render={({ field: inputField }) => (
              <Input
                {...inputField}
                value={isDisabled ? "" : inputField.value}
                placeholder={`Enter ${column.field.toLowerCase()}`}
                disabled={isDisabled}
                className={`w-full ${
                  errors[name]?.[index]?.[column.field] ? "border-red-500" : ""
                }`}
              />
            )}
          />
        );
    }
  };

  const renderErrors = () => {
    if (!errors[name]) return null;

    const allErrors = fields
      .flatMap((field, rowIndex) =>
        columns.map((column) => {
          const error = errors[name]?.[rowIndex]?.[column.field];
          if (error) {
            return `Parameter ${rowIndex + 1} : ${
              error.message || "This field is required"
            }`;
          }
          return null;
        })
      )
      .filter(Boolean);

    if (allErrors.length === 0) return null;

    return (
      <TableFooter>
        <TableRow>
          <TableCell colSpan={columns.length} className="text-red-500">
            {allErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </TableCell>
        </TableRow>
      </TableFooter>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <label className="text-muted-foreground text-base font-bold cursor-pointer">
          {label}
        </label>
        <CustomButton
          type="button"
          onClick={() => onAddRow(append)}
          variant={customButtonVariants.PRIMARY}
          className="w-fit text-sm font-normal py-2 rounded-md px-4"
        >
          {addRowText}
        </CustomButton>
      </div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary-grey/[0.035]">
            <TableRow className="flex">
              {columns.map((column) => (
                <TableHead
                  key={column.field}
                  className={`flex items-center ${
                    column.field === "action"
                      ? "w-[60px] justify-center"
                      : "flex-1"
                  }`}
                >
                  {renderHeaderCell(column)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {fields.map((field, index) => (
              <TableRow key={field.id} className="flex py-2">
                {columns.map((column) => (
                  <TableCell
                    key={`${field.id}-${column.field}`}
                    className={`flex items-center ${
                      column.field === "action"
                        ? "w-[60px] justify-center"
                        : "flex-1"
                    }`}
                  >
                    {renderCell(column, field, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <tfoot className="p-4">{renderErrors()}</tfoot>
      </div>
    </div>
  );
};

export default DynamicFieldTable;
