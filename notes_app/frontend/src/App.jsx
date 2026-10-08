/* ==========================================================================
   REACT APP COMPONENT (src/App.jsx)
   Notes Management with REST API Fetching, Search, Editor, & Delete Modals
   ========================================================================== */

import React, { useState, useEffect } from 'react';

// Color Palette Choices for Note Cards
const COLOR_PALETTE = [
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Pink', hex: '#DB2777' }
];

export default function App() {
  // Application State
  const [notes, setNotes] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverHealth, setServerHealth] = useState({ connected: false, mongodb: false });

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // null = New Note, object = Editing Note
  const [editorForm, setEditorForm] = useState({ title: '', content: '', color: '#7C3AED' });
  const [editorError, setEditorError] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // --------------------------------------------------------------------------
  // 1. API FETCHING & HEALTH CHECK
  // --------------------------------------------------------------------------

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth({
          connected: true,
          mongodb: data.mongodb === 'connected' || data.mongodb === true
        });
      } else {
        setServerHealth({ connected: false, mongodb: false });
      }
    } catch (err) {
      setServerHealth({ connected: false, mongodb: false });
    }
  };

  // Fetch Notes List (supports optional search keyword)
  const fetchNotes = async (keyword = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = keyword.trim()
        ? `/api/notes?search=${encodeURIComponent(keyword.trim())}`
        : '/api/notes';

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch notes (Status ${res.status})`);
      }
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Fetch Notes Error:', err);
      setError('Unable to connect to Notes backend API. Ensure server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load & Debounced Search Effect
  useEffect(() => {
    checkHealth();
    fetchNotes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(searchKeyword);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // --------------------------------------------------------------------------
  // 2. EDITOR HANDLERS (Create / Edit)
  // --------------------------------------------------------------------------
  const openNewNoteEditor = () => {
    setSelectedNote(null);
    setEditorForm({ title: '', content: '', color: '#7C3AED' });
    setEditorError('');
    setIsEditorOpen(true);
  };

  const openEditNoteEditor = (note) => {
    setSelectedNote(note);
    setEditorForm({
      title: note.title,
      content: note.content,
      color: note.color || '#7C3AED'
    });
    setEditorError('');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    setEditorError('');
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setEditorError('');

    // Frontend validation
    if (!editorForm.title.trim()) {
      setEditorError('Title is required.');
      return;
    }
    if (!editorForm.content.trim()) {
      setEditorError('Content is required.');
      return;
    }

    try {
      const isEditing = !!selectedNote;
      const url = isEditing ? `/api/notes/${selectedNote._id}` : '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editorForm)
      });

      const data = await res.json();

      if (!res.ok) {
        setEditorError(data.message || 'Error saving note.');
        return;
      }

      closeEditor();
      fetchNotes(searchKeyword); // Refresh list
    } catch (err) {
      console.error('Save Note Error:', err);
      setEditorError('Network error while saving note.');
    }
  };

  // --------------------------------------------------------------------------
  // 3. DELETE HANDLERS
  // --------------------------------------------------------------------------
  const openDeleteModal = (note) => {
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      const res = await fetch(`/api/notes/${noteToDelete._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete note');
      }
      closeDeleteModal();
      fetchNotes(searchKeyword); // Refresh list
    } catch (err) {
      console.error('Delete Note Error:', err);
      alert('Could not delete note. Please check server connection.');
    }
  };

  // Helper date formatter
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --------------------------------------------------------------------------
  // 4. RENDER UI
  // --------------------------------------------------------------------------
  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📝</span>
          <span className="brand-name">NoteFlow</span>
        </div>

        <button onClick={openNewNoteEditor} className="btn-new-note">
          <span>+</span> New Note
        </button>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span>📚 All Notes</span>
            <span className="nav-badge">{notes.length}</span>
          </button>
        </nav>

        {/* Backend Connection Indicator */}
        <div className="system-status">
          <span
            className={`status-dot ${serverHealth.connected ? 'dot-green' : 'dot-red'}`}
          ></span>
          <div>
            <strong>Backend API:</strong>{' '}
            {serverHealth.connected ? 'Online (Port 5000)' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search notes by title or content..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </header>

        {/* NOTES GRID CONTAINER */}
        <main className="notes-container">
          <div className="section-header">
            <h2 className="section-title">
              {searchKeyword ? `Search Results for "${searchKeyword}"` : 'All Notes'}
            </h2>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-spinner">
              ⏳ Loading your notes from MongoDB...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && notes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No notes found</h3>
              <p>
                {searchKeyword
                  ? 'No notes matched your search query.'
                  : 'Click "+ New Note" in the sidebar to create your first note!'}
              </p>
            </div>
          )}

          {/* Notes Grid */}
          {!isLoading && !error && notes.length > 0 && (
            <div className="notes-grid">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="note-card"
                  style={{ '--note-accent': note.color || '#7C3AED' }}
                >
                  <div>
                    <div className="note-header">
                      <h3 className="note-title">{note.title}</h3>
                    </div>
                    <p className="note-content">{note.content}</p>
                  </div>

                  <div className="note-footer">
                    <span className="note-date">
                      {formatDate(note.updatedAt || note.createdAt)}
                    </span>
                    <div className="note-actions">
                      <button
                        onClick={() => openEditNoteEditor(note)}
                        className="btn-icon-action"
                        title="Edit Note"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => openDeleteModal(note)}
                        className="btn-icon-action btn-icon-delete"
                        title="Delete Note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          NOTE EDITOR MODAL (Create / Edit)
          ==================================================================== */}
      {isEditorOpen && (
        <div className="modal-overlay" onClick={closeEditor}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={closeEditor} className="btn-close">
                &times;
              </button>
            </div>

            {editorError && <div className="error-banner">{editorError}</div>}

            <form onSubmit={handleSaveNote}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  placeholder="Note Title"
                  value={editorForm.title}
                  onChange={(e) =>
                    setEditorForm({ ...editorForm, title: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  rows="6"
                  placeholder="Write your note details here..."
                  value={editorForm.content}
                  onChange={(e) =>
                    setEditorForm({ ...editorForm, content: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Color Selection */}
              <div className="form-group">
                <label>Card Color Accent</label>
                <div className="color-picker">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      className={`color-option ${
                        editorForm.color === c.hex ? 'selected' : ''
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      onClick={() =>
                        setEditorForm({ ...editorForm, color: c.hex })
                      }
                    ></button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          DELETE CONFIRMATION MODAL
          ==================================================================== */}
      {isDeleteModalOpen && noteToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button onClick={closeDeleteModal} className="btn-close">
                &times;
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              Are you sure you want to delete the note{' '}
              <strong>"{noteToDelete.title}"</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger">
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
