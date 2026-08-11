import MediaCard from "./MediaCard";
import EmptyState from "./ui/EmptyState";

export default function MediaGrid({ items, onSelect, getStatus, onUpdateStatus, isLibraryTab, hasFilters, onOpenAddCustom }) {
  if (!items.length) {
    return <EmptyState isFavorites={isLibraryTab} hasFilters={hasFilters} onOpenAddCustom={onOpenAddCustom} />;
  }

  return (
    <div className="media-grid">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onSelect={onSelect}
          libraryStatus={getStatus ? getStatus(item.id) : item.status}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
