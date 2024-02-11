import type { MetaFunction } from '@remix-run/cloudflare';
import { Code } from '~/components/Code';
import { Logo } from '~/components/Logo';
import { SearchForm } from '~/components/SearchForm';
import { Wrapper } from '~/components/Wrapper';

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
    <Wrapper>
      <Logo />
      <h1 className='text-4xl font-bold mt-5'>Ketos</h1>
      <p className='mt-2 mb-6 text-lg'>
        CLI tool to reproduce someone {"else's"} environment
      </p>
      <a
        href='https://github.com/Doer-org/ketos/releases/tag/v1.0.0'
        target='_blank'
        rel='noopener noreferrer'
        className='hover:underline mb-3 block'
      >
        download
      </a>
      <Code />
      <SearchForm />
    </Wrapper>
  );
}
