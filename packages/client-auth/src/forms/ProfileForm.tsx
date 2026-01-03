import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { isEmail } from 'validator';
import { Button, ConfirmationModal, Input, Label, toast } from '@repo/ui';
import { CheckMark } from '@repo/ui/icons';
import type {
  Auth_UpdateUserNameMutation,
  Auth_UpdateUserNameMutationVariables,
  Auth_DeleteAccountMutation,
  Auth_DeleteAccountMutationVariables,
} from '../graphql';
import { useSession } from '../provider/SessionContext';
import { SUPABASE_AUTH } from '../provider/constants';
import { useUserNameExists } from '../hooks/useUserNameExists';
import { AUTH_ROUTES } from '../router';

const UPDATE_USER_NAME = gql`
  mutation Auth_UpdateUserName($userName: String!) {
    updateProfile(userName: $userName) {
      userName
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation Auth_DeleteAccount {
    deleteProfile
  }
`;

interface ProfileFormProps {
  logoutRedirectPath: string;
  /** This will default to use `AUTH_ROUTES.NEW_PASSWORD` */
  newPasswordRedirectPath?: string;
}

export const ProfileForm = ({
  logoutRedirectPath,
  newPasswordRedirectPath = AUTH_ROUTES.NEW_PASSWORD,
}: ProfileFormProps) => {
  const navigate = useNavigate();
  const { session, profile, logout, changeEmail, refetchProfile } = useSession();
  const sessionEmail = session?.user.email;

  const [email, setEmail] = useState(sessionEmail ?? '');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const [userName, setUserName] = useState(profile?.userName ?? '');
  const {
    userNameExists,
    isTyping: userNameIsTyping,
    loading: userNameExistsLoading,
    error: userNameExistsError,
  } = useUserNameExists(userName);

  const [isUpdateUserNameLoading, setIsUpdateUserNameLoading] = useState(false);
  const [updateUserName] = useMutation<Auth_UpdateUserNameMutation, Auth_UpdateUserNameMutationVariables>(
    UPDATE_USER_NAME
  );

  const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);

  const [deleteAccount, { loading: deleteAccountLoading }] = useMutation<
    Auth_DeleteAccountMutation,
    Auth_DeleteAccountMutationVariables
  >(DELETE_ACCOUNT);

  const isUserNameChanged = userName !== profile?.userName;
  const isEmailChanged = email !== session?.user.email;
  const isEmailConfirmed = Boolean(session?.user.email_confirmed_at) && !isEmailChanged;

  useEffect(() => {
    if (sessionEmail) setEmail(sessionEmail);
  }, [sessionEmail]);

  const handleUpdateUserName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isUserNameChanged || userNameIsTyping || userNameExistsLoading) return;

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

    setIsUpdateUserNameLoading(true);
    try {
      await updateUserName({
        variables: { userName },
        context: { headers: { authorization: session?.access_token } },
      });
      await refetchProfile();
      toast.success('Username updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update username, please try again');
    } finally {
      setIsUpdateUserNameLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEmailChanged) return;

    if (!email || !isEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsEmailLoading(true);
    try {
      const { error } = await changeEmail(email);
      // supabase auth will throw an error if the email was already sent
      if (error?.message.includes(SUPABASE_AUTH.ERROR.EMAIL_ALREADY_SENT)) {
        toast.success('Please check your email for a confirmation link');
      } else if (error) {
        toast.error(error.message);
      } else {
        toast.success('Please check your email for a confirmation link');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update email, please try again');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({
        context: { headers: { authorization: session?.access_token } },
      });
      toast.success('Account deleted successfully');
      await handleLogout();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account, please try again');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(logoutRedirectPath);
  };

  const isCheckmarkActive =
    !isUserNameChanged ||
    (!userNameIsTyping && !userNameExistsLoading && userName && userNameExists === false);

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
        <h1 className="text-4xl font-bold font-pixel text-center text-muted-foreground">Your Profile</h1>

        <form onSubmit={handleUpdateUserName}>
          <div className="flex flex-col gap-2">
            <Label className="text-md">Username</Label>
            <div className="flex flex-row items-center gap-4">
              <Input name="userName" value={userName} onChange={({ target }) => setUserName(target.value)} />
              <CheckMark size={24} className={isCheckmarkActive ? 'text-green-500' : 'text-gray-500'} />
            </div>

            <Button
              type="submit"
              className="mt-2"
              loading={isUpdateUserNameLoading}
              disabled={
                !isUserNameChanged || deleteAccountLoading || userNameIsTyping || userNameExistsLoading
              }
            >
              Update Username
            </Button>
          </div>
        </form>

        <form onSubmit={handleUpdateEmail}>
          <div className="flex flex-col gap-2">
            <Label className="text-md">Email</Label>
            <div className="flex flex-row items-center gap-4">
              <Input
                name="email"
                type="email"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
              <CheckMark
                size={24}
                className={!isEmailLoading && isEmailConfirmed ? 'text-green-500' : 'text-gray-500'}
              />
            </div>

            <Button
              type="submit"
              className="mt-2"
              loading={isEmailLoading}
              disabled={!isEmailChanged || deleteAccountLoading}
            >
              Update Email
            </Button>
          </div>
        </form>

        <div className="w-20 h-[2px] bg-secondary mx-auto" />

        <div className="flex flex-row gap-4">
          <Button
            onClick={() => setIsDeleteModalShowing(true)}
            loading={deleteAccountLoading}
            variant="destructive"
            className="w-full"
          >
            Delete Account
          </Button>

          <Button
            onClick={() => navigate(newPasswordRedirectPath)}
            disabled={deleteAccountLoading}
            variant="secondary"
            className="w-full"
          >
            Change Password
          </Button>
        </div>

        <Button onClick={handleLogout} disabled={deleteAccountLoading} variant="outline">
          Log Out
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalShowing}
        onClose={() => setIsDeleteModalShowing(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};
