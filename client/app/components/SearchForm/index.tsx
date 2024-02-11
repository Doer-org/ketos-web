import { useEffect, useRef, useState } from 'react';

export const SearchForm = () => {
  const [id, setId] = useState<string>('');
  const ref = useRef<HTMLInputElement>(null);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setId(e.target.value);

  useEffect(() => {
    ref.current?.focus();
    setId(ref.current?.value ?? '');
  }, []);

  return (
    <div className='bg-white md:p-8 p-4 m-3 text-gray-900 rounded-md'>
      <p className='text-lg font-bold text-center mb-5'>SEARCH ID</p>
      <div className='flex gap-2'>
        <input
          type='text'
          name='ketos-publisd-id'
          className='p-2 rounded-md border-2 border-gray-900'
          placeholder='published id'
          onChange={onChange}
          ref={ref}
        />
        <a
          href={'info/' + id}
          className='border-2 p-2 rounded-md border-gray-900 hover:text-white hover:bg-blue-700'
        >
          search
        </a>
      </div>
    </div>
  );
};
