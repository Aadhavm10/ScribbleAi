'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Folder, FoldersAPI, CreateFolderDto, UpdateFolderDto } from '../../../lib/api';

export const dynamic = 'force-dynamic';

const FOLDER_ICONS = ['📁', '📂', '📚', '📝', '💼', '🎯', '🚀', '💡', '🎨', '🔥', '⭐', '🌟'];
const FOLDER_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

interface FolderTreeItemProps {
  folder: Folder;
  level: number;
  onSelect: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  selectedId?: string;
}

function FolderTreeItem({ folder, level, onSelect, onEdit, onDelete, selectedId }: FolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          selectedId === folder.id
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
            : 'hover:bg-gray-100 text-gray-800'
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => onSelect(folder)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-white/20 rounded"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        <span className="text-2xl">{folder.icon || '📁'}</span>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{folder.name}</h3>
          <p className={`text-xs ${selectedId === folder.id ? 'text-white/80' : 'text-gray-600'}`}>
            {folder._count?.notes || 0} notes
            {hasChildren && ` · ${folder._count?.children || 0} folders`}
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(folder);
            }}
            className={`p-2 rounded-lg transition-colors ${
              selectedId === folder.id
                ? 'hover:bg-white/20'
                : 'hover:bg-blue-50 text-blue-600'
            }`}
            title="Edit folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder);
            }}
            className={`p-2 rounded-lg transition-colors ${
              selectedId === folder.id
                ? 'hover:bg-white/20'
                : 'hover:bg-red-50 text-red-600'
            }`}
            title="Delete folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {folder.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FoldersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    color: '#6366f1',
    parentId: null as string | null,
  });

  const userId = user?.id || 'demo-user';

  const loadFolders = async () => {
    try {
      setError(null);
      const tree = await FoldersAPI.getFolderTree(userId);
      setFolders(tree);
    } catch (err) {
      setError('Failed to load folders');
      console.error('Error loading folders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [userId]);

  const handleCreateFolder = async () => {
    try {
      setError(null);
      const newFolder = await FoldersAPI.createFolder({
        ...formData,
        userId,
      });
      await loadFolders();
      setIsCreating(false);
      setFormData({ name: '', icon: '📁', color: '#6366f1', parentId: null });
    } catch (err) {
      setError('Failed to create folder');
      console.error('Error creating folder:', err);
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder) return;

    try {
      setError(null);
      await FoldersAPI.updateFolder(editingFolder.id, formData);
      await loadFolders();
      setIsEditing(false);
      setEditingFolder(null);
      setFormData({ name: '', icon: '📁', color: '#6366f1', parentId: null });
    } catch (err) {
      setError('Failed to update folder');
      console.error('Error updating folder:', err);
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (!confirm(`Are you sure you want to delete "${folder.name}"? Notes in this folder will not be deleted.`)) return;

    try {
      setError(null);
      await FoldersAPI.deleteFolder(folder.id);
      await loadFolders();
      if (selectedFolder?.id === folder.id) {
        setSelectedFolder(null);
      }
    } catch (err) {
      setError('Failed to delete folder');
      console.error('Error deleting folder:', err);
    }
  };

  const openEditModal = (folder: Folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      icon: folder.icon || '📁',
      color: folder.color || '#6366f1',
      parentId: folder.parentId || null,
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading folders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Folders
            </h1>
            <p className="text-gray-700 font-medium">Organize your notes into folders</p>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', icon: '📁', color: '#6366f1', parentId: selectedFolder?.id || null });
              setIsCreating(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Folder
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folder Tree */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Folder Structure</h2>
          
          {folders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No folders yet</h3>
              <p className="text-gray-700 mb-6">Create your first folder to organize your notes</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Create Your First Folder
              </button>
            </div>
          ) : (
            <div className="space-y-2 group">
              {folders.map((folder) => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  level={0}
                  onSelect={setSelectedFolder}
                  onEdit={openEditModal}
                  onDelete={handleDeleteFolder}
                  selectedId={selectedFolder?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Folder Details */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Folder Details</h2>
          
          {selectedFolder ? (
            <div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <span className="text-5xl">{selectedFolder.icon || '📁'}</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedFolder.name}</h3>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    {selectedFolder._count?.notes || 0} notes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/notes?folder=${selectedFolder.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Notes
                </button>

                <button
                  onClick={() => openEditModal(selectedFolder)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Folder
                </button>

                <button
                  onClick={() => handleDeleteFolder(selectedFolder)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Folder
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Select a folder to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Folder Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Folder' : 'Create New Folder'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setEditingFolder(null);
                  setFormData({ name: '', icon: '📁', color: '#6366f1', parentId: null });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter folder name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setEditingFolder(null);
                    setFormData({ name: '', icon: '📁', color: '#6366f1', parentId: null });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? handleUpdateFolder : handleCreateFolder}
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditing ? 'Update Folder' : 'Create Folder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

