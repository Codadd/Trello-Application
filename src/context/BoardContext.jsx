import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc,
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const BoardContext = createContext();

export function useBoard() {
  return useContext(BoardContext);
}

export function BoardProvider({ children }) {
  const { currentUser } = useAuth();
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState({});
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch boards once on mount (not real-time)
  useEffect(() => {
    if (!currentUser) {
      setBoards([]);
      setLoading(false);
      return;
    }

    const fetchBoards = async () => {
      try {
        const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
        const q = query(boardsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        
        const boardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBoards(boardsData);
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
      setLoading(false);
    };

    fetchBoards();
  }, [currentUser]);

  // Board operations
  const createBoard = async (title, description = '') => {
    if (!currentUser) return;
    
    const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
    
    // Get current max order
    const maxOrder = boards.length > 0 
      ? Math.max(...boards.map(b => b.order || 0)) 
      : -1;
    
    const docRef = await addDoc(boardsRef, {
      title,
      description,
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create default lists: Upcoming, In Progress, Done
    const defaultLists = ['Upcoming', 'In Progress', 'Done'];
    const listsRef = collection(db, 'users', currentUser.uid, 'boards', docRef.id, 'lists');
    
    for (let i = 0; i < defaultLists.length; i++) {
      await addDoc(listsRef, {
        title: defaultLists[i],
        order: i,
        createdAt: serverTimestamp()
      });
    }

    // Refresh boards after creating
    const q = query(boardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const boardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBoards(boardsData);

    return docRef.id;
  };

  const updateBoard = async (boardId, updates) => {
    if (!currentUser) return;
    
    const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
    await updateDoc(boardRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    // Refresh boards after updating
    const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
    const q = query(boardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const boardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBoards(boardsData);
  };

  const deleteBoard = async (boardId) => {
    if (!currentUser) return;
    
    const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
    await deleteDoc(boardRef);
    
    // Refresh boards after deleting
    const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
    const q = query(boardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const boardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBoards(boardsData);
  };

  // List operations - using one-time fetch
  const fetchLists = useCallback(async (boardId) => {
    if (!currentUser) return;

    try {
      const listsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists');
      const q = query(listsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const listsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLists(prev => ({ ...prev, [boardId]: listsData }));
      return listsData;
    } catch (error) {
      console.error('Error fetching lists:', error);
      return [];
    }
  }, [currentUser]);

  const createList = async (boardId, title) => {
    if (!currentUser) return;
    
    const listsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists');
    
    // Get current max order
    const currentLists = lists[boardId] || [];
    const maxOrder = currentLists.length > 0 
      ? Math.max(...currentLists.map(l => l.order || 0)) 
      : -1;
    
    const docRef = await addDoc(listsRef, {
      title,
      order: maxOrder + 1,
      createdAt: serverTimestamp()
    });
    
    // Refresh lists after creating
    const q = query(listsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const listsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLists(prev => ({ ...prev, [boardId]: listsData }));
    
    return docRef.id;
  };

  const updateList = async (boardId, listId, updates) => {
    if (!currentUser) return;
    
    const listRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId);
    await updateDoc(listRef, updates);
    
    // Refresh lists after updating
    const listsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists');
    const q = query(listsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const listsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLists(prev => ({ ...prev, [boardId]: listsData }));
  };

  const deleteList = async (boardId, listId) => {
    if (!currentUser) return;
    
    const listRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId);
    await deleteDoc(listRef);
    
    // Refresh lists after deleting
    const listsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists');
    const q = query(listsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const listsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLists(prev => ({ ...prev, [boardId]: listsData }));
  };

  // Card operations - using one-time fetch
  const fetchCards = useCallback(async (boardId, listId) => {
    if (!currentUser) return;

    try {
      const cardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards');
      const q = query(cardsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const cardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Prevent duplicate keys: deduplicate by ID
      const uniqueCards = cardsData.reduce((acc, card) => {
        if (!acc.find(c => c.id === card.id)) {
          acc.push(card);
        }
        return acc;
      }, []);
      
      setCards(prev => ({ 
        ...prev, 
        [listId]: uniqueCards 
      }));
      
      return uniqueCards;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  }, [currentUser]);

  const createCard = async (boardId, listId, title, description = '') => {
    if (!currentUser) return;
    
    const cardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards');
    
    // Get current max order
    const currentCards = cards[listId] || [];
    const maxOrder = currentCards.length > 0 
      ? Math.max(...currentCards.map(c => c.order || 0)) 
      : -1;
    
    const docRef = await addDoc(cardsRef, {
      title,
      description,
      order: maxOrder + 1,
      createdAt: serverTimestamp()
    });
    
    // Refresh cards after creating
    const q = query(cardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const cardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCards(prev => ({ ...prev, [listId]: cardsData }));
    
    return docRef.id;
  };

  const updateCard = async (boardId, listId, cardId, updates) => {
    if (!currentUser) return;
    
    const cardRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards', cardId);
    await updateDoc(cardRef, updates);
    
    // Refresh cards after updating
    const cardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards');
    const q = query(cardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const cardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCards(prev => ({ ...prev, [listId]: cardsData }));
  };

  const deleteCard = async (boardId, listId, cardId) => {
    if (!currentUser) return;
    
    const cardRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards', cardId);
    await deleteDoc(cardRef);
    
    // Refresh cards after deleting
    const cardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards');
    const q = query(cardsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const cardsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCards(prev => ({ ...prev, [listId]: cardsData }));
  };

  // Move card to a different list
  const moveCard = async (boardId, sourceListId, destListId, cardId, newOrder) => {
    if (!currentUser) return;

    // Get the card data
    const card = cards[sourceListId]?.find(c => c.id === cardId);
    if (!card) return;

    // Prevent duplicate keys: check if card already exists in destination
    if (sourceListId !== destListId) {
      const destCards = cards[destListId] || [];
      const cardAlreadyInDest = destCards.some(c => c.id === cardId);
      if (cardAlreadyInDest) {
        console.warn('Card already exists in destination list, skipping move');
        return;
      }
    }

    // Optimistic UI update - immediately update local state
    setCards(prev => {
      const newCards = { ...prev };
      
      // Get source and destination cards
      const sourceCards = [...(newCards[sourceListId] || [])];
      const destCards = sourceListId === destListId 
        ? sourceCards 
        : [...(newCards[destListId] || [])];

      // Find the card in source list
      const cardIndex = sourceCards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      // Remove card from source list
      const [movedCard] = sourceCards.splice(cardIndex, 1);

      if (sourceListId === destListId) {
        // Same list - reorder
        const overIndex = destCards.findIndex(c => c.id === newOrder);
        const insertIndex = overIndex === -1 ? destCards.length : overIndex;
        destCards.splice(insertIndex, 0, movedCard);
        
        // Update order for all cards
        destCards.forEach((c, i) => c.order = i);
        newCards[sourceListId] = destCards;
      } else {
        // Different list - move to destination
        const overIndex = destCards.findIndex(c => c.id === newOrder);
        const insertIndex = overIndex === -1 ? destCards.length : overIndex;
        
        // Create a new card object with updated order (keep same ID)
        const movedCardWithOrder = { ...movedCard, order: insertIndex };
        destCards.splice(insertIndex, 0, movedCardWithOrder);

        // Update order for destination cards after insert point
        destCards.forEach((c, i) => {
          if (i > insertIndex) c.order = i;
        });

        // Update order for source cards
        sourceCards.forEach((c, i) => c.order = i);

        newCards[sourceListId] = sourceCards;
        newCards[destListId] = destCards;
      }

      return newCards;
    });

    // Now perform the Firestore operations
    // To preserve the card ID, we use setDoc to copy to destination, then delete from source
    
    if (sourceListId === destListId) {
      // Same list - just reorder, already handled by optimistic update
      await reorderCards(boardId, sourceListId);
    } else {
      // Different list - copy to destination with SAME ID, then delete from source
      const destCardsRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', destListId, 'cards', cardId);
      
      await setDoc(destCardsRef, {
        title: card.title,
        description: card.description,
        order: newOrder,
        labels: card.labels || [],
        createdAt: card.createdAt // Preserve original creation time
      });

      // Delete from source list
      const sourceCardsRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', sourceListId, 'cards', cardId);
      await deleteDoc(sourceCardsRef);

      // Reorder remaining cards in both lists
      await reorderCards(boardId, sourceListId);
      await reorderCards(boardId, destListId);
    }
    
    // Refresh cards after moving
    const sourceCardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', sourceListId, 'cards');
    const sourceQ = query(sourceCardsRef, orderBy('order', 'asc'));
    const sourceSnapshot = await getDocs(sourceQ);
    const sourceCardsData = sourceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const destCardsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists', destListId, 'cards');
    const destQ = query(destCardsRef, orderBy('order', 'asc'));
    const destSnapshot = await getDocs(destQ);
    const destCardsData = destSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setCards(prev => ({
      ...prev,
      [sourceListId]: sourceCardsData,
      [destListId]: destCardsData
    }));
  };

  // Reorder cards in a list
  const reorderCards = async (boardId, listId) => {
    const listCards = cards[listId] || [];
    
    for (let i = 0; i < listCards.length; i++) {
      const card = listCards[i];
      if (card.order !== i) {
        const cardRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', listId, 'cards', card.id);
        await updateDoc(cardRef, { order: i });
      }
    }
  };

  // Reorder lists
  const reorderLists = async (boardId, newOrder) => {
    for (let i = 0; i < newOrder.length; i++) {
      const list = newOrder[i];
      if (list.order !== i) {
        const listRef = doc(db, 'users', currentUser.uid, 'boards', boardId, 'lists', list.id);
        await updateDoc(listRef, { order: i });
      }
    }
    
    // Refresh lists after reordering
    const listsRef = collection(db, 'users', currentUser.uid, 'boards', boardId, 'lists');
    const q = query(listsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const listsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLists(prev => ({ ...prev, [boardId]: listsData }));
  };

  const value = {
    boards,
    currentBoard,
    setCurrentBoard,
    lists,
    cards,
    loading,
    createBoard,
    updateBoard,
    deleteBoard,
    fetchLists,
    createList,
    updateList,
    deleteList,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
    reorderLists
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}
