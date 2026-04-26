import { createContext, useContext, useId } from 'react'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'
import { Label } from './label'
import { cn } from '../../lib/utils'

const FormFieldContext = createContext(null)
const FormItemContext = createContext(null)

export function Form({ ...props }) {
  return <FormProvider {...props} />
}

export function FormField({ name, children }) {
  const { control } = useFormContext()

  return (
    <FormFieldContext.Provider value={{ name }}>
      {typeof children === 'function' ? (
        <Controller name={name} control={control} render={children} />
      ) : (
        children
      )}
    </FormFieldContext.Provider>
  )
}

export function FormItem({ className, ...props }) {
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({ className, ...props }) {
  const field = useContext(FormFieldContext)
  const item = useContext(FormItemContext)

  return <Label htmlFor={item?.id || field?.name} className={className} {...props} />
}

export function FormControl({ children }) {
  const field = useContext(FormFieldContext)
  const item = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = field ? getFieldState(field.name, formState) : null

  return typeof children === 'function'
    ? children({
        id: item?.id || field?.name,
        name: field?.name,
        'aria-invalid': !!fieldState?.error,
      })
    : children
}

export function FormDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted', className)} {...props} />
}

export function FormMessage({ className, children, ...props }) {
  const field = useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = field ? getFieldState(field.name, formState) : null
  const message = children || fieldState?.error?.message

  if (!message) return null

  return (
    <p className={cn('text-sm text-red-700', className)} {...props}>
      {message}
    </p>
  )
}
