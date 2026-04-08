import React, { useState } from "react";
import { Comment } from "../data/mockData";
import { Send, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface CommentSectionProps {
  comments: Comment[];
  courseId: string;
}

export function CommentSection({ comments: initialComments, courseId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;
    
    const comment: Comment = {
      id: "com_" + Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      username: session.user.email?.split('@')[0] || "User",
      avatarSeed: session.user.id,
      text: newComment,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...comment, courseId })
      }).catch(() => ({ ok: false, status: 404 }));

      if (res.ok) {
        setComments([comment, ...comments]);
        setNewComment("");
      } else {
        // Fallback for non-ok responses
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment", err);
      // Fallback
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' }).catch(() => ({ ok: false, status: 404 }));
      if (res.ok) {
        setComments(comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      } else {
        // Fallback for non-ok responses
        setComments(comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      }
    } catch (err) {
      console.error("Failed to like comment", err);
      // Fallback
      setComments(comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    }
  };

  return (
    <div className="bg-bg-secondary p-8 space-y-8 rounded-xl border border-border-primary">
      <h3 className="text-lg font-semibold text-text-primary flex items-center gap-3">
        Discussion <span className="text-text-secondary text-sm bg-bg-primary px-3 py-1 rounded-md border border-border-secondary">{comments.length}</span>
      </h3>

      {/* Input Area */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start">
          <img 
            src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.id}
            alt="Your Avatar" 
            className="w-10 h-10 rounded-full bg-bg-primary border border-border-secondary"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="w-full pl-4 pr-12 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-border-hover focus:border-border-hover transition-all outline-none text-text-primary placeholder-text-muted text-sm"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-bg-inverted text-text-inverted rounded-md hover:bg-bg-inverted-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-bg-primary rounded-md text-center text-text-secondary font-medium border border-border-secondary border-dashed text-sm">
          Please sign in to join the discussion.
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted font-medium bg-bg-primary rounded-md border border-border-secondary border-dashed text-sm">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div 
              key={comment.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 group bg-bg-primary p-4 rounded-md border border-border-secondary hover:border-border-hover transition-colors"
            >
              <img 
                src={comment.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + comment.avatarSeed}
                alt={comment.username} 
                className="w-10 h-10 rounded-full bg-bg-secondary border border-border-secondary flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-text-primary text-sm">{comment.username}</span>
                  <span className="text-[10px] font-medium text-text-muted">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-text-secondary text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {comment.text}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
