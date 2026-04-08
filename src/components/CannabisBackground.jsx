import leafImg from '@/../attached_assets/cannabis-leaf-transparent.png';

export default function CannabisBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src={leafImg}
        alt=""
        className="absolute top-[10%] left-[5%] w-32 sm:w-48 opacity-[0.03] rotate-[-15deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute top-[30%] right-[8%] w-40 sm:w-56 opacity-[0.025] rotate-[20deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute bottom-[20%] left-[15%] w-36 sm:w-44 opacity-[0.02] rotate-[45deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute bottom-[5%] right-[12%] w-28 sm:w-40 opacity-[0.03] rotate-[-30deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute top-[55%] left-[50%] w-48 sm:w-64 opacity-[0.015] rotate-[10deg] -translate-x-1/2"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute top-[5%] right-[35%] w-24 sm:w-32 opacity-[0.025] rotate-[-45deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <img
        src={leafImg}
        alt=""
        className="absolute bottom-[40%] left-[60%] w-36 sm:w-48 opacity-[0.02] rotate-[60deg]"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </div>
  );
}
