<div
                      key={task.id}
                      className="bg-white border border-[#DFE5ED] rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed || false}
                            onChange={(e) => {
                              setTasks(tasks.map(t => 
                                t.id === task.id 
                                  ? { ...t, completed: e.target.checked, status: e.target.checked ? 'Closed' : 'Open' } 
                                  : t
                              ));
                            }}
                            className="mt-0.5 w-4 h-4 text-[#00A9E0] border-[#DFE5ED] rounded focus:ring-[#00A9E0] focus:ring-2 cursor-pointer"
                          />
                          <h4 className={`text-sm font-semibold text-[#364658] flex-1 ${task.completed ? 'line-through' : ''}`}>TA-{task.id.slice(-3).padStart(3, '0')} - {task.subject}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setShowTaskPanel(true);
                            }}
                            className="text-[#7B8FA5] hover:text-[#3D8BD0] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M10.8619 1.52925C11.1223 1.2689 11.5444 1.2689 11.8047 1.52925L14.4714 4.19591C14.7318 4.45626 14.7318 4.87837 14.4714 5.13872L5.80474 13.8054C5.67971 13.9304 5.51014 14.0007 5.33333 14.0007H2.66667C2.29848 14.0007 2 13.7022 2 13.334V10.6673C2 10.4905 2.07024 10.3209 2.19526 10.1959L8.86179 3.52939L10.8619 1.52925ZM9.33333 4.94346L3.33333 10.9435V12.6673H5.05719L11.0572 6.66732L9.33333 4.94346ZM12 5.72451L13.0572 4.66732L11.3333 2.94346L10.2761 4.00065L12 5.72451Z" fill="#7B8FA5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete task "${task.subject}"?`)) {
                                setTasks(tasks.filter(t => t.id !== task.id));
                              }
                            }}
                            className="text-[#7B8FA5] hover:text-[#E74C3C] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M6.66667 2.66667V2H9.33333V2.66667H6.66667ZM5.33333 2.66667V2C5.33333 1.26362 5.93029 0.666667 6.66667 0.666667H9.33333C10.0697 0.666667 10.6667 1.26362 10.6667 2V2.66667H13.3333H14.6667V4H13.3333V13.3333C13.3333 14.0697 12.7364 14.6667 12 14.6667H4C3.26362 14.6667 2.66667 14.0697 2.66667 13.3333V4H1.33333V2.66667H2.66667H5.33333ZM4 4V13.3333H12V4H4ZM6 6H7.33333V11.3333H6V6ZM9.33333 6H8V11.3333H9.33333V6Z" fill="#E74C3C" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <TaskCardFields 
                        task={task}
                        statusColors={statusColors}
                        priorityColors={priorityColors}
                        onUpdateTask={(updatedTask) => {
                          setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
                        }}
                      />
                    </div>