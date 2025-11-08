import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit3, Trash2, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { storage } from '../utils/storage';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import apiClient from '../api/axios';
const ManageUsers = ({ role, title, description }) => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: role,
    });

    useEffect(() => {
        loadUsers();
    }, [role]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm]);



// ... inside the component
const loadUsers = async () => {
  setLoading(true);
  try {
    // We assume your `getAllUsers` controller can filter by role
    const response = await apiClient.get(`/users?role=${role}`);
    setUsers(response.data);
    setFilteredUsers(response.data);
  } catch (error) {
    console.error(`Error loading ${role}s:`, error);
  } finally {
    setLoading(false);
  }
};

const handleAddUser = async () => {
  try {
    // The backend handles hashing the password
    await apiClient.post('/users', formData);
    loadUsers(); // Refresh the list from the server
    setShowAddModal(false);
    setFormData({ name: '', email: '', role: 'student', password: '' });
  } catch (error) {
    console.error('Error adding user:', error);
    // You could set an error message in the modal here
  }
};

const handleEditUser = async () => {
  try {
    const { name, email, role } = formData;
    await apiClient.put(`/users/${selectedUser.id}`, { name, email, role });
    loadUsers(); // Refresh the list
    setShowEditModal(false);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

const handleDeleteUser = async (userId) => {
  if (window.confirm('Are you sure you want to delete this user?')) {
    try {
      await apiClient.delete(`/users/${userId}`);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
};

    const filterUsers = () => {
        let filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditing(true);
            setSelectedUser(user);
            setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        } else {
            setIsEditing(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', password: '', role: role });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allUsers = storage.get('users');
        if (isEditing) {
            const updatedUsers = allUsers.map(u => u.id === selectedUser.id ? { ...u, name: formData.name, email: formData.email } : u);
            storage.set('users', updatedUsers);
        } else {
            const newUser = {
                id: `${role}_${Date.now()}`,
                ...formData,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            storage.set('users', [...allUsers, newUser]);
        }
        loadUsers();
        handleCloseModal();
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const allUsers = storage.get('users');
            const updatedUsers = allUsers.filter(u => u.id !== userId);
            storage.set('users', updatedUsers);
            loadUsers();
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{title}</h1>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
                            </div>
                            <motion.button onClick={() => handleOpenModal()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2`}>
                                <Plus className="w-5 h-5" /> Add {role.charAt(0).toUpperCase() + role.slice(1)}
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input type="text" placeholder={`Search ${role}s...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Name</th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Status</th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Created At</th>
                                        <th className={`px-6 py-4 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(userItem => (
                                        <tr key={userItem.id} className={`${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors border-t ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img src={userItem.avatar} alt={userItem.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{userItem.name}</div>
                                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{userItem.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${userItem.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>{userItem.status}</span></td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(userItem)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(userItem.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.form onSubmit={handleSubmit} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? `Edit ${role}` : `Add New ${role}`}</h3>
                                <button type="button" onClick={handleCloseModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <input required type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                                <input required type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                                {!isEditing && <input required type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={handleCloseModal} className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
                                <button type="submit" className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg`}>{isEditing ? 'Update' : 'Add'}</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default ManageUsers;