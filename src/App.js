import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newUser, setNewUser] = useState({ id: '', name: '', course: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            if (response.data.status === "Success") {
                setUsers(response.data.data);
            } else {
                console.error('Unexpected response:', response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:3001/user/${id}`);
            if (response.data.status === "Success") {
                setUsers(users.filter(user => user.id !== id));
                setSuccessMessage(response.data.message);
            } else {
                setErrorMessage(response.data.message || 'Error deleting user');
            }
            setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 60000);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (id) => {
        const userToEdit = users.find(user => user.id === id);
        if (userToEdit) {
            setEditUser(userToEdit);
            setIsModalOpen(true);
        } else {
            alert('User not found');
        }
    };

    const handleSaveEdit = async () => {
        if (editUser && editUser.name && editUser.course) {
            try {
                const response = await axios.put(`http://localhost:3001/user/${editUser.id}`, {
                    name: editUser.name,
                    course: editUser.course
                });
                if (response.data.status === "Success") {
                    fetchUsers();
                    setSuccessMessage(response.data.message);
                    setIsModalOpen(false);
                    setEditUser(null);
                } else {
                    setErrorMessage(response.data.message || 'Error updating user');
                }
                setTimeout(() => {
                    setSuccessMessage('');
                    setErrorMessage('');
                }, 60000);
            } catch (error) {
                console.error('Error updating user:', error);
            }
        } else {
            alert('Please fill out all fields.');
        }
    };

    const handleAddUser = async () => {
        const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
        if (newUser.name && newUser.course) {
            try {
                const response = await axios.post('http://localhost:3001/users', [{ ...newUser, id: newId }]);
                if (response.data.status === "Success") {
                    fetchUsers();
                    setNewUser({ id: '', name: '', course: '' });
                    setSuccessMessage(response.data.message);
                    setIsModalOpen(false);
                } else {
                    setErrorMessage(response.data.message || 'Error adding user');
                }
                setTimeout(() => {
                    setSuccessMessage('');
                    setErrorMessage('');
                }, 60000);
            } catch (error) {
                console.error('Error adding user:', error);
            }
        } else {
            alert('Please fill out all fields.');
        }
    };

    const filteredUsers = Array.isArray(users)
        ? users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toString().includes(searchQuery) ||
            user.course.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Team Members</h1>
                <div className="add-user-container">
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Course"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar"
                    />
                    <button onClick={() => {
                        setEditUser(null);
                        setIsModalOpen(true);
                    }}>Add New Member</button>
                </div>
            </header>
            {successMessage && (
                <div className="success-message">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        ✖
                    </button>
                </div>
            )}
            {errorMessage && (
                <div className="error-message">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        ✖
                    </button>
                </div>
            )}
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Course</th>
                        <th style={{ width: '80px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.course}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button onClick={() => handleEdit(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <button
                            className="close-icon"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditUser(null);
                            }}
                        >
                            ✖
                        </button>
                        <h2 style={{ textAlign: 'center' }}>{editUser ? 'Edit Member' : 'Add New Member'}</h2>
                        <label htmlFor="name">Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Name"
                            value={editUser ? editUser.name : newUser.name}
                            onChange={(e) => {
                                if (editUser) {
                                    setEditUser({ ...editUser, name: e.target.value });
                                } else {
                                    setNewUser({ ...newUser, name: e.target.value });
                                }
                            }}
                            style={{ marginBottom: '10px', width: '100%' }}
                        />
                        <label htmlFor="course">Course<span style={{ color: 'red' }}> *</span></label>
                        <input
                            id="course"
                            type="text"
                            placeholder="Course"
                            value={editUser ? editUser.course : newUser.course}
                            onChange={(e) => {
                                if (editUser) {
                                    setEditUser({ ...editUser, course: e.target.value });
                                } else {
                                    setNewUser({ ...newUser, course: e.target.value });
                                }
                            }}
                            style={{ marginBottom: '10px', width: '100%' }}
                        />
                        <button onClick={editUser ? handleSaveEdit : handleAddUser} style={{ margin: '20px auto', width: '150px', display: 'block', padding: '12px', fontSize: '16px' }}>
                            {editUser ? 'Save' : 'Submit'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
