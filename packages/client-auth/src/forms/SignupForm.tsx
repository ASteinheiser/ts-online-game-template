import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isEmail } from 'validator';
import { Button, Input, Label, toast } from '@repo/ui';
import { useSession } from '../provider/SessionContext';
import { SUPABASE_AUTH } from '../provider/constants';
import { AUTH_ROUTES } from '../router/constants';

export const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!isEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signup(email, password);
      // supabase auth will throw an error if the email was already sent
      if (error?.message.includes(SUPABASE_AUTH.ERROR.EMAIL_ALREADY_SENT)) {
        toast.success('Please check your email for a verification link');
      } else if (error) {
        toast.error(error.message);
      }
      // this is the only way to check if the email is already in use via supabase auth
      else if (data?.user?.identities?.length === 0) {
        toast.error('Email already in use, please log in');
        navigate(AUTH_ROUTES.LOGIN);
      } else {
        toast.success('Signup successful, please check your email for a verification link');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to signup, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
      <h1 className="text-4xl font-pixel text-center text-muted-foreground">Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label className="text-md">Email</Label>
          <Input name="email" type="email" value={email} onChange={({ target }) => setEmail(target.value)} />

          <Label className="text-md">Password</Label>
          <Input
            name="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />

          <Label className="text-md">Confirm Password</Label>
          <Input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
          />
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" loading={loading}>
            Sign Up
          </Button>

          <Button asChild variant="secondary" className="flex-1">
            <Link to={AUTH_ROUTES.LOGIN}>Log In</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};
