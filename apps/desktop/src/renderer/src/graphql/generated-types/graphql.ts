/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type GameResult = {
  __typename?: 'GameResult';
  attackCount: Scalars['Int']['output'];
  killCount: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createProfile?: Maybe<Profile>;
  deleteProfile?: Maybe<Scalars['Boolean']['output']>;
  updateProfile?: Maybe<Profile>;
};


export type MutationCreateProfileArgs = {
  userName: Scalars['String']['input'];
};


export type MutationUpdateProfileArgs = {
  userName: Scalars['String']['input'];
};

export type Profile = {
  __typename?: 'Profile';
  userName: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  gameResults?: Maybe<Array<GameResult>>;
  healthCheck?: Maybe<Scalars['Boolean']['output']>;
  profile?: Maybe<Profile>;
  totalPlayers?: Maybe<Scalars['Int']['output']>;
  userExists?: Maybe<Scalars['Boolean']['output']>;
};


export type QueryGameResultsArgs = {
  roomId: Scalars['String']['input'];
};


export type QueryUserExistsArgs = {
  userName: Scalars['String']['input'];
};

export type Desktop_GetGameResultsQueryVariables = Exact<{
  roomId: Scalars['String']['input'];
}>;


export type Desktop_GetGameResultsQuery = { __typename?: 'Query', gameResults?: Array<{ __typename?: 'GameResult', username: string, attackCount: number, killCount: number }> | null };

export type Desktop_GetTotalPlayersQueryVariables = Exact<{ [key: string]: never; }>;


export type Desktop_GetTotalPlayersQuery = { __typename?: 'Query', totalPlayers?: number | null };


export const Desktop_GetGameResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Desktop_GetGameResults"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"attackCount"}},{"kind":"Field","name":{"kind":"Name","value":"killCount"}}]}}]}}]} as unknown as DocumentNode<Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables>;
export const Desktop_GetTotalPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Desktop_GetTotalPlayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPlayers"}}]}}]} as unknown as DocumentNode<Desktop_GetTotalPlayersQuery, Desktop_GetTotalPlayersQueryVariables>;