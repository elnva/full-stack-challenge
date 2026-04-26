export type Employee = {
    id: string;
    name: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}