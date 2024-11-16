"use client";

const MarqueeContent = () => (
  <>
    <span className="mx-4 text-lg font-bold text-white/80">Upload Your Study Materials</span>
    <span className="mx-4 text-lg font-bold text-white/80">•</span>
    <span className="mx-4 text-lg font-bold text-white/80">Generate AI Quizzes</span>
    <span className="mx-4 text-lg font-bold text-white/80">•</span>
    <span className="mx-4 text-lg font-bold text-white/80">Test Your Knowledge</span>
    <span className="mx-4 text-lg font-bold text-white/80">•</span>
    <span className="mx-4 text-lg font-bold text-white/80">Track Your Progress</span>
    <span className="mx-4 text-lg font-bold text-white/80">•</span>
  </>
);

const Marquee = () => {
  return (
    <div className="relative flex overflow-x-hidden bg-black/80 border-y border-white/10">
      <div className="py-3 animate-marquee whitespace-nowrap flex">
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </div>
      <div className="absolute top-0 py-3 animate-marquee2 whitespace-nowrap flex">
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  );
};

export default Marquee; 