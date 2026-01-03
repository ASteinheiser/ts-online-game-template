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

export type Auth_CreateProfileMutationVariables = Exact<{
  userName: Scalars['String']['input'];
}>;


export type Auth_CreateProfileMutation = { __typename?: 'Mutation', createProfile?: { __typename?: 'Profile', userName: string } | null };

export type Auth_UpdateUserNameMutationVariables = Exact<{
  userName: Scalars['String']['input'];
}>;


export type Auth_UpdateUserNameMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'Profile', userName: string } | null };

export type Auth_DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type Auth_DeleteAccountMutation = { __typename?: 'Mutation', deleteProfile?: boolean | null };

export type Auth_GetHealthCheckQueryVariables = Exact<{ [key: string]: never; }>;


export type Auth_GetHealthCheckQuery = { __typename?: 'Query', healthCheck?: boolean | null };

export type Auth_GetUserExistsQueryVariables = Exact<{
  userName: Scalars['String']['input'];
}>;


export type Auth_GetUserExistsQuery = { __typename?: 'Query', userExists?: boolean | null };

export type Auth_GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type Auth_GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'Profile', userName: string } | null };


export const Auth_CreateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Auth_CreateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}}]}}]} as unknown as DocumentNode<Auth_CreateProfileMutation, Auth_CreateProfileMutationVariables>;
export const Auth_UpdateUserNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Auth_UpdateUserName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}}]}}]} as unknown as DocumentNode<Auth_UpdateUserNameMutation, Auth_UpdateUserNameMutationVariables>;
export const Auth_DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Auth_DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProfile"}}]}}]} as unknown as DocumentNode<Auth_DeleteAccountMutation, Auth_DeleteAccountMutationVariables>;
export const Auth_GetHealthCheckDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Auth_GetHealthCheck"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthCheck"}}]}}]} as unknown as DocumentNode<Auth_GetHealthCheckQuery, Auth_GetHealthCheckQueryVariables>;
export const Auth_GetUserExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Auth_GetUserExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userName"}}}]}]}}]} as unknown as DocumentNode<Auth_GetUserExistsQuery, Auth_GetUserExistsQueryVariables>;
export const Auth_GetProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Auth_GetProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}}]}}]} as unknown as DocumentNode<Auth_GetProfileQuery, Auth_GetProfileQueryVariables>;