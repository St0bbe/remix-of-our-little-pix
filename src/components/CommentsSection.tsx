import { useState, useMemo } from 'react';
import { Comment } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, User, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { commentSchema, sanitizeText } from '@/lib/validation';
import { toast } from 'sonner';

interface CommentsSectionProps {
  comments: Comment[];
  currentUserEmail: string;
  onAddComment: (text: string, parentId?: string) => void;
}

interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

export const CommentsSection = ({ comments, currentUserEmail, onAddComment }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  // Organize comments into threads
  const threads = useMemo((): CommentThread[] => {
    const parentComments = comments.filter(c => !c.parentId);
    return parentComments.map(parent => ({
      comment: parent,
      replies: comments.filter(c => c.parentId === parent.id)
    }));
  }, [comments]);

  const handleSubmit = () => {
    const result = commentSchema.safeParse(newComment);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onAddComment(sanitizeText(result.data));
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    const result = commentSchema.safeParse(replyText);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onAddComment(sanitizeText(result.data), parentId);
    setReplyText('');
    setReplyingTo(null);
    // Auto-expand the thread after replying
    setExpandedThreads(prev => new Set([...prev, parentId]));
  };

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const getUserName = (email: string) => {
    return email.split('@')[0];
  };

  const totalComments = comments.length;

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`p-2 rounded-lg text-sm ${
        comment.userEmail === currentUserEmail
          ? 'bg-primary/10'
          : 'bg-secondary/50'
      } ${isReply ? 'ml-6 border-l-2 border-primary/20' : ''}`}
    >
      <div className="flex items-center gap-1 mb-1">
        <User className="w-3 h-3" />
        <span className="font-medium capitalize text-xs">
          {getUserName(comment.userEmail)}
        </span>
        <span className="text-muted-foreground text-xs">
          · {format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: ptBR })}
        </span>
      </div>
      <p className="text-foreground break-words">{comment.text}</p>
      {!isReply && (
        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors"
        >
          <Reply className="w-3 h-3" />
          Responder
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>
          {totalComments === 0
            ? 'Adicionar comentário'
            : `${totalComments} comentário${totalComments !== 1 ? 's' : ''}`}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Threads list */}
          {threads.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {threads.map((thread) => (
                <div key={thread.comment.id} className="space-y-2">
                  {renderComment(thread.comment)}
                  
                  {/* Replies toggle */}
                  {thread.replies.length > 0 && (
                    <button
                      onClick={() => toggleThread(thread.comment.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 ml-6 transition-colors"
                    >
                      {expandedThreads.has(thread.comment.id) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {thread.replies.length} resposta{thread.replies.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  
                  {/* Expanded replies */}
                  {expandedThreads.has(thread.comment.id) && (
                    <div className="space-y-2 animate-fade-in">
                      {thread.replies.map(reply => renderComment(reply, true))}
                    </div>
                  )}
                  
                  {/* Reply input */}
                  {replyingTo === thread.comment.id && (
                    <div className="flex gap-2 ml-6 animate-fade-in">
                      <Textarea
                        placeholder={`Responder a ${getUserName(thread.comment.userEmail)}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[50px] text-sm"
                        maxLength={500}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(thread.comment.id);
                          }
                          if (e.key === 'Escape') {
                            setReplyingTo(null);
                            setReplyText('');
                          }
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleReply(thread.comment.id)}
                          disabled={!replyText.trim()}
                          className="h-auto py-2"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="h-auto py-1 text-xs"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new comment */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] text-sm"
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="h-auto"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {newComment.length}/500
          </p>
        </div>
      )}
    </div>
  );
};
