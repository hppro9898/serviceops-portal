import { X, Lock, ChevronDown, RefreshCw, TextCursorInput, Minimize2, Wand2, ChevronRight, Briefcase, Heart, Zap, FileText, SmilePlus, MessageSquare, Search, ArrowUpDown } from 'lucide-react';
import { AiSparkle } from './AiSparkle';
import { EditorQuickActions, EditorFormattingRow, EditorSendActions } from './EditorToolbar';
import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export interface ApprovalComment { id: number; author: string; initials: string; color: string; content: string; time: string }

interface ApprovalCommentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  approvalId: string;
  approvalSubject: string;
  comments: ApprovalComment[];
  onAddComment: (comment: ApprovalComment) => void;
}

export function ApprovalCommentPopup({ isOpen, onClose, approvalId, approvalSubject, comments, onAddComment }: ApprovalCommentPopupProps) {
  const [commentContent, setCommentContent] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(false);
  const [showAIAssistMenu, setShowAIAssistMenu] = useState(false);
  const [showToneSubmenu, setShowToneSubmenu] = useState(false);
  const [showFormattingMenu, setShowFormattingMenu] = useState(false);

  const commentFormRef = useRef<HTMLDivElement>(null);
  const commentContentRef = useRef<HTMLDivElement>(null);
  const aiAssistMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiAssistMenuRef.current && !aiAssistMenuRef.current.contains(event.target as Node)) {
        setShowAIAssistMenu(false);
        setShowToneSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Selecting text in the comment editor auto-opens the formatting row (Reply-editor pattern);
  // deselecting hides it again — but ONLY when it was auto-opened. A manual T toggle sticks.
  const autoOpenedRef = useRef(false);
  const showFormattingRef = useRef(showFormattingMenu);
  showFormattingRef.current = showFormattingMenu;
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = document.getSelection();
      const el = commentContentRef.current;
      const insideSelection = !!(sel && !sel.isCollapsed && el && sel.anchorNode && el.contains(sel.anchorNode));
      if (insideSelection) {
        if (!showFormattingRef.current) {
          autoOpenedRef.current = true;
          setShowFormattingMenu(true);
        }
      } else if (autoOpenedRef.current && showFormattingRef.current) {
        autoOpenedRef.current = false;
        setShowFormattingMenu(false);
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = commentContent.replace(/<[^>]*>/g, '').trim();
    if (!text) return; // don't add empty comments
    const now = new Date();
    onAddComment({
      id: now.getTime(),
      author: 'Rakesh Rathod',
      initials: 'RR',
      color: '#3D8BD0',
      content: commentContent,
      time: now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
    });
    setCommentContent('');
    if (commentContentRef.current) {
      commentContentRef.current.innerHTML = '';
    }
    // keep the popup open so the user sees their comment appear
  };

  // Search + sort (newest-first toggle) applied to the comment thread.
  const strip = (html: string) => html.replace(/<[^>]*>/g, ' ');
  const q = commentSearch.trim().toLowerCase();
  const filteredComments = q ? comments.filter((c) => strip(c.content).toLowerCase().includes(q)) : comments;
  const visibleComments = sortNewestFirst ? [...filteredComments].reverse() : filteredComments;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-end">
      <div className="bg-white shadow-xl w-[600px] h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#DFE5ED] flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[#364658]">Comments</h3>
            <p className="text-[#7B8FA5] text-[14px]">{approvalSubject}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[#7B8FA5] hover:text-[#364658]" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search + sort toolbar (shown once there are comments) */}
        {comments.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[#DFE5ED] flex items-center gap-2 flex-shrink-0">
            <div className="flex-1 flex items-center gap-2 h-9 px-3 border border-[#DFE5ED] rounded bg-white">
              <Search size={15} className="text-[#7B8FA5] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search comments..."
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                className="outline-none text-sm bg-transparent placeholder:text-[#9CA3AF] text-[#364658] flex-1 min-w-0"
              />
              {commentSearch && (
                <button className="p-0.5 hover:bg-[#F5F7FA] rounded flex-shrink-0" onClick={() => setCommentSearch('')}>
                  <X size={14} className="text-[#7B8FA5]" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSortNewestFirst((s) => !s)}
              title={sortNewestFirst ? 'Newest first' : 'Oldest first'}
              className="size-8 flex items-center justify-center border border-[#DFE5ED] rounded text-[#7B8FA5] hover:bg-[#F5F7FA] hover:text-[#364658] transition-colors flex-shrink-0"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>
        )}

        {/* Comment Form Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center justify-center size-14 rounded-full bg-[#F5F7FA] mb-3">
                <MessageSquare className="size-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[13px] text-[#7B8FA5]">No comments yet. Start the conversation below.</p>
            </div>
          ) : visibleComments.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-[#7B8FA5]">No comments match your search.</div>
          ) : (
            <div className="space-y-5">
              {visibleComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="size-[26px] rounded flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ backgroundColor: c.color }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#364658]">{c.author}</span>
                      <span className="text-xs text-[#7B8FA5]">{c.time}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F5F7FA] text-[#7B8FA5] text-xs rounded font-medium cursor-help">
                            <Lock className="size-3" />
                            Internal
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Not Visible to Requester
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div
                      className="bg-[rgba(245,133,24,0.10)] rounded-lg border-l-2 border-[#F58518] p-4 mt-1 text-sm text-[#364658] leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: c.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Form - Fixed at Bottom */}
        <div className="p-4 border-t border-[#DFE5ED]">
          <div className="border-2 border-[#3D8BD0] rounded-lg bg-white shadow-sm" ref={commentFormRef}>
            {/* Comment Form */}
            <div className="p-4">
              {/* Text Area — uncontrolled contentEditable (never re-write its HTML while typing,
                  or the caret jumps to the start and text appears reversed) */}
              <div className="mb-4">
                <div
                  ref={commentContentRef}
                  contentEditable
                  suppressContentEditableWarning
                  dir="ltr"
                  onInput={(e) => setCommentContent(e.currentTarget.innerHTML)}
                  className={`w-full min-h-[100px] text-sm text-[#364658] text-left focus:outline-none bg-transparent empty:before:content-[attr(data-placeholder)] empty:before:text-[#9CA3AF] ${showFormattingMenu ? 'pb-14' : ''}`}
                  data-placeholder="Start typing your comment..."
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              </div>

              {/* Formatting row — revealed by the Text-formatting toggle; FLOATS above the toolbar
                  (absolute within this relative wrapper) so the editor height never jumps */}
              <div className="relative">
              {showFormattingMenu && <EditorFormattingRow />}

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between">
                {/* Left Side - AI Assist and Formatting Tools */}
                <div className="flex items-center gap-1">
                  <div className="relative" ref={aiAssistMenuRef}>
                    <button 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#F0F8FF] text-xs font-medium text-[#364658]"
                      style={{ background: 'linear-gradient(90deg, rgba(76, 177, 254, 0.12) 0%, rgba(115, 30, 251, 0.12) 41.49%, rgba(249, 17, 227, 0.12) 100%), var(--Core-White, #FFF)' }}
                      onClick={() => setShowAIAssistMenu(!showAIAssistMenu)}
                    >
                      <AiSparkle size={14} />
                      <span>AI Assist</span>
                      <ChevronDown size={12} className="text-[#7B8FA5]" />
                    </button>

                    {/* AI Assist Dropdown Menu */}
                    {showAIAssistMenu && (
                      <div className="absolute left-0 bottom-full mb-2 w-[220px] bg-white border border-[#DFE5ED] rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {/* Refine section header */}
                          <div className="px-2 py-1.5 text-[11px] font-medium text-[#7B8FA5]">
                            Refine
                          </div>
                          
                          {/* Rephrase */}
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                            onClick={() => {
                              setShowAIAssistMenu(false);
                              // Handle rephrase action
                            }}
                          >
                            <RefreshCw size={14} className="text-[#364658]" />
                            <span className="text-xs text-[#364658]">Rephrase</span>
                          </button>
                          
                          {/* Make longer */}
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                            onClick={() => {
                              setShowAIAssistMenu(false);
                              // Handle make longer action
                            }}
                          >
                            <TextCursorInput size={14} className="text-[#364658]" />
                            <span className="text-xs text-[#364658]">Make longer</span>
                          </button>
                          
                          {/* Make shorter */}
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                            onClick={() => {
                              setShowAIAssistMenu(false);
                              // Handle make shorter action
                            }}
                          >
                            <Minimize2 size={14} className="text-[#364658]" />
                            <span className="text-xs text-[#364658]">Make shorter</span>
                          </button>
                          
                          {/* Change tone */}
                          <div className="relative">
                            <button 
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left justify-between"
                              onClick={() => {
                                setShowToneSubmenu(!showToneSubmenu);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Wand2 size={14} className="text-[#364658]" />
                                <span className="text-xs text-[#364658]">Change tone</span>
                              </div>
                              <ChevronRight size={14} className="text-[#7B8FA5]" />
                            </button>

                            {/* Tone Submenu */}
                            {showToneSubmenu && (
                              <div className="absolute left-full bottom-0 ml-1 w-[160px] bg-white border border-[#DFE5ED] rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                                    onClick={() => {
                                      setShowToneSubmenu(false);
                                      setShowAIAssistMenu(false);
                                    }}
                                  >
                                    <Briefcase size={14} className="text-[#364658]" />
                                    <span className="text-xs text-[#364658]">Professional</span>
                                  </button>
                                  
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                                    onClick={() => {
                                      setShowToneSubmenu(false);
                                      setShowAIAssistMenu(false);
                                    }}
                                  >
                                    <Heart size={14} className="text-[#364658]" />
                                    <span className="text-xs text-[#364658]">Empathetic</span>
                                  </button>
                                  
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                                    onClick={() => {
                                      setShowToneSubmenu(false);
                                      setShowAIAssistMenu(false);
                                    }}
                                  >
                                    <Zap size={14} className="text-[#364658]" />
                                    <span className="text-xs text-[#364658]">Concise</span>
                                  </button>
                                  
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                                    onClick={() => {
                                      setShowToneSubmenu(false);
                                      setShowAIAssistMenu(false);
                                    }}
                                  >
                                    <FileText size={14} className="text-[#364658]" />
                                    <span className="text-xs text-[#364658]">Formal</span>
                                  </button>
                                  
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors text-left"
                                    onClick={() => {
                                      setShowToneSubmenu(false);
                                      setShowAIAssistMenu(false);
                                    }}
                                  >
                                    <SmilePlus size={14} className="text-[#364658]" />
                                    <span className="text-xs text-[#364658]">Friendly</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shared conversation-editor quick actions (Template · Knowledge · Attach ·
                      Image · Link · Emoji · Text-formatting toggle · Undo/Redo) */}
                  <EditorQuickActions
                    formattingOpen={showFormattingMenu}
                    onToggleFormatting={() => {
                      autoOpenedRef.current = false; // manual toggle — selection changes won't auto-hide it
                      setShowFormattingMenu(!showFormattingMenu);
                    }}
                  />
                </div>

                {/* Right Side - Send Button (icon-only, internal comment → no draft) */}
                <EditorSendActions onSend={handleSend} showSaveDraft={false} />
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}