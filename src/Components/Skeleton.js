import './Skeleton.css';

/**
 * Generic shimmer block. Use width/height (any CSS unit) and `radius` to control shape.
 * For circles, set width === height and radius="50%".
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = '0.4rem',
  className = '',
  style,
  ...rest
}) {
  return (
    <span
      className={`cch-skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden
      {...rest}
    />
  );
}

/** Skeleton matching the homepage "Shop by category" tile. */
export function CategoryTileSkeleton() {
  return (
    <div className="cch-skeleton-tile">
      <Skeleton className="cch-skeleton-tile-media" radius="0.85rem 0.85rem 0 0" />
      <div className="cch-skeleton-tile-body">
        <Skeleton width="70%" height="0.85rem" />
        <Skeleton width="40%" height="0.7rem" />
      </div>
    </div>
  );
}

/** Skeleton matching a catalogue product card. */
export function ProductCardSkeleton() {
  return (
    <div className="cch-skeleton-card">
      <Skeleton className="cch-skeleton-card-media" />
      <div className="cch-skeleton-card-body">
        <Skeleton width="80%" height="0.95rem" />
        <Skeleton width="40%" height="1.05rem" />
        <Skeleton width="60%" height="0.75rem" />
        <div className="cch-skeleton-card-actions">
          <Skeleton width="48%" height="2.05rem" radius="0.5rem" />
          <Skeleton width="48%" height="2.05rem" radius="0.5rem" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton that mimics the testimonial-style review card with overlapping avatar. */
export function ReviewCardSkeleton() {
  return (
    <div className="cch-skeleton-review">
      <div className="cch-skeleton-review-avatar-wrap">
        <Skeleton width="72px" height="72px" radius="50%" />
      </div>
      <Skeleton width="55%" height="1.1rem" />
      <Skeleton width="35%" height="0.7rem" />
      <Skeleton width="55%" height="1rem" />
      <div className="cch-skeleton-review-text">
        <Skeleton width="100%" height="0.78rem" />
        <Skeleton width="92%" height="0.78rem" />
        <Skeleton width="78%" height="0.78rem" />
      </div>
    </div>
  );
}

/** Skeleton row for table-style data (orders, items, etc). */
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className="cch-skeleton-row">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={`${Math.max(40, 100 - i * 12)}%`} height="0.85rem" />
      ))}
    </div>
  );
}

export default Skeleton;
