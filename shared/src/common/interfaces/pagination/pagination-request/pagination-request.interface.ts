interface IPaginationRequest extends Record<string, unknown> {
  offset: number;
  limit: number;
}

export type { IPaginationRequest };
