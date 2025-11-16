export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background opacity-50" />
      
      <div className="relative z-10">
        {/* Outer spinning ring with gradient */}
        <div className="relative w-32 h-32">
          <div 
            className="absolute inset-0 rounded-full animate-spin"
            style={{ animationDuration: '2s' }}
          >
            <div className="w-full h-full rounded-full border-8 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-border"
                 style={{
                   WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '8px'
                 }}
            />
          </div>
          
          {/* Middle rotating ring - opposite direction */}
          <div 
            className="absolute inset-4 rounded-full animate-spin"
            style={{ animationDuration: '3s', animationDirection: 'reverse' }}
          >
            <div className="w-full h-full rounded-full border-4 border-transparent bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 bg-clip-border opacity-60"
                 style={{
                   WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '4px'
                 }}
            />
          </div>
          
          {/* Inner pulsing glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/40 to-purple-600/40 animate-pulse blur-sm" />
          </div>
          
          {/* Center glowing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-ping" 
                 style={{ animationDuration: '1.5s' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
