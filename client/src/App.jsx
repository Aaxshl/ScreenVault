import { useState } from "react";
import "./styles/global.css";

import Header from "./components/layout/Header";
import Browse from "./pages/Browse";
import Library from "./pages/Library";
import MediaModal from "./components/MediaModal";
import AddCustomModal from "./components/AddCustomModal";
import AddCollectionModal from "./components/AddCollectionModal";
import MovieRouletteModal from "./components/MovieRouletteModal";
import ToastContainer from "./components/ui/ToastContainer";
import ErrorBoundary from "./components/ErrorBoundary";

import { useContent } from "./hooks/useContent";
import { useLibrary } from "./hooks/useLibrary";
import { useCollections } from "./hooks/useCollections";
import { useAchievements } from "./hooks/useAchievements";
import { useActivityLog } from "./hooks/useActivityLog";
import { useEpisodeTracker } from "./hooks/useEpisodeTracker";
import { useToast } from "./hooks/useToast";

export default function App() {
  const [activeTab, setActiveTab] = useState("browse");
  const [mediaType, setMediaType] = useState("movie");
  const [selectedId, setSelectedId] = useState(null);

  // Custom title modal state
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [editingCustomData, setEditingCustomData] = useState(null);

  // Custom collection modal state
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [editingCollectionData, setEditingCollectionData] = useState(null);

  // Roulette modal state
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  const { toasts, toast, dismiss } = useToast();

  // Activity log — must be initialised before useLibrary so logEvent is ready
  const { activityLog, logEvent, clearLog } = useActivityLog();

  const {
    library,
    getItem,
    getStatus,
    updateStatus,
    updateRating,
    updateNotes,
    addCustomTitle,
    editCustomTitle,
    deleteItem,
  } = useLibrary(toast, logEvent);

  const {
    collections,
    createCollection,
    editCollection,
    deleteCollection,
    toggleItemInCollection,
  } = useCollections(toast);

  const { achievements, unlockedCount, totalBadges } = useAchievements(library, collections, toast);

  const { getShowData, toggleEpisodeWatched, setEpisodeNote } = useEpisodeTracker();

  const {
    items,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
    sectionTitle,
  } = useContent(mediaType);

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setSelectedId(null);
  };

  const handleOpenAddCustom = (prefillTitle = "") => {
    setEditingCustomData(
      prefillTitle ? { title: prefillTitle, mediaType } : null
    );
    setIsAddCustomOpen(true);
  };

  const handleSaveCustom = (customData) => {
    if (editingCustomData?.id) {
      editCustomTitle(editingCustomData.id, customData);
    } else {
      addCustomTitle(customData);
    }
  };

  const handleEditCustomFromModal = (item) => {
    setEditingCustomData(item);
    setIsAddCustomOpen(true);
  };

  const handleOpenCreateCollection = (colData = null) => {
    setEditingCollectionData(colData);
    setIsAddCollectionOpen(true);
  };

  const handleSaveCollection = (colData) => {
    if (editingCollectionData?.id) {
      editCollection(editingCollectionData.id, colData);
    } else {
      createCollection(colData);
    }
  };

  const selectedLibraryItem = selectedId ? getItem(selectedId) : null;

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <Header
          query={query}
          onQueryChange={setQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          libraryCount={library.length}
          onOpenAddCustom={() => handleOpenAddCustom("")}
          onOpenRoulette={() => setIsRouletteOpen(true)}
        />

        {activeTab === "browse" ? (
          <Browse
            mediaType={mediaType}
            items={items}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            error={error}
            sectionTitle={sectionTitle}
            filters={filters}
            onFilterUpdate={updateFilter}
            onFilterReset={resetFilters}
            onMediaTypeChange={handleMediaTypeChange}
            onSelect={setSelectedId}
            getStatus={getStatus}
            onUpdateStatus={updateStatus}
            onOpenAddCustom={() => handleOpenAddCustom(query)}
          />
        ) : (
          <Library
            library={library}
            onSelect={setSelectedId}
            getStatus={getStatus}
            onUpdateStatus={updateStatus}
            onOpenAddCustom={() => handleOpenAddCustom("")}
            collections={collections}
            onOpenCreateCollection={handleOpenCreateCollection}
            onEditCollection={handleOpenCreateCollection}
            onDeleteCollection={deleteCollection}
            onToggleItemInCollection={toggleItemInCollection}
            achievements={achievements}
            unlockedCount={unlockedCount}
            totalBadges={totalBadges}
            activityLog={activityLog}
            onClearActivityLog={clearLog}
          />
        )}

        <footer
          style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            color: "var(--text-dim)",
            fontSize: 12,
            marginTop: "auto",
          }}
        >
          ScreenVault &nbsp;•&nbsp; TMDB Proxy Server + React Library Manager
        </footer>

        {selectedId && (
          <MediaModal
            id={selectedId}
            mediaType={selectedLibraryItem?.mediaType || mediaType}
            libraryItem={selectedLibraryItem}
            isLibraryTab={activeTab === "library"}
            onClose={() => setSelectedId(null)}
            onSelect={setSelectedId}
            getStatus={getStatus}
            onUpdateStatus={updateStatus}
            onUpdateRating={updateRating}
            onUpdateNotes={updateNotes}
            onEditCustom={handleEditCustomFromModal}
            onDeleteCustom={deleteItem}
            collections={collections}
            onToggleItemInCollection={toggleItemInCollection}
            getShowData={getShowData}
            toggleEpisodeWatched={toggleEpisodeWatched}
            setEpisodeNote={setEpisodeNote}
          />
        )}

        <AddCustomModal
          isOpen={isAddCustomOpen}
          onClose={() => {
            setIsAddCustomOpen(false);
            setEditingCustomData(null);
          }}
          onSave={handleSaveCustom}
          initialData={editingCustomData}
        />

        <AddCollectionModal
          isOpen={isAddCollectionOpen}
          onClose={() => {
            setIsAddCollectionOpen(false);
            setEditingCollectionData(null);
          }}
          onSave={handleSaveCollection}
          initialData={editingCollectionData}
        />

        <MovieRouletteModal
          isOpen={isRouletteOpen}
          onClose={() => setIsRouletteOpen(false)}
          library={library}
          onSelect={(id) => {
            setSelectedId(id);
            setActiveTab("library");
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ErrorBoundary>
  );
}