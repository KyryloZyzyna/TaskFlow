import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Crown } from 'lucide-react';
import { boardAPI } from '../../services/api';
import type { BoardMember } from '../../types';

interface MembersPanelProps {
  boardId: string;
  isOwner: boolean;
  onClose: () => void;
}

export default function MembersPanel({ boardId, isOwner, onClose }: MembersPanelProps) {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  const fetchMembers = async () => {
    try {
      const response = await boardAPI.getMembers(boardId);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await boardAPI.inviteMember(boardId, email);
      setEmail('');
      await fetchMembers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the board?')) return;

    try {
      await boardAPI.removeMember(boardId, userId);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Board Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Invite Form (only for owner) */}
        {isOwner && (
          <div className="p-6 border-b bg-gray-50">
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite by email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="colleague@example.com"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {isLoading ? 'Inviting...' : 'Invite Member'}
              </button>
            </form>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {(member.user.name || member.user.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {member.user.email}
                    </p>
                  </div>
                  {member.isOwner && (
                    <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                      <Crown size={16} />
                      Owner
                    </span>
                  )}
                </div>
                {isOwner && !member.isOwner && (
                  <button
                    onClick={() => handleRemove(member.user.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}