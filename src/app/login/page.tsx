import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-3xl font-headline font-bold tracking-tight text-foreground">
          Welcome to Ndanga Agent
        </h1>
        <p className="text-center text-muted-foreground">
          Sign in to discover your next lead.
        </p>
        <AuthForm />
      </div>
      <div id="recaptcha-container"></div>
    </main>
  );
}
