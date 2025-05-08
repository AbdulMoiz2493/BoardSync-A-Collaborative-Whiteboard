import { useEffect, useState, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { ArrowLeft, Star, Users, Share2, MoreHorizontal, XCircle, User } from 'lucide-react';

let socket;
if (!socket) {
  socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  });
}

function Whiteboard() {
  const [userId, setUserId] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [boardName, setBoardName] = useState('Whiteboard');
  const [collaborators, setCollaborators] = useState([]);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('view');
  const [activeUsers, setActiveUsers] = useState(new Map());
  const { id } = useParams();
  const navigate = useNavigate();
  
  const currentElementsRef = useRef([]);
  const isRemoteChangeRef = useRef(false);
  const [elements, setElements] = useState([]);
  const [viewBackgroundColor, setViewBackgroundColor] = useState('#ffffff');
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored userId:', storedUserId);
    if (!storedUserId) {
      navigate('/login');
      return;
    }
  
    setUserId(storedUserId);
  }, [navigate]);
  
  useEffect(() => {
    if (!userId || !id) return;

    fetchBoardDetails(id);
    fetchCollaborators(id);
    
    socket.emit('join-board', {
      boardId: id,
      userId: userId,
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      if (id) {
        socket.emit('leave-board', id);
        socket.off('draw');
        socket.off('user-joined');
        socket.off('user-left');
      }
    };
  }, [id, userId]);
  
  useEffect(() => {
    if (!excalidrawAPI || !userId || !id) return;
    
    socket.on('draw', (data) => {
      if (data.userId !== userId) {
        console.log('Received draw event at:', Date.now(), 'with timestamp:', data.timestamp);
        isRemoteChangeRef.current = true;
        
        if (data.elements) {
          // Update current elements reference before updating scene
          currentElementsRef.current = data.elements;
          
          // Update the scene
          excalidrawAPI.updateScene({ 
            elements: data.elements,
            appState: { viewBackgroundColor: data.viewBackgroundColor || '#ffffff' }
          });
          
          // Force a re-render of the scene
          requestAnimationFrame(() => {
            excalidrawAPI.refresh();
            // Optional - this forces a full re-render of all elements
            excalidrawAPI.scrollToContent(null, {
              animate: false,
              fitToContent: false
            });
          });
        }
        
        isRemoteChangeRef.current = false;
      }
    });
    

    socket.on('board-state', (data) => {
      // Replace the entire elements array with the received state
      setElements(data.elements);
      if (data.viewBackgroundColor) {
        setViewBackgroundColor(data.viewBackgroundColor);
      }
    });
    
    socket.on('user-joined', (data) => {
      setActiveUsers(prev => {
        const updated = new Map(prev);
        updated.set(data.userId, data);
        return updated;
      });
    });

    
    socket.on('user-left', (userId) => {
      setActiveUsers(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    });
  }, [excalidrawAPI, userId, id]);

  const fetchBoardDetails = async (boardId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${boardId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Board details:', data);
        console.log('Comparing createdBy:', data.createdBy, 'with userId:', userId);
        setBoardName(data.name || 'Whiteboard');
        setIsFavorite(data.isFavorite || false);
        setIsOwner(data.createdBy === userId);
        
        if (excalidrawAPI && data.elements && data.elements.length > 0) {
          currentElementsRef.current = data.elements;
          excalidrawAPI.updateScene({ 
            elements: data.elements,
            appState: { viewBackgroundColor: data.viewBackgroundColor || '#ffffff' }
          });
          
          // Force a refresh after loading initial data
          setTimeout(() => {
            excalidrawAPI.refresh();
          }, 100);
        }
        
        if (data.createdBy === userId) {
          setCanEdit(true);
        } else {
          const userCollaboration = data.collaborators?.find(
            collab => collab.userId === userId
          );
          setCanEdit(userCollaboration?.accessLevel === 'edit');
        }
      } else {
        console.error('Failed to fetch board details:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching board details:', error);
    }
  };
  
  const fetchCollaborators = async (boardId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${boardId}/collaborators`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      } else {
        console.error(`Failed to fetch collaborators: ${response.status} ${response.statusText}`);
        if (response.status === 403) {
          console.error('Access denied: You do not have permission to view collaborators for this board.');
        }
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleChange = (elements, appState) => {
    if (isRemoteChangeRef.current) return;
    
    // Only send updates if there are actual changes
    const elementsChanged = JSON.stringify(elements) !== JSON.stringify(currentElementsRef.current);
    
    if (!elementsChanged) return;
    
    // Update our reference to current elements
    currentElementsRef.current = elements;
    
    if (canEdit && elements) {
      console.log('Emitting draw event at:', Date.now());
      
      // Add a small debounce to prevent excessive emissions
      // but don't wait too long to avoid lag in collaboration
      setTimeout(() => {
        socket.emit('draw', { 
          userId, 
          elements, 
          boardId: id, 
          timestamp: Date.now(),
          viewBackgroundColor: appState?.viewBackgroundColor
        });
      }, 10);
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isFavorite: !isFavorite })
      });
      
      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const updateBoardName = async (newName) => {
    if (!id || !isOwner) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      });
      
      if (!response.ok) {
        console.error('Error updating board name');
      }
    } catch (error) {
      console.error('Error updating board name:', error);
    }
  };
  
  const inviteCollaborator = async () => {
    if (!inviteEmail || !id) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: inviteEmail,
          accessLevel: accessLevel 
        })
      });
      
      if (response.ok) {
        fetchCollaborators(id);
        setInviteEmail('');
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    }
  };
  
  const updateCollaboratorAccess = async (collaboratorId, newAccessLevel) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${id}/collaborators/${collaboratorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accessLevel: newAccessLevel })
      });
      
      if (response.ok) {
        fetchCollaborators(id);
      }
    } catch (error) {
      console.error('Error updating collaborator access:', error);
    }
  };
  
  const removeCollaborator = async (collaboratorId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${id}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchCollaborators(id);
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const goBack = () => {
    navigate('/whiteboards');
  };
  
  const getActiveCollaboratorsCount = () => {
    const onlineCount = Array.from(activeUsers.keys()).length;
    return onlineCount > 0 ? onlineCount : collaborators.filter(c => c.status === 'accepted').length;
  };

  console.log('isOwner:', isOwner);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className="p-2 mr-2 rounded-md hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center">
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={() => updateBoardName(boardName)}
              disabled={!isOwner}
              className="bg-transparent text-lg font-semibold border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="text-xs text-gray-400 mr-2">
              {activeUsers.size > 0 ? `${activeUsers.size} online` : ''}
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-md hover:bg-gray-700 ${isFavorite ? 'text-yellow-400' : ''}`}
          >
            <Star size={20} />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-700 relative"
            onClick={() => {
              console.log('Users button clicked, isOwner:', isOwner);
              if (isOwner) {
                setShowCollaboratorsModal(true);
              } else {
                console.warn('Cannot open collaborators modal: User is not the owner');
              }
            }}
          >
            <Users size={20} />
            {collaborators.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getActiveCollaboratorsCount()}
              </span>
            )}
          </button>
          {isOwner && (
            <button 
              className="p-2 rounded-md hover:bg-gray-700 bg-blue-600"
              onClick={() => setShowCollaboratorsModal(true)}
            >
              <Share2 size={20} />
            </button>
          )}
          <button className="p-2 rounded-md hover:bg-gray-700">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>
      
      <div className="flex-1">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          theme="dark"
          onChange={handleChange}
          initialData={{ elements: [], appState: {} }}
          viewModeEnabled={!canEdit}
        />
      </div>
      
      {showCollaboratorsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Collaborators</h2>
              <button 
                onClick={() => setShowCollaboratorsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {isOwner && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Invite a collaborator</h3>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-gray-700 rounded px-3 py-2 flex-1"
                  />
                  <button
                    onClick={inviteCollaborator}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    Invite
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevel"
                      value="view"
                      checked={accessLevel === 'view'}
                      onChange={() => setAccessLevel('view')}
                      className="mr-2"
                    />
                    View only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevel"
                      value="edit"
                      checked={accessLevel === 'edit'}
                      onChange={() => setAccessLevel('edit')}
                      className="mr-2"
                    />
                    Can edit
                  </label>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Collaborators ({collaborators.length})</h3>
              {collaborators.length === 0 ? (
                <p className="text-gray-400">No collaborators yet</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {collaborators.map((collaborator) => (
                    <li key={collaborator.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                          {collaborator.name ? collaborator.name.charAt(0) : <User size={16} />}
                        </div>
                        <div>
                          <div className={`${collaborator.status === 'accepted' ? 'font-bold' : 'text-gray-300'}`}>
                            {collaborator.name || collaborator.email}
                          </div>
                          <div className="text-xs">
                            {Array.from(activeUsers.keys()).includes(collaborator.userId?.toString()) 
                              ? <span className="text-green-400">Online</span>
                              : collaborator.status === 'pending' 
                                ? 'Pending' 
                                : collaborator.status === 'rejected'
                                  ? 'Rejected'
                                  : 'Offline'}
                          </div>
                        </div>
                      </div>
                      
                      {isOwner && (
                        <div className="flex items-center space-x-2">
                          {collaborator.status === 'accepted' && (
                            <select
                              value={collaborator.accessLevel}
                              onChange={(e) => updateCollaboratorAccess(collaborator.id, e.target.value)}
                              className="bg-gray-800 text-sm rounded px-2 py-1"
                            >
                              <option value="view">View</option>
                              <option value="edit">Edit</option>
                            </select>
                          )}
                          <button
                            onClick={() => removeCollaborator(collaborator.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Whiteboard;