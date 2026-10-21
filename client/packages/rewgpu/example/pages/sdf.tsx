import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ComponentWithNoSSR = dynamic(() => import('../src/sdf'), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>ReWebGPU Example - SDF</title>
      </Head>
      <ComponentWithNoSSR />
    </div>
  );
};

export default Home;
