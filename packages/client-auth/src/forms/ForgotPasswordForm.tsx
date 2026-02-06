import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isEmail } from 'validator';
import { Button, Input, Label, toast } from '@repo/ui';
import { useSession } from '../provider/SessionContext';
import { SUPABASE_AUTH } from '../provider/constants';
import { AUTH_ROUTES } from '../router/constants';

export const ForgotPasswordForm = () => {
  const { forgotPassword } = useSession();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!isEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await forgotPassword(email);
      // supabase auth will throw an error if the email was already sent
      if (error?.message.includes(SUPABASE_AUTH.ERROR.EMAIL_ALREADY_SENT)) {
        toast.success('Please check your email for a password reset link');
      } else if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Please check your inbox');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset email, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
      <h1 className="text-4xl font-pixel text-center text-muted-foreground">Reset Password</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label className="text-md">Email</Label>
          <Input name="email" type="email" value={email} onChange={({ target }) => setEmail(target.value)} />
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" loading={loading}>
            Send Reset Link
          </Button>

          <Button asChild variant="secondary" className="flex-1">
            <Link to={AUTH_ROUTES.LOGIN}>Log In</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};
