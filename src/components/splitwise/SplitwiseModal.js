import React, { useState, useEffect } from 'react';
import GroupList from './GroupList';
import CreateGroupModal from './CreateGroupModal';
import GroupDetailView from './GroupDetailView';

const SplitwiseModal = ({ isOpen, onClose }) => {
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'

  // Load groups from localStorage on component mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('splitwise_groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem('splitwise_groups', JSON.stringify(groups));
  }, [groups]);

  const handleCreateGroup = (newGroup) => {
    const groupWithId = {
      ...newGroup,
      id: `group_${Date.now()}`,
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setGroups([...groups, groupWithId]);
    setShowCreateGroup(false);
  };

  const handleUpdateGroup = (updatedGroup) => {
    setGroups(groups.map(group => 
      group.id === updatedGroup.id 
        ? { ...updatedGroup, updatedAt: new Date().toISOString() }
        : group
    ));
  };

  const handleDeleteGroup = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
    setSelectedGroup(null);
    setView('list');
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setView('list');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            {view === 'detail' && (
              <button
                onClick={handleBackToList}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'list' ? 'Split Expenses' : selectedGroup?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {view === 'list' ? (
            <GroupList
              groups={groups}
              onSelectGroup={handleSelectGroup}
              onCreateGroup={() => setShowCreateGroup(true)}
              onDeleteGroup={handleDeleteGroup}
            />
          ) : (
            <GroupDetailView
              group={selectedGroup}
              onUpdateGroup={handleUpdateGroup}
              onBack={handleBackToList}
            />
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <CreateGroupModal
            isOpen={showCreateGroup}
            onClose={() => setShowCreateGroup(false)}
            onCreateGroup={handleCreateGroup}
          />
        )}
      </div>
    </div>
  );
};

export default SplitwiseModal;
