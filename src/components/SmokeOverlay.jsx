export default function SmokeOverlay() {
  return (
    <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
      {/* Smoke blob 1 - bottom left */}
      <div
        className="smoke-1 absolute bottom-0 left-[15%] w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100,160,80,0.12) 0%, rgba(130,80,180,0.06) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Smoke blob 2 - bottom right */}
      <div
        className="smoke-2 absolute bottom-0 right-[20%] w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(120,80,180,0.1) 0%, rgba(80,140,70,0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Smoke blob 3 - center */}
      <div
        className="smoke-3 absolute bottom-[10%] left-[45%] w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(90,150,75,0.08) 0%, rgba(110,60,160,0.05) 60%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Static ambient purple glow top */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(120,60,200,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Static ambient green glow bottom left */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(60,140,60,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}
