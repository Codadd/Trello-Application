import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';


// Modern professional column colors
const getColumnColor = (title) => {
  const t = title.toLowerCase();

  if (t.includes('upcoming'))
    return 'bg-gradient-to-br from-blue-50 to-blue-100';

  if (t.includes('progress') || t.includes('doing'))
    return 'bg-gradient-to-br from-violet-50 to-purple-100';

  if (t.includes('done') || t.includes('complete'))
    return 'bg-gradient-to-br from-emerald-50 to-green-100';

  return 'bg-gradient-to-br from-gray-50 to-gray-100';
};

const getBorderColor = (title) => {
  const t = title.toLowerCase();

  if (t.includes('upcoming')) return 'border-blue-200';
  if (t.includes('progress') || t.includes('doing')) return 'border-purple-200';
  if (t.includes('done') || t.includes('complete')) return 'border-green-200';

  return 'border-gray-200';
};

const getHeaderColor = (title) => {
  const t = title.toLowerCase();

  if (t.includes('upcoming')) return 'text-blue-700';
  if (t.includes('progress') || t.includes('doing')) return 'text-purple-700';
  if (t.includes('done') || t.includes('complete')) return 'text-emerald-700';

  return 'text-gray-700';
};


export default function List({
  list,
  cards,
  onDeleteList,
  onUpdateList,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);


  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Make the cards container droppable
  const { setNodeRef: setCardsContainerRef, isOver: isCardsContainerOver } = useDroppable({
    id: `list-${list.id}`,
    data: {
      type: 'list-container',
      listId: list.id,
    },
  });


  const handleAddCard = async (e) => {
    e.preventDefault();

    if (!newCardTitle.trim()) return;

    try {
      await onAddCard(newCardTitle.trim(), newCardDesc.trim());

      setNewCardTitle('');
      setNewCardDesc('');
      setShowAddCard(false);

    } catch (error) {
      console.error('Error adding card:', error);
    }
  };


  const handleUpdateTitle = async (e) => {
    e.preventDefault();

    if (!editTitle.trim()) return;

    if (editTitle.trim() !== list.title) {
      await onUpdateList({ title: editTitle.trim() });
    }

    setIsEditing(false);
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
  flex-shrink-0
  w-64 sm:w-72 md:w-80 lg:w-[320px]

  ${getColumnColor(list.title)}

  rounded-xl
  border ${getBorderColor(list.title)}

  shadow-sm hover:shadow-md

  flex flex-col

  max-h-[calc(100vh-160px)]

`}
    >

      {/* Header */}
      <div
        className="
          px-3 py-2
          flex items-center justify-between
          group
          border-b border-white/40
          bg-white/50 backdrop-blur-sm
          rounded-t-2xl
        "
      >
        {/* Drag handle - small grip icon on the left */}
        <div
          {...attributes}
          {...listeners}
          className="
            cursor-grab active:cursor-grabbing
            p-1
            mr-2
            text-gray-400
            hover:text-gray-600
          "
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        {isEditing ? (

          <form onSubmit={handleUpdateTitle} className="flex-1">

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              onBlur={handleUpdateTitle}
              className="
                w-full
                px-3 py-2
                border border-indigo-400
                rounded-lg
                outline-none
                focus:ring-2 focus:ring-indigo-400
                font-semibold
                text-gray-800
                bg-white
              "
            />

          </form>

        ) : (

          <h3
            onClick={() => setIsEditing(true)}
            className={`
              font-semibold
              cursor-pointer
              flex-1
              px-2 py-1
              rounded-lg
              hover:bg-white/60
              transition
              ${getHeaderColor(list.title)}
            `}
          >

            {list.title}

            <span className="
              ml-2
              text-xs
              bg-white/70
              text-gray-600
              px-2 py-0.5
              rounded-full
              font-medium
            ">
              {cards.length}
            </span>

          </h3>

        )}


        <button
          onClick={() => setIsEditing(true)}
          className="
            text-gray-400
            hover:text-indigo-500
            p-2
            rounded-lg
            opacity-0 group-hover:opacity-100
            transition
          "
          title="Edit list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={onDeleteList}
          className="
            text-gray-400
            hover:text-red-500
            p-2
            rounded-lg
            opacity-0 group-hover:opacity-100
            transition
          "
          title="Delete list"
        >
          ✕
        </button>

      </div>


      {/* Cards */}
      <div 
        ref={setCardsContainerRef}
        className={`
          flex-1
          overflow-y-auto
          px-2 py-2
          flex flex-col gap-2
          ${isCardsContainerOver ? 'bg-indigo-50/50' : ''}
        `}
      >

        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >

          {cards.map((card) => (

            <Card
              key={card.id}
              card={card}
              listId={list.id}
              onDelete={() => onDeleteCard(card.id)}
              onUpdate={(updates) =>
                onUpdateCard(card.id, updates)
              }
            />

          ))}

        </SortableContext>

      </div>


      {/* Add Card */}
      <div className="
        px-2 py-2
        border-t border-white/40
        bg-white/40 backdrop-blur-sm
        rounded-b-2xl
      ">

        {showAddCard ? (

          <form
            onSubmit={handleAddCard}
            className="bg-white rounded-xl p-3 shadow-inner"
          >

            <input
              value={newCardTitle}
              onChange={(e) =>
                setNewCardTitle(e.target.value)
              }
              placeholder="Card title..."
              autoFocus
              className="
                w-full
                px-3 py-2
                border border-gray-200
                rounded-lg
                outline-none
                focus:ring-2 focus:ring-indigo-400
                mb-2
              "
            />


            <textarea
              value={newCardDesc}
              onChange={(e) =>
                setNewCardDesc(e.target.value)
              }
              placeholder="Description..."
              rows={2}
              className="
                w-full
                px-3 py-2
                border border-gray-200
                rounded-lg
                outline-none
                focus:ring-2 focus:ring-indigo-400
                mb-2
              "
            />


            <div className="flex gap-2">

              <button
                type="submit"
                className="
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  px-4 py-2
                  rounded-lg
                  text-sm
                  font-semibold
                  shadow
                "
              >
                Add
              </button>


              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="
                  px-3 py-2
                  text-gray-500
                  hover:text-gray-700
                "
              >
                Cancel
              </button>

            </div>

          </form>

        ) : (

          <button
            onClick={() => setShowAddCard(true)}
            className="
              w-full
              text-gray-600 hover:text-indigo-600
              hover:bg-white/70
              px-3 py-2
              rounded-lg
              text-sm font-medium
              border border-dashed border-gray-300
              hover:border-indigo-400
              transition
            "
          >
            + Add a card
          </button>

        )}

      </div>

    </div>
  );
}