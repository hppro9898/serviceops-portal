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