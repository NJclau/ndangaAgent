import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
      <Bot className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline text-foreground">Ndanga</span>
    </Link>
  );
}
