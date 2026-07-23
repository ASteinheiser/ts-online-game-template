/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Desktop_GetGameResultsQueryVariables = Exact<{
  roomId: string;
}>;


export type Desktop_GetGameResultsQuery = { gameResults: Array<{ username: string, attackCount: number, killCount: number }> | null };

export type Desktop_GetTotalPlayersQueryVariables = Exact<{ [key: string]: never; }>;


export type Desktop_GetTotalPlayersQuery = { totalPlayers: number | null };


export const Desktop_GetGameResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Desktop_GetGameResults"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"attackCount"}},{"kind":"Field","name":{"kind":"Name","value":"killCount"}}]}}]}}]} as unknown as DocumentNode<Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables>;
export const Desktop_GetTotalPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Desktop_GetTotalPlayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPlayers"}}]}}]} as unknown as DocumentNode<Desktop_GetTotalPlayersQuery, Desktop_GetTotalPlayersQueryVariables>;