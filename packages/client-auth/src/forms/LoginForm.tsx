import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isEmail } from 'validator';
import { Button, Input, Label, toast } from '@repo/ui';
import { useSession } from '../provider/SessionContext';
import { AUTH_ROUTES } from '../router/constants';

interface LoginFormProps {
  loginRedirectPath: string;
}

export const LoginForm = ({ loginRedirectPath }: LoginFormProps) => {
  const { login } = useSession();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!isEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        toast.error(error.message);
        return;
      }
      navigate(loginRedirectPath);
    } catch (error) {
      console.error(error);
      toast.error('Failed to login, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
      <h1 className="text-4xl font-pixel text-center text-muted-foreground">Log In</h1>

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
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" loading={loading}>
            Log In
          </Button>

          <div className="flex flex-row gap-4">
            <Button asChild variant="ghost" className="flex-1">
              <Link to={AUTH_ROUTES.FORGOT_PASSWORD}>Forgot Password</Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link to={AUTH_ROUTES.SIGNUP}>Sign Up</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
