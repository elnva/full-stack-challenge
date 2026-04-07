export type Employee = {
    id: number;
    name: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}