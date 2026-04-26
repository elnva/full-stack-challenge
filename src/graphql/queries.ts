import { gql } from '@apollo/client';

// gql is a helper that lets us write GraphQL inside a JavaScript/TypeScript file.
// It turns the text below into a GraphQL query document that Apollo can send to the server.
//
// A query is how the frontend asks for data.
// Here we ask for the list of employees.
export const EmployeesQuery = gql`
    query Employees {
        # This asks the GraphQL server for the employees field from the Query type.
        employees {
            # These are the fields we want for each employee.
            # They should match the schema and the data shape.
            id
            role
            name
            status
        }
    }
`;