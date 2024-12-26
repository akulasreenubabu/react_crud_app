
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newUser, setNewUser] = useState({ name: '', course: '' });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/user/${id}`);
            setUsers(users.filter(user => user.id !== id));
            setSuccessMessage('User deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = async (id) => {
        const userToEdit = users.find(user => user.id === id);
        if (!userToEdit) {
            alert('User not found');
            return;
        }
        const name = prompt('Enter new name:', userToEdit.name);
        const course = prompt('Enter new course:', userToEdit.course);
        if (name && course) {
            try {
                await axios.put(`http://localhost:3001/user/${id}`, { name, course });
                fetchUsers();
                setSuccessMessage('User updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }
    };

    const handleAddUser = async () => {
        if (newUser.name && newUser.course) {
            try {
                await axios.post('http://localhost:3001/users', newUser);
                fetchUsers();
                setNewUser({ name: '', course: '' });
                setSuccessMessage('User added successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error adding user:', error);
            }
        } else {
            alert('Please fill out all fields.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery)
    );

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Team Members</h1>
                <div className="add-user-container">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Course"
                        value={newUser.course}
                        onChange={(e) => setNewUser({ ...newUser, course: e.target.value })}
                    />
                    <button onClick={handleAddUser}>Add New Member</button>
                </div>
            </header>
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by ID or name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Course</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.course}</td>
                            <td>
                                <button onClick={() => handleEdit(user.id)}>Edit</button>
                                <button onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;
