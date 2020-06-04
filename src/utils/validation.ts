export interface Validatable {
    name: string,
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number
}

export type ValidationOutput = {
    isValid: boolean,
    message?: string
}

export function validate(input: Validatable): ValidationOutput {

    if (input.required) {
        if (input.value.toString().trim().length === 0) {
            return {
                isValid: false,
                message: `${input.name} is required but does not have a value.`
            }
        }
    }

    if (input.minLength != null && typeof input.value === 'string') {
        if (input.value.length < input.minLength) {
            return {
                isValid: false,
                message: `${input.name}'s length is less than its minimum length of ${input.minLength}.`
            }
        }
    }

    if (input.maxLength != null && typeof input.value === 'string') {
        if (input.value.length > input.maxLength) {
            return {
                isValid: false,
                message: `${input.name}'s length is more than its maximum length of ${input.maxLength}.`
            }
        }
    }

    if (input.minValue != null && typeof input.value === 'number') {
        if (input.value < input.minValue) {
            return {
                isValid: false,
                message: `${input.name}'s value is less than its minimum value of ${input.minValue}.`
            }
        }
    }

    if (input.maxValue != null && typeof input.value === 'number') {
        if (input.value > input.maxValue) {
            return {
                isValid: false,
                message: `${input.name}'s value is more than its maximum value of ${input.maxValue}.`
            }
        }
    }

    return { isValid: true }
}
