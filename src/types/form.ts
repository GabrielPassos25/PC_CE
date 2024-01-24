export interface IPerson {
  id: number;
  name: string;
}

export type FormInputs = {
  person: IPerson | null;
  phone: string;
  email: string;
};