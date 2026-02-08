import React from 'react';
import { ECO_BRANCHES } from '../constants';

interface EcoTreeProps {
  onBranchSelect: (promptPrefix: string) => void;
}

const EcoTree: React.FC<EcoTreeProps> = ({ onBranchSelect }) => {
  const radius = 170; // Distance from center
  const center = 200; // SVG Viewbox center

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[650px] flex items-center justify-center fade-in select-none perspective-[1000px]">
      
      {/* 3D ATOMIC ORBITALS (Replacing simple circles) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {/* Orbit 1 */}
         <div className="absolute w-[500px] h-[160px] border border-eco-500/40 rounded-[100%] animate-[spin_8s_linear_infinite] [transform-style:preserve-3d]">
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-eco-400 rounded-full shadow-[0_0_10px_#34d399] -translate-x-1/2 -translate-y-1/2"></div>
         </div>
         {/* Orbit 2 - Rotated 60deg */}
         <div className="absolute w-[500px] h-[160px] border border-eco-500/40 rounded-[100%] animate-[spin_8s_linear_infinite] [animation-delay:-2s] rotate-[60deg]">
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-eco-400 rounded-full shadow-[0_0_10px_#34d399] -translate-x-1/2 translate-y-1/2"></div>
         </div>
         {/* Orbit 3 - Rotated -60deg */}
         <div className="absolute w-[500px] h-[160px] border border-eco-500/40 rounded-[100%] animate-[spin_8s_linear_infinite] [animation-delay:-4s] rotate-[-60deg]">
            <div className="absolute top-1/2 right-0 w-3 h-3 bg-eco-400 rounded-full shadow-[0_0_10px_#34d399] translate-x-1/2 -translate-y-1/2"></div>
         </div>
      </div>

      {/* SVG Layer - Connections & Nucleus */}
      <svg className="absolute w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nucleus-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="nucleus-grad" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="#ecfdf5" />
             <stop offset="60%" stopColor="#10b981" />
             <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
          <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#065f46" stopOpacity="0.1" />
             <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
             <stop offset="100%" stopColor="#065f46" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Branch Connections (Circuit Style) */}
        {ECO_BRANCHES.map((branch, index) => {
          const angleDeg = (index * (360 / ECO_BRANCHES.length)) - 90;
          const angleRad = angleDeg * (Math.PI / 180);
          
          const startR = 40; // Start at edge of nucleus
          const endR = radius - 30; // End before the outer node
          
          const x1 = center + startR * Math.cos(angleRad);
          const y1 = center + startR * Math.sin(angleRad);
          const x2 = center + endR * Math.cos(angleRad);
          const y2 = center + endR * Math.sin(angleRad);

          return (
            <g key={`circuit-${branch.id}`}>
               <line 
                 x1={x1} y1={y1} 
                 x2={x2} y2={y2} 
                 stroke="url(#circuit-grad)" 
                 strokeWidth="1.5"
                 strokeDasharray="2 4"
               />
               <circle cx={x2} cy={y2} r="2" fill="#34d399" className="animate-pulse" />
            </g>
          );
        })}
        
        {/* CENTRAL NUCLEUS (The "Box") */}
        <g filter="url(#nucleus-glow)" className="animate-[pulse_4s_ease-in-out_infinite]">
          {/* Core Sphere */}
          <circle cx={center} cy={center} r="35" fill="url(#nucleus-grad)" opacity="0.9" />
          {/* Inner details representing protons/neutrons */}
          <circle cx={center-10} cy={center-5} r="12" fill="#047857" opacity="0.5" />
          <circle cx={center+10} cy={center+5} r="10" fill="#047857" opacity="0.5" />
          <circle cx={center} cy={center+12} r="8" fill="#047857" opacity="0.5" />
          
          {/* Crystalline Grid Overlay */}
          <path d={`M${center-20},${center-20} L${center+20},${center+20} M${center+20},${center-20} L${center-20},${center+20}`} stroke="white" strokeWidth="0.5" opacity="0.3" />
        </g>
        
        {/* Central Text */}
        <text x={center} y={center + 4} textAnchor="middle" className="fill-white font-mono text-sm font-bold tracking-[0.2em] drop-shadow-lg pointer-events-none" style={{textShadow: "0 0 10px #000"}}>ECO</text>
      </svg>

      {/* HTML Layer - Hexagonal Buttons */}
      <div className="absolute inset-0 pointer-events-none">
        {ECO_BRANCHES.map((branch, index) => {
           const angle = (index * (360 / ECO_BRANCHES.length)) - 90;
           const x = 50 + (42.5 * Math.cos(angle * Math.PI / 180)); // 42.5% radius
           const y = 50 + (42.5 * Math.sin(angle * Math.PI / 180));

           const style: React.CSSProperties = {
             top: `${y}%`,
             left: `${x}%`,
             transform: 'translate(-50%, -50%)',
           };

           return (
             <button
               key={branch.id}
               onClick={() => onBranchSelect(branch.promptPrefix)}
               style={style}
               className="pointer-events-auto absolute group w-24 h-24 flex flex-col items-center justify-center outline-none z-20 hover:z-30 transition-all duration-500"
             >
               {/* Hover Scale Wrapper */}
               <div className="w-full h-full relative transition-transform duration-300 group-hover:scale-110">
                 
                 {/* Hexagon Background */}
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300 group-hover:bg-eco-900/80 border border-eco-500/30" 
                      style={{ 
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}>
                 </div>

                 {/* Icon */}
                 <div className="relative z-10 p-2 mb-1 flex items-center justify-center">
                   <svg 
                     className="w-7 h-7 text-eco-500 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     stroke="currentColor"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={branch.iconPath} />
                   </svg>
                 </div>

                 {/* Label */}
                 <span className="relative z-10 text-[8px] text-eco-400 font-mono uppercase tracking-wider text-center px-1 leading-tight group-hover:text-eco-100 group-hover:shadow-black/50">
                   {branch.label}
                 </span>
               </div>
             </button>
           );
        })}
      </div>
    </div>
  );
};

export default EcoTree;