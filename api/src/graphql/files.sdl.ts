export const schema = gql`
  type File {
    id: String!
    name: String!
    url: String!
    type: String!
    version: Int!
  }

  type Query {
    files: [File!]! @requireAuth
    file(id: String!): File @requireAuth
  }

  input CreateFileInput {
    name: String!
    url: String!
    type: String!
    version: Int!
  }

  input UpdateFileInput {
    name: String
    url: String
    type: String
    version: Int
  }

  type Mutation {
    createFile(input: CreateFileInput!): File! @requireAuth
    updateFile(id: String!, input: UpdateFileInput!): File! @requireAuth
    deleteFile(id: String!): File! @requireAuth
    searchFiles(query: String!): [File!]! @requireAuth
  }
`
