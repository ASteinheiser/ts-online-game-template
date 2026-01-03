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

export type Web_GetTotalPlayersQueryVariables = Exact<{ [key: string]: never; }>;


export type Web_GetTotalPlayersQuery = { __typename?: 'Query', totalPlayers?: number | null };


export const Web_GetTotalPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Web_GetTotalPlayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPlayers"}}]}}]} as unknown as DocumentNode<Web_GetTotalPlayersQuery, Web_GetTotalPlayersQueryVariables>;