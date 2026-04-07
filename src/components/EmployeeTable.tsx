import { useState, useMemo } from "react";
import employees from "../../data/employees.json";
import type { Employee } from "../types/Employee";

type SortKey = "id" | "name" | "role" | "status" | null;
type SortOrder = "asc" | "desc";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

const EmployeeTable = () => {
    const [sortKey, setSortKey] = useState<SortKey>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    const handleSort = (clickedColumn: Exclude<SortKey, null>) => {
        if (clickedColumn !== sortKey) {
            setSortKey(clickedColumn)
            setSortOrder("asc");
        } else {
            setSortOrder(prev => (prev == "asc" ? "desc" : "asc"))
        }
    }

    const handleFilter = (selectedFilter: StatusFilter) => {
        setStatusFilter(selectedFilter)
    }

    const compareHelper = (
        a: string | number,
        b: string | number,
        isAscending: boolean
    ): number => {
        if (typeof a === "string" && typeof b === "string") {
            return isAscending ? a.localeCompare(b) : b.localeCompare(a);
        }

        if (typeof a === "number" && typeof b === "number") {
            return isAscending ? a - b : b - a;
        }

        return 0; // fallback if mixed types
    };

    // GetEmployees became allEmployees variable, because
    // React recreates function object everytime it's rendered
    // We need to use memo to save the results of this function
    // depending on the variables visible at the useMemo function.
    const allEmployees = useMemo(() => {
        let displayedEmployees =
            sortKey === null ?
                [...employees] :
                [...employees].sort((a, b) => compareHelper(a[sortKey], b[sortKey], sortOrder == "asc"))

        if (statusFilter !== "ALL") {
            displayedEmployees = displayedEmployees.filter(a => a.status === statusFilter);
        }
        return (displayedEmployees as Employee[]).map((emp) => (
            <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.role}</td>
                <td>{emp.status}</td>
            </tr>
        ));
    }, [statusFilter, sortKey, sortOrder]);

    return (
        <>
            <label htmlFor="Status Fitler">Choose a status:</label>
            <select defaultValue={"ALL"} onChange={(e) => handleFilter(e.currentTarget.value as StatusFilter)}
                    id="statusFilter">
                <option value="ALL">ALL</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
            </select>
            <table>
                <thead>
                <tr>
                    <th id="id" onClick={() => handleSort("id")}>ID</th>
                    <th id="name" onClick={() => handleSort("name")}>name</th>
                    <th id="role" onClick={() => handleSort("role")}>role</th>
                    <th id="status" onClick={() => handleSort("status")}>status</th>
                </tr>
                </thead>
                <tbody>
                {allEmployees}
                </tbody>
            </table>
        </>
    );
}

export default EmployeeTable;