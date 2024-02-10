export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen font-mono bg-blue-700 text-gray-100 p-3'>
      {children}
    </div>
  );
};
