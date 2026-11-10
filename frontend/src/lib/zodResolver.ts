import type { ZodType } from 'zod'
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'

export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = await schema.safeParseAsync(values)

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      }
    }

    const errors: FieldErrors<T> = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof T
      if (field && !errors[field]) {
        // @ts-expect-error react-hook-form error structure
        errors[field] = {
          type: issue.code,
          message: issue.message,
        }
      }
    }

    return {
      values: {} as Record<string, never>,
      errors,
    }
  }
}
