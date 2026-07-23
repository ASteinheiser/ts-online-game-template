/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Web_GetTotalPlayersQueryVariables = Exact<{ [key: string]: never; }>;


export type Web_GetTotalPlayersQuery = { totalPlayers: number | null };


export const Web_GetTotalPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Web_GetTotalPlayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPlayers"}}]}}]} as unknown as DocumentNode<Web_GetTotalPlayersQuery, Web_GetTotalPlayersQueryVariables>;