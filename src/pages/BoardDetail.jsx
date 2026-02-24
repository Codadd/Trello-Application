import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { useDroppable } from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import List from '../components/List';


export default function BoardDetail() {

  const { boardId } = useParams();
  const navigate = useNavigate();

  const {
    boards,
    lists,
    cards,
    fetchLists,
    fetchCards,
    createList,
    updateList,
    deleteList,
    createCard,
    deleteCard,
    updateCard,
    moveCard,
    reorderCards,
    reorderLists,
    setCurrentBoard,
  } = useBoard();


  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const [loading, setLoading] = useState(true);

  const listsContainerRef = useRef(null);


  const boardLists = lists[boardId] || [];


  /* ---------------- Fetch board ---------------- */

  useEffect(() => {

    const board = boards.find(b => b.id === boardId);

    if (board) {
      setCurrentBoard(board);
    }

  }, [boardId, boards]);


  /* ---------------- Fetch lists ---------------- */

  useEffect(() => {

    setLoading(true);

    const loadLists = async () => {
      await fetchLists(boardId);
      setLoading(false);
    };

    loadLists();

  }, [boardId, fetchLists]);


  /* ---------------- Fetch cards ---------------- */

  useEffect(() => {

    const boardLists = lists[boardId] || [];

    if (boardLists.length === 0) {
      setLoading(false);
      return;
    }

    const loadCards = async () => {
      for (const list of boardLists) {
        await fetchCards(boardId, list.id);
      }
      setLoading(false);
    };

    loadCards();

  }, [lists[boardId], boardId, fetchCards]);



  /* ---------------- Drag sensors ---------------- */

  const sensors = useSensors(

    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })

  );



  /* ---------------- Add list ---------------- */

  async function handleAddList(e) {

    e.preventDefault();

    if (!newListTitle.trim()) return;

    await createList(boardId, newListTitle);

    setNewListTitle('');
    setShowAddList(false);

  }



  /* ---------------- Drag start ---------------- */

  function handleDragStart(event) {

    const { active } = event;

    setActiveId(active.id);
    setActiveType(active.data.current?.type);

    // Track the active card for overlay
    if (active.data.current?.type === 'card') {
      const sourceListId = active.data.current?.listId;
      const card = cards[sourceListId]?.find(c => c.id === active.id);
      setActiveCard(card);
    } else {
      setActiveCard(null);
    }

  }



  /* ---------------- Drag end ---------------- */

  async function handleDragEnd(event) {

    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveCard(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;


    /* List reorder */

    if (activeData?.type === "list") {

      const oldIndex =
        boardLists.findIndex(l => l.id === active.id);

      const newIndex =
        boardLists.findIndex(l => l.id === over.id);

      if (oldIndex !== newIndex) {

        const newOrder =
          arrayMove(boardLists, oldIndex, newIndex);

        await reorderLists(boardId, newOrder);

      }

    }


    /* Card reorder / move between lists */

    if (activeData?.type === "card") {

      const sourceListId = activeData.listId;
      let destListId = overData?.listId;

      // If dropped on a card, get the listId from that card's data
      if (!destListId && overData?.type === 'card') {
        destListId = overData.listId;
      }

      // If dropped on a list container (empty list or between cards)
      if (!destListId && overData?.type === 'list-container') {
        destListId = overData.listId;
      }

      // If still no destListId, check if we're over a list element directly
      if (!destListId) {
        // Find the list that contains the drop target
        const overId = over?.id?.toString() || '';
        if (overId.startsWith('list-')) {
          destListId = overId.replace('list-', '');
        }
      }

      if (!destListId) {
        setActiveId(null);
        setActiveCard(null);
        return;
      }

      const sourceCards = cards[sourceListId] || [];
      const destCards = destListId === sourceListId ? sourceCards : (cards[destListId] || []);

      if (sourceListId === destListId) {
        // Same list - reorder
        const oldIndex = sourceCards.findIndex(c => c.id === active.id);
        const newIndex = destCards.findIndex(c => c.id === over?.id);

        if (oldIndex !== newIndex && newIndex !== -1) {
          const newOrder = arrayMove(sourceCards, oldIndex, newIndex);

          for (let i = 0; i < newOrder.length; i++) {
            await updateCard(boardId, sourceListId, newOrder[i].id, { order: i });
          }
        }
      } else {
        // Different list - move card
        const overIndex = destCards.findIndex(c => c.id === over?.id);
        const newOrder = overIndex === -1 ? destCards.length : overIndex;

        // Use moveCard from context
        await moveCard(boardId, sourceListId, destListId, active.id, newOrder);
      }

    }

    setActiveId(null);
    setActiveCard(null);

  }



  /* ---------------- Active overlay item ---------------- */

  const activeList = boardLists.find(l => l.id === activeId);
  const isDraggingCard = activeType === 'card' && activeCard;



  /* ---------------- Loader ---------------- */

  if (loading) {

    return (

      <div className="
        min-h-screen
        flex items-center justify-center
        bg-gradient-to-br
        from-slate-50 via-indigo-50 to-blue-100
      ">

        <div className="
          w-10 h-10
          border-4
          border-indigo-200
          border-t-indigo-600
          rounded-full
          animate-spin
        " />

      </div>

    );

  }



  /* ---------------- UI ---------------- */

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-50 via-indigo-50 to-blue-100
    ">



      {/* Header */}

      <div className="
        bg-white/80
        backdrop-blur-sm
        border-b border-gray-200
      ">

        <div className="px-3 sm:px-6 py-2 sm:py-3">

          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            ← Back
          </button>

          <h1 className="
            text-base sm:text-lg font-semibold
            mt-1
          ">
            {boards.find(b => b.id === boardId)?.title}
          </h1>

        </div>

      </div>



      {/* Lists */}

      <div className="pt-6 relative">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >

          <div
            ref={listsContainerRef}
            className="
              flex
              items-start
              gap-3 sm:gap-4 md:gap-5 lg:gap-6

              overflow-x-auto
              overflow-y-hidden

              min-h-[calc(100vh-140px)]
              px-3 sm:px-4 md:px-5 lg:pl-6 lg:pr-10
              pb-6

              scroll-smooth
              touch-pan-x
            "
          >



            <SortableContext
              items={boardLists.map(l => l.id)}
              strategy={horizontalListSortingStrategy}
            >

              {boardLists.map(list => (

                <List
                  key={list.id}
                  list={list}
                  cards={cards[list.id] || []}

                  onDeleteList={() =>
                    deleteList(boardId, list.id)
                  }

                  onUpdateList={(updates) =>
                    updateList(boardId, list.id, updates)
                  }

                  onAddCard={(title, desc) =>
                    createCard(boardId, list.id, title, desc)
                  }

                  onDeleteCard={(cardId) =>
                    deleteCard(boardId, list.id, cardId)
                  }

                  onUpdateCard={(cardId, updates) =>
                    updateCard(boardId, list.id, cardId, updates)
                  }

                />

              ))}

            </SortableContext>



            {/* Add List */}

            <div className="
              flex-shrink-0
              w-56 sm:w-64 md:w-72 lg:w-[320px]
              self-start
              mt-[2px]
            ">

              {showAddList ? (

                <form
                  onSubmit={handleAddList}
                  className="
                    bg-white
                    p-3
                    rounded-lg
                    shadow
                    border
                  "
                >

                  <input
                    value={newListTitle}
                    onChange={(e) =>
                      setNewListTitle(e.target.value)
                    }
                    className="
                      w-full
                      border
                      rounded
                      px-2 py-1
                    "
                    placeholder="List title"
                  />

                </form>

              ) : (

                <button
                  onClick={() =>
                    setShowAddList(true)
                  }
                  className="
                    w-full
                    bg-white/80
                    hover:bg-white

                    border border-dashed
                    rounded-lg

                    py-2

                    text-sm
                  "
                >
                  + Add another list
                </button>

              )}

            </div>

          </div>



          {/* Drag overlay */}

          <DragOverlay>

            {/* List overlay */}
            {activeList && !isDraggingCard && (

              <div className="
                w-[320px]
                bg-white
                rounded-lg
                shadow-xl
                p-2
              ">

                {activeList.title}

              </div>

            )}

            {/* Card overlay */}
            {isDraggingCard && (

              <div className="
                w-64 sm:w-72 md:w-80 lg:w-[280px]
                bg-white
                rounded-lg
                shadow-xl
                border border-indigo-200
                p-3
                cursor-grabbing
              ">

                <h4 className="text-sm font-medium text-gray-800">
                  {activeCard.title}
                </h4>

                {activeCard.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {activeCard.description}
                  </p>
                )}

              </div>

            )}

          </DragOverlay>


        </DndContext>

      </div>

    </div>

  );

}