import './Skeletons.css';

export function RowSkeleton() {
  return (
    <div className="row" aria-hidden="true">
      <div className="skel skel--title" />
      <div className="row__scroller">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel-card">
            <div className="skel skel--poster" />
            <div className="skel skel--line" />
            <div className="skel skel--line skel--short" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="hero-skel" aria-hidden="true">
      <div className="skel skel--pulse" />
    </div>
  );
}

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid-skel" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel-card">
          <div className="skel skel--poster" />
          <div className="skel skel--line" />
          <div className="skel skel--line skel--short" />
        </div>
      ))}
    </div>
  );
}
