<div 
          className={`flex-shrink-0 relative ${activeGroup === 'chatbot' ? '' : 'px-4 pb-3 pt-3 bg-white'}`}
          data-onboarding="ai-assistant"
        >
          {/* Gradient Fade Overlay at Top */}
          {activeGroup !== 'chatbot' && (
            <div 
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: '-40px',
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
                zIndex: 1,
              }}
            />
          )}
          
          {/* Quick AI Actions Bar */}
          {activeGroup !== 'chatbot' && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[#7B8FA5] uppercase tracking-wide">Quick AI Actions</span>
                
              </div>
              
              {/* Scrollable Pills Container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 py-1 px-1">
                  {/* Summarize Ticket */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <Sparkles size={13} className="flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Summarize</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Get a quick summary of this ticket
                    </TooltipContent>
                  </Tooltip>

                  {/* Find Similar Tickets */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <SearchIcon size={13} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span>Find Similar</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Search for similar tickets in the system
                    </TooltipContent>
                  </Tooltip>

                  {/* Suggest KB Article */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <FileText size={13} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span>Suggest KB</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Find relevant knowledge base articles
                    </TooltipContent>
                  </Tooltip>

                  {/* Next Best Action */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <Zap size={13} className="flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Next Action</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Get AI-powered recommendations for next steps
                    </TooltipContent>
                  </Tooltip>

                  {/* Root Cause Hint */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <Brain size={13} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span>Root Cause</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Analyze potential root causes
                    </TooltipContent>
                  </Tooltip>

                  {/* Draft Reply */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        style={{ background: 'linear-gradient(125deg, rgba(61, 139, 208, 0.08) 9.82%, rgba(108, 229, 232, 0.08) 73.33%, rgba(28, 229, 177, 0.08) 136.84%)' }}
                        className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#364658] text-xs font-medium whitespace-nowrap hover:text-[#3D8BD0] hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          if (activeGroup !== 'chatbot') {
                            setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
                          }
                          setActiveGroup('chatbot');
                        }}
                      >
                        <MessageSquare size={13} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span>Draft Reply</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Generate a draft response for the requester
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          <div 
            className="flex items-center gap-2 p-2.5 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              background: 'linear-gradient(white, white) padding-box, linear-gradient(125deg, #3D8BD0 9.82%, #6CE5E8 73.33%, #1CE5B1 136.84%) border-box',
              border: '2px solid transparent',
              display: activeGroup === 'chatbot' ? 'none' : 'flex',
            }}
            onClick={() => {
              if (activeGroup !== 'chatbot') {
                setPreviousGroup(activeGroup as 'properties' | 'activity' | 'suggestions');
              }
              setActiveGroup('chatbot');
            }}
          >
            <Sparkles size={16} className="text-[#3D8BD0] flex-shrink-0" />
            <input
              type="text"
              placeholder="Ask AI for insights, summaries, and actions..."
              className="flex-1 text-sm text-[#364658] placeholder:text-[#7B8FA5] bg-transparent border-none outline-none cursor-pointer"
              readOnly
            />
          </div>
        </div>