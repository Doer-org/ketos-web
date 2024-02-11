export const Code = () => {
  return (
    <div className='p-3 bg-cyan-950 text-white rounded-md mb-3'>
      <span>👇example👇</span>
      <pre>
        <span className='pr-2 text-orange-500'>[upload]</span>
        {`go run . push -d "./examples/go" -l "go" -f "Dockerfile" -D true`}
      </pre>
      <pre>
        <span className='pr-2 text-orange-500'>[download]</span>
        {`go run . pull -i`}
      </pre>
    </div>
  );
};
