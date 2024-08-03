// components/ReusableTable.jsx
import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { HiTrash } from 'react-icons/hi';

export const ReusableTable = ({
  columns,
  control,
  name,
  addRowText,
  onAddRow,
  errors,
  watch,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchFieldArray = watch(name);

  const controlledFields = fields.map((field, index) => ({
    ...field,
    ...watchFieldArray[index],
  }));

  const renderCell = (column, field, index) => {
    switch (column.type) {
      case 'select':
        return (
          <Controller
            name={`${name}.${index}.${column.field}`}
            control={control}
            render={({ field: selectField }) => (
              <Select
                onValueChange={selectField.onChange}
                value={selectField.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${column.field}`} />
                </SelectTrigger>
                <SelectContent>
                  {column.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case 'action':
        return (
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="destructive"
            size="icon"
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
            render={({ field }) => (
              <Input
                {...field}
                placeholder={`Enter ${column.field.toLowerCase()}`}
                disabled={column.disabled ? column.disabled(watchFieldArray[index]) : false}
                className={
                  errors[name]?.[index]?.[column.field]
                    ? 'border-red-500'
                    : ''
                }
              />
            )}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-baseline justify-between">
        <label className="text-muted-foreground text-base font-bold mb-2 cursor-pointer">
          {name}
        </label>
        <Button type="button" onClick={onAddRow}>
          {addRowText}
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-primary-grey/[0.035]">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.field}>{column.headerName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {controlledFields.map((field, index) => (
              <TableRow key={field.id}>
                {columns.map((column) => (
                  <TableCell key={`${field.id}-${column.field}`}>
                    {renderCell(column, field, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
