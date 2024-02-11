import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, useLoaderData } from '@remix-run/react';
import { Wrapper } from '~/components/Wrapper';
import { cdate } from 'cdate';

export const meta: MetaFunction = () => {
  return [
    { title: 'info | Ketos' },
    { name: 'description', content: `ketos specific id info!` },
  ];
};

type FileInfo = {
  id: string;
  port: string;
  createdAt: string;
  size: number;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const res = (await fetch(
    `https://ketos-server.doer-app.com/file_info/${params.id}`
  )
    .then(async (info) => await info.json())
    .catch(() => null)) as FileInfo | null;

  return json({ id: params.id, value: res });
};

type InfoProps = { label: string; value?: string | number };
const Info = ({ label, value }: InfoProps) => {
  return (
    <div className='flex gap-3 items-center'>
      <p className='font-bold p-1 bg-white w-1/3 text-gray-900 rounded-md'>
        {label}
      </p>
      <p>{value ?? 'NONE'}</p>
    </div>
  );
};

export default function InfoDetail() {
  const { id, value } = useLoaderData<typeof loader>();
  const now = cdate(value?.createdAt).utcOffset(+9);
  return (
    <Wrapper>
      <div>
        <h1 className='text-2xl font-bold'>ID:{id}</h1>
        {value ? (
          <div className='flex gap-3 flex-col mt-10'>
            <Info label='Port' value={value.port} />
            <Info label='Size' value={value.size} />
            <Info
              label='Created At'
              value={now.format('YYYY/MM/DD HH:mm:ss')}
            />
          </div>
        ) : (
          <p>Not Found Data</p>
        )}
      </div>
    </Wrapper>
  );
}
