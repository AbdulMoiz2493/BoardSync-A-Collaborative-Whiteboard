import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MoreHorizontal, ChevronDown, CheckSquare, LogOut, User, List, Layout, Grid, PlusCircle, Bell, CheckCircle, XCircle, Users, Trash2, HomeIcon } from 'lucide-react';

function WhiteboardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const navigate = useNavigate();

  // Function to fetch user data
  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Update localStorage and state
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUserData, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Initial data loading
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // If we have a userId but no name, fetch user data
        if ((!parsedUser.name || parsedUser.name === '') && userId) {
          fetchUserData(userId);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    fetchWhiteboards();
    fetchNotifications();
    
    // Add event listeners to close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown') && !event.target.closest('.notifications-container') && !event.target.closest('.action-menu-container')) {
        setDropdownOpen(false);
        setNotificationsOpen(false);
        setActionMenuOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchWhiteboards = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      } else {
        console.error('Failed to fetch whiteboards');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        
        if (!Array.isArray(data)) {
          console.error('API response is not an array:', data);
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        
        const formattedNotifications = data.map(notif => {
          // Debug log to see what fields are available on each notification
          console.log('Processing notification:', notif);
          
          return {
            id: notif._id || notif.id || Math.random().toString(36).substr(2, 9),
            type: notif.type === 'invite' ? 'invitation' : notif.type || 'invitation',
            // Try all possible property names for board ID
            boardId: notif.boardId || notif.boardID || notif.board || '',
            boardName: notif.boardName || 'Whiteboard',
            senderName: notif.sender || 'User',
            permissionLevel: notif.permissionLevel || notif.accessLevel || 'view',
            createdAt: notif.createdAt || new Date().toISOString(),
            read: notif.status === 'read',
            responded: notif.status === 'accepted' || notif.status === 'rejected',
            accepted: notif.status === 'accepted'
          };
        });
        
        console.log('Formatted notifications:', formattedNotifications);
        
        setNotifications([...formattedNotifications]);
        
        const unread = formattedNotifications.filter(notif => !notif.read).length;
        console.log('Calculated unread count:', unread);
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications. Status:', response.status);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'read' })
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const respondToInvitation = async (notificationId, boardId, accepted) => {
    try {
      // Check if boardId is missing
      if (!boardId) {
        console.error('Board ID is missing in the notification!');
        // Try to find the board ID from the notifications array
        const notification = notifications.find(n => n.id === notificationId);
        console.log('Found notification:', notification);
        
        if (notification) {
          // Try all possible fields that might contain board ID
          boardId = notification.boardId || notification.boardID || notification.board;
          console.log('Extracted boardId from notification:', boardId);
        }
        
        // If still no boardId, show an error
        if (!boardId) {
          alert('Unable to process this invitation: missing board ID');
          return;
        }
      }
      
      // Get user's email from localStorage if available
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = userData.email || '';
      
      console.log('Sending invitation response with data:', {
        notificationId, 
        boardId, 
        response: accepted ? 'accepted' : 'rejected',
        userEmail // Including email for debugging
      });
      
      const response = await fetch('http://localhost:3000/api/boards/invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          notificationId, 
          boardId, 
          response: accepted ? 'accepted' : 'rejected',
          email: userEmail // Send email explicitly to help server find the correct collaborator
        })
      });
      
      if (response.ok) {
        console.log('Successfully responded to invitation');
        // If accepted, refresh whiteboards to include the new one
        if (accepted) {
          fetchWhiteboards();
        }
        // Update notifications list
        fetchNotifications();
      } else {
        const errorData = await response.json();
        console.error('Failed to respond to invitation:', response.status, errorData);
        alert(`Failed to respond to invitation: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Error responding to invitation');
    }
  };

  const createNewBoard = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: 'Whiteboard' })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/whiteboard/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating whiteboard:', error);
    }
  };

  const toggleFavorite = async (boardId, isFavorite) => {
    try {
      const response = await fetch(`http://localhost:3000/api/boards/${boardId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isFavorite: !isFavorite })
      });
      
      if (response.ok) {
        fetchWhiteboards();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteWhiteboard = async (boardId) => {
    if (window.confirm("Are you sure you want to delete this whiteboard?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          // Refresh the whiteboards list
          fetchWhiteboards();
          // Close the action menu
          setActionMenuOpen(null);
        } else {
          alert("Failed to delete whiteboard");
        }
      } catch (error) {
        console.error('Error deleting whiteboard:', error);
        alert("Error deleting whiteboard");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const getFilteredBoards = () => {
    let filtered = [...boards];
    
    if (activeTab === 'favorites') {
      filtered = filtered.filter(board => board.isFavorite);
    } else if (activeTab === 'created') {
      filtered = filtered.filter(board => board.createdBy === localStorage.getItem('userId'));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(board => 
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const openWhiteboard = (boardId) => {
    navigate(`/whiteboard/${boardId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 flex items-center justify-between border-b border-gray-700">
        <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center">
        <CheckSquare className="w-6 h-6 text-purple-600" />
      </div>
      <span className="font-bold text-xl">BoardSync</span>
      <span className="text-sm text-white pl-1 border-l border-gray-200 ml-1">
        The everything app, for work.
      </span>
        </Link>
        
        <div className="flex items-center">
          
          
          {/* Notification Bell */}
          <div className="relative mr-4 notifications-container">
            <button 
              className="flex items-center justify-center text-white hover:text-gray-300 focus:outline-none relative"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
                setActionMenuOpen(null);
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-700 px-4 py-2">
                  <h3 className="font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={async () => {
                        try {
                          const promises = notifications
                            .filter(notif => !notif.read)
                            .map(notif => 
                              fetch(`http://localhost:3000/api/notifications/${notif.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({ status: 'read' })
                              })
                            );
                          
                          await Promise.all(promises);
                          fetchNotifications();
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  <div>
                    {notifications.map(notification => (
  <div 
    key={notification.id} 
    className={`px-4 py-3 border-b border-gray-700 ${!notification.read ? 'bg-gray-700' : ''}`}
    onClick={() => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    }}
  >
    {notification.type === 'invitation' && (
  <div>
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
        {notification.senderName ? notification.senderName.charAt(0) : 'U'}
      </div>
      <div>
        <p className="text-sm">
          <span className="font-semibold">{notification.senderName}</span> invited you to collaborate on "{notification.boardName}"
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {notification.permissionLevel === 'edit' 
            ? 'You can edit this whiteboard' 
            : 'View only access'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {notification.boardId ? `Board ID: ${notification.boardId}` : 'No board ID'} {/* Debug info */}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
    
    {!notification.responded && (
      <div className="flex mt-2 justify-end gap-2">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Accept button clicked:', { 
              id: notification.id, 
              boardId: notification.boardId 
            });
            respondToInvitation(notification.id, notification.boardId, true);
          }}
        >
          <CheckCircle size={12} className="mr-1" />
          Accept
        </button>
        <button 
          className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-md text-xs flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Decline button clicked:', { 
              id: notification.id, 
              boardId: notification.boardId 
            });
            respondToInvitation(notification.id, notification.boardId, false);
          }}
        >
          <XCircle size={12} className="mr-1" />
          Decline
        </button>
      </div>
        )}

                            
                            {notification.responded && notification.accepted && (
                              <div className="flex mt-2 justify-end">
                                <button 
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openWhiteboard(notification.boardId);
                                    setNotificationsOpen(false);
                                  }}
                                >
                                  <Layout size={12} className="mr-1" />
                                  Open Whiteboard
                                </button>
                              </div>
                            )}
                            
                            {notification.responded && !notification.accepted && (
                              <div className="mt-2 text-right">
                                <span className="text-xs text-gray-400">You declined this invitation</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative user-dropdown">
            <button 
              className="flex items-center gap-2 text-white hover:text-gray-300 focus:outline-none"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
                setActionMenuOpen(null);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                {user && user.name ? user.name.charAt(0) : <User size={16} />}
              </div>
              <span className="hidden sm:inline">{user && user.name ? user.name : 'User'}</span>
              <ChevronDown size={16} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700"
                >
                  <HomeIcon size={16} className="mr-2" />
                  <span>Go to Home</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layout size={24} />
            Whiteboards
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search Whiteboards"
                className="bg-gray-800 rounded-md px-3 py-2 pl-9 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={createNewBoard}
            >
              <PlusCircle size={18} />
              <span>New Whiteboard</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <List size={18} />
              Recent
            </h3>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : boards.length > 0 ? (
              <ul>
                {boards.slice(0, 3).map(board => (
                  <li key={board.id} className="mb-2">
                    <Link 
                      to={`/whiteboard/${board.id}`}
                      className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"
                    >
                      <Layout size={16} />
                      <div className="flex-1">{board.name}</div>
                      {board.collaboratorCount > 0 && (
                        <div className="flex items-center text-gray-400 text-xs">
                          <Users size={14} className="mr-1" />
                          {board.collaboratorCount}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No recent whiteboards</p>
            )}
          </div>

          {/* Favorites Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star size={18} />
              Favorites
            </h3>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : boards.filter(board => board.isFavorite).length > 0 ? (
              <ul>
                {boards.filter(board => board.isFavorite).slice(0, 3).map(board => (
                  <li key={board.id} className="mb-2">
                    <Link 
                      to={`/whiteboard/${board.id}`}
                      className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"
                    >
                      <Layout size={16} />
                      <div className="flex-1">{board.name}</div>
                      {board.collaboratorCount > 0 && (
                        <div className="flex items-center text-gray-400 text-xs">
                          <Users size={14} className="mr-1" />
                          {board.collaboratorCount}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 mb-4 border-2 border-gray-600 rounded-md flex items-center justify-center">
                  <Star size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-400">Your favorited Whiteboards will show here</p>
              </div>
            )}
          </div>

          {/* Created by Me Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={18} />
              Created by Me
            </h3>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : boards.filter(board => board.createdBy === localStorage.getItem('userId')).length > 0 ? (
              <ul>
                {boards
                  .filter(board => board.createdBy === localStorage.getItem('userId'))
                  .slice(0, 3)
                  .map(board => (
                    <li key={board.id} className="mb-2">
                      <Link 
                        to={`/whiteboard/${board.id}`}
                        className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"
                      >
                        <Layout size={16} />
                        <div className="flex-1">{board.name}</div>
                        {board.collaboratorCount > 0 && (
                          <div className="flex items-center text-gray-400 text-xs">
                            <Users size={14} className="mr-1" />
                            {board.collaboratorCount}
                          </div>
                        )}
                      </Link>
                    </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No whiteboards created by you</p>
            )}
          </div>
        </div>

        {/* All Whiteboards Table */}
        <div className="mt-8">
          <div className="flex border-b border-gray-700 mb-4 overflow-x-auto">
            <button 
              className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'created' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('created')}
            >
              My Whiteboards
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'favorites' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell">Collaborators</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Date updated</th>
                  <th className="text-left py-3 px-4 hidden lg:table-cell">Date created</th>
                  <th className="text-left py-3 px-4 hidden xl:table-cell">Date viewed</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Created by</th>
                  <th className="text-left py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBoards().map(board => (
                  <tr key={board.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <Link to={`/whiteboard/${board.id}`} className="flex items-center gap-2">
                        <Layout size={16} />
                        {board.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {board.collaboratorCount > 0 ? (
                        <div className="flex items-center">
                          <Users size={16} className="mr-1 text-gray-400" />
                          {board.collaboratorCount}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">{formatDate(board.updatedAt)}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">{formatDate(board.createdAt)}</td>
                    <td className="py-3 px-4 hidden xl:table-cell">{formatDate(board.lastViewed)}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        {board.createdByName ? board.createdByName.charAt(0) : 'U'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFavorite(board.id, board.isFavorite)}
                          className={`p-1 rounded-full hover:bg-gray-700 ${board.isFavorite ? 'text-yellow-400' : ''}`}
                        >
                          <Star size={16} />
                        </button>
                        <div className="relative action-menu-container">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-700"
                            onClick={() => {
                              setActionMenuOpen(actionMenuOpen === board.id ? null : board.id);
                              setNotificationsOpen(false);
                              setDropdownOpen(false);
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {actionMenuOpen === board.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
                              <button
                                onClick={() => deleteWhiteboard(board.id)}
                                className="flex items-center w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 size={16} className="mr-2" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {getFilteredBoards().length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400">
                No whiteboards found
              </div>
            )}
            
            {getFilteredBoards().length > 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                End of results
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default WhiteboardList;