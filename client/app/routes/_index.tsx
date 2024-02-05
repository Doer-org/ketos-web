import type { MetaFunction } from '@remix-run/cloudflare';
import { Logo } from '~/components/Logo';

export const meta: MetaFunction = () => {
  return [
    { title: 'Ketos' },
    {
      name: 'description',
      content: `CLI tool to reproduce someone else's environment`,
    },
  ];
};

export default function Index() {
  return (
    <main className='flex flex-col justify-center items-center min-h-screen font-mono font-bold bg-teal-100'>
      <Logo />
      <h1 className='text-4xl font-bold'>Ketos</h1>
      <p className='my-2'>
        CLI tool to reproduce someone {"else's"} environment
      </p>
    </main>
  );
}
