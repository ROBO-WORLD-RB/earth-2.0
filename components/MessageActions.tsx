import React from 'react';
import CopyIcon from './icons/CopyIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import RegenerateIcon from './icons/RegenerateIcon';

interface MessageActionsProps {
  isModel: boolean;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onRegenerate?: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ 
  isModel, 
  onCopy, 
  onEdit, 
  onDelete,
  onRegenerate
}) => {
  return (
    <div className={`flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isModel ? 'justify-start' : 'justify-end'}`}>
      <button 
        onClick={onCopy}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm transition-all"
        title="Copy message"
      >
        <CopyIcon className="w-4 h-4" />
      </button>
      
      {!isModel && onEdit && (
        <button 
          onClick={onEdit}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm transition-all"
          title="Edit message"
        >
          <EditIcon className="w-4 h-4" />
        </button>
      )}
      
      <button 
        onClick={onDelete}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shadow-sm transition-all"
        title="Delete message"
      >
        <DeleteIcon className="w-4 h-4" />
      </button>

      {isModel && onRegenerate && (
        <button 
          onClick={onRegenerate}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all"
          title="Regenerate response"
        >
          <RegenerateIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageActions;