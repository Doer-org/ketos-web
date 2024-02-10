import type { MetaFunction } from '@remix-run/cloudflare';
import { useMatches } from '@remix-run/react';

import { Wrapper } from '~/components/Wrapper';

export const meta: MetaFunction = () => {
  return [
    { title: 'info | Ketos' },
    { name: 'description', content: `ketos info` },
  ];
};

export default function InfoDetail() {
  const matches = useMatches()[1];
  return (
    <Wrapper>
      <h1 className='text-2xl font-bold'>ID:{matches.params.id}</h1>
    </Wrapper>
  );
}
