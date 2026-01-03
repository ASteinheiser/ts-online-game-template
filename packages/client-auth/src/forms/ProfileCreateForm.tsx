import { useState } from 'react';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { Button, Input, Label, toast } from '@repo/ui';
import { CheckMark } from '@repo/ui/icons';
import { useSession } from '../provider/SessionContext';
import type { Auth_CreateProfileMutation, Auth_CreateProfileMutationVariables } from '../graphql';
import { useUserNameExists } from '../hooks/useUserNameExists';

const CREATE_PROFILE = gql`
  mutation Auth_CreateProfile($userName: String!) {
    createProfile(userName: $userName) {
      userName
    }
  }
`;

export const ProfileCreateForm = () => {
  const client = useApolloClient();
  const { session, refetchProfile } = useSession();

  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    userNameExists,
    isTyping: userNameIsTyping,
    loading: userNameExistsLoading,
    error: userNameExistsError,
  } = useUserNameExists(userName);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userNameIsTyping || userNameExistsLoading) return;

    if (!userName) {
      toast.error('Please enter a username');
      return;
    }
    if (userNameExists === undefined || userNameExistsError) {
      toast.error('Oops, there was an issue checking available usernames');
      return;
    }
    if (userNameExists === true) {
      toast.error('Username is already taken');
      return;
    }

    setLoading(true);
    try {
      await client.mutate<Auth_CreateProfileMutation, Auth_CreateProfileMutationVariables>({
        mutation: CREATE_PROFILE,
        variables: { userName },
        context: { headers: { authorization: session?.access_token } },
      });
      await refetchProfile();
      toast.success('Profile created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create profile, please try again');
    } finally {
      setLoading(false);
    }
  };

  const isCheckmarkActive =
    !userNameIsTyping && !userNameExistsLoading && userName && userNameExists === false;

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
      <h1 className="text-4xl font-bold font-pixel text-center text-muted-foreground">Create Your Profile</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label className="text-md">Username</Label>
          <div className="flex flex-row items-center gap-4">
            <Input name="userName" value={userName} onChange={({ target }) => setUserName(target.value)} />
            <CheckMark size={24} className={isCheckmarkActive ? 'text-green-500' : 'text-gray-500'} />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={userNameIsTyping || userNameExistsLoading}
            className="mt-2"
          >
            Create Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
