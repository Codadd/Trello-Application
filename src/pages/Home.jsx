import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';

export default function Home() {
  const { boards, createBoard, updateBoard, deleteBoard, loading } = useBoard();
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [editing, setEditing] = useState(false);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    
    setCreating(true);
    try {
      await createBoard(newBoardTitle.trim(), newBoardDesc.trim());
      setNewBoardTitle('');
      setNewBoardDesc('');
      setShowModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
    setCreating(false);
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  const handleEditBoard = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoard(board);
    setEditBoardTitle(board.title);
    setEditBoardDesc(board.description || '');
    setShowEditModal(true);
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    if (!editBoardTitle.trim() || !editingBoard) return;
    
    setEditing(true);
    try {
      await updateBoard(editingBoard.id, {
        title: editBoardTitle.trim(),
        description: editBoardDesc.trim()
      });
      setShowEditModal(false);
      setEditingBoard(null);
      setEditBoardTitle('');
      setEditBoardDesc('');
    } catch (error) {
      console.error('Error updating board:', error);
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Boards</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm sm:text-base">Create Board</span>
        </button>
      </div>

      {/* Board Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-indigo-100 mb-6">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No boards yet</h2>
          <p className="text-gray-500 mb-6 text-lg">Create your first board to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {/* Board Cards */}
          {boards.map((board) => (
            <div key={board.id} className="group relative">
              <Link to={`/board/${board.id}`} className="block">
                <div className="h-28 sm:h-[140px] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm hover:shadow-md transition p-3 sm:p-4 flex flex-col justify-end">
                  <h3 className="text-white font-semibold text-sm sm:text-lg">{board.title}</h3>
                  {board.description && (
                    <p className="text-white/70 text-xs mt-1 line-clamp-2 hidden sm:block">{board.description}</p>
                  )}
                </div>
              </Link>
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteBoard(e, board.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Delete board"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {/* Edit Button */}
              <button
                onClick={(e) => handleEditBoard(e, board)}
                className="absolute top-2 right-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Edit board"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          ))}
          {/* Create New Board Card */}
          <button
            onClick={() => setShowModal(true)}
            className="h-28 sm:h-[140px] bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-50 flex items-center justify-center transition"
          >
            <div className="text-gray-600 font-medium text-sm sm:text-base">+ Create new board</div>
          </button>
        </div>
      )}

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Board Title *</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Enter board title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 text-base"
                  autoFocus
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description (optional)</label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="Enter board description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 text-base resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewBoardTitle('');
                    setNewBoardDesc('');
                  }}
                  className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBoardTitle.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Edit Board</h2>
            <form onSubmit={handleUpdateBoard}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Board Title *</label>
                <input
                  type="text"
                  value={editBoardTitle}
                  onChange={(e) => setEditBoardTitle(e.target.value)}
                  placeholder="Enter board title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 text-base"
                  autoFocus
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description (optional)</label>
                <textarea
                  value={editBoardDesc}
                  onChange={(e) => setEditBoardDesc(e.target.value)}
                  placeholder="Enter board description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 text-base resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBoard(null);
                    setEditBoardTitle('');
                    setEditBoardDesc('');
                  }}
                  className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing || !editBoardTitle.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

