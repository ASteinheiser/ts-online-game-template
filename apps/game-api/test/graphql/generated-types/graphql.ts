/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Test_GetTotalPlayersQueryVariables = Exact<{ [key: string]: never; }>;


export type Test_GetTotalPlayersQuery = { totalPlayers: number | null };

export type Test_GetUserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type Test_GetUserProfileQuery = { profile: { userName: string } | null };


export const Test_GetTotalPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Test_GetTotalPlayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPlayers"}}]}}]} as unknown as DocumentNode<Test_GetTotalPlayersQuery, Test_GetTotalPlayersQueryVariables>;
export const Test_GetUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Test_GetUserProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}}]}}]} as unknown as DocumentNode<Test_GetUserProfileQuery, Test_GetUserProfileQueryVariables>;