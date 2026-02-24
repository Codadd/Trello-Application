import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// Modern pastel label colors
const LABEL_COLORS = {
  Marketing: 'bg-orange-100 text-orange-700',
  Design: 'bg-purple-100 text-purple-700',
  Legal: 'bg-green-100 text-green-700',
  Sales: 'bg-blue-100 text-blue-700',
  Urgent: 'bg-red-100 text-red-700',
  Feature: 'bg-indigo-100 text-indigo-700',
};


export default function Card({ card, listId, onDelete, onUpdate }) {

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDesc, setEditDesc] = useState(card.description || '');
  
  // Track if we're dragging to prevent click events during drag
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      listId,
    },
    disabled: isEditing, // Disable drag when editing
  });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };


  // Handle click - prevent opening edit mode immediately after drag
  const handleClick = (e) => {
    // If we're currently dragging or just finished dragging, don't open edit
    const timeSinceDrag = dragStartTimeRef.current 
      ? Date.now() - dragStartTimeRef.current 
      : 1000;
    
    if (timeSinceDrag < 200) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    setIsEditing(true);
  };

  // Handle mouse down to track when drag starts
  const handleMouseDown = (e) => {
    dragStartTimeRef.current = Date.now();
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
  };


  const handleSave = () => {

    if (!editTitle.trim()) return;

    onUpdate({
      title: editTitle.trim(),
      description: editDesc.trim(),
    });

    setIsEditing(false);
  };


  const handleCancel = () => {

    setEditTitle(card.title);
    setEditDesc(card.description || '');
    setIsEditing(false);
  };



  /* ---------------- EDIT MODE ---------------- */

  if (isEditing) {

    return (

      <div
        ref={setNodeRef}
        style={style}
        className="
          bg-white
          rounded-xl
          shadow-lg
          border border-indigo-200
          p-4
        "
      >

        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          autoFocus
          className="
            w-full
            px-3 py-2
            border border-gray-200
            rounded-lg
            focus:ring-2 focus:ring-indigo-400
            outline-none
            font-semibold
            mb-2
          "
        />

        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          rows={3}
          placeholder="Description..."
          className="
            w-full
            px-3 py-2
            border border-gray-200
            rounded-lg
            focus:ring-2 focus:ring-indigo-400
            outline-none
            text-sm
            mb-3
          "
        />

        <div className="flex gap-2">

          <button
            onClick={handleSave}
            className="
              bg-indigo-600 hover:bg-indigo-700
              text-white
              px-4 py-2
              rounded-lg
              text-sm font-semibold
            "
          >
            Save
          </button>


          <button
            onClick={handleCancel}
            className="
              text-gray-500 hover:text-gray-700
              px-3 py-2
            "
          >
            Cancel
          </button>

        </div>

      </div>

    );
  }



  /* ---------------- NORMAL MODE ---------------- */

  // Get labels from card data, fallback to empty array
  const cardLabels = card.labels || [];

  return (

  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    onClick={handleClick}
    onPointerDown={handleMouseDown}
    className="
      relative

      group

      bg-white

      rounded-lg

      border border-gray-200
      hover:border-indigo-300

      shadow-sm
      hover:shadow-md

      transition-all duration-150

      cursor-grab active:cursor-grabbing

      w-full
    "
  >

    <div className="px-3 py-2">


      {/* Labels - show actual card labels */}
      {cardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">

          {cardLabels.map((label, index) => (

            <span
              key={index}
              className={`
                px-2
                py-[2px]

                rounded

                text-[10px]
                font-medium

                ${LABEL_COLORS[label] || 'bg-gray-100 text-gray-700'}
              `}
            >
              {label}
            </span>

          ))}

        </div>
      )}



      {/* Title */}
      <h4
        className="
          text-sm
          font-medium

          text-gray-800

          hover:text-indigo-600
        "
      >
        {card.title}
      </h4>



      {/* Description */}
      {card.description && (

        <p className="
          text-xs
          text-gray-500

          mt-1

          line-clamp-2
        ">
          {card.description}
        </p>

      )}



      {/* Footer */}
      <div className="
        flex items-center justify-between

        mt-2
      ">

        {/* Empty footer - no date or avatar by default */}

      </div>


      {/* Actions */}
      <div className="
        absolute

        top-1.5 right-1.5

        opacity-0
        group-hover:opacity-100

        flex gap-1

        transition
      ">

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="
            w-6 h-6

            flex items-center justify-center

            rounded

            hover:bg-gray-100

            text-xs
          "
        >
          ✏️
        </button>


        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="
            w-6 h-6

            flex items-center justify-center

            rounded

            hover:bg-red-100

            text-xs
          "
        >
          🗑️
        </button>

      </div>


    </div>

  </div>

);
}