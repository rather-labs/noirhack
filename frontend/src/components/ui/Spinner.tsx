export function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full " />
        <div
          className="absolute inset-0 rounded-full
          bg-[conic-gradient(at_center,_rgba(124,58,237,0.9)_0%,_rgba(124,58,237,0.6)_35%,_rgba(124,58,237,0.2)_65%,_rgba(124,58,237,0)_95%)]
          animate-[spin_1.2s_linear_infinite]"
        />
      </div>
    </div>
  );
}
