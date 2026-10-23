import Head from 'next/head';

export default function Messages() {
  return (
    <div className="container">
      <Head>
        <title>Messages | Ministry of Groove</title>
      </Head>

      <div className="top-bar">
        <div className="top-title">ENCRYPTED CHANNELS</div>
      </div>

      <div className="section-hdr">
        <h2>QUICK UPLINK</h2>
        <div className="line"></div>
      </div>

      <div className="section-hdr">
        <h2>ACTIVE UPLINKS</h2>
        <div className="line"></div>
      </div>
    </div>
  );
}
