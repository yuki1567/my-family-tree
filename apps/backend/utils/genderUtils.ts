type Gender = 0 | 1 | 2

export function isValidGender(value: number): value is Gender {
  return value === 0 || value === 1 || value === 2
}

export function toGender(value: number): Gender {
  if (!isValidGender(value)) {
    throw new Error(
      `Invalid gender value: ${value}. Expected 0 (unknown), 1 (male), or 2 (female).`
    )
  }
  return value
}
