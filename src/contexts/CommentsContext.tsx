import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface CommentsContextType {
  comments: Comment[];
  addComment: (productId: string, content: string) => Comment | null;
  getCommentsByProduct: (productId: string) => Comment[];
  deleteComment: (id: string) => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

const COMMENTS_KEY = 'yeni_nefes_comments';

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedComments = localStorage.getItem(COMMENTS_KEY);
    if (storedComments) {
      try {
        setComments(JSON.parse(storedComments));
      } catch {
        localStorage.removeItem(COMMENTS_KEY);
      }
    }
  }, []);

  const saveComments = (newComments: Comment[]) => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(newComments));
    setComments(newComments);
  };

  const addComment = (productId: string, content: string): Comment | null => {
    if (!user) return null;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      productId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    };
    
    saveComments([...comments, newComment]);
    return newComment;
  };

  const getCommentsByProduct = (productId: string): Comment[] => {
    return comments
      .filter(comment => comment.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const deleteComment = (id: string) => {
    if (!user) return;
    const comment = comments.find(c => c.id === id);
    if (comment && comment.userId === user.id) {
      saveComments(comments.filter(c => c.id !== id));
    }
  };

  return (
    <CommentsContext.Provider value={{ comments, addComment, getCommentsByProduct, deleteComment }}>
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
