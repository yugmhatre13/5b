import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', hobby: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', age: '', hobbies: '', bio: '', userId: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Clean empty filters
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const res = await getUsers(activeFilters);
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Debounce fetching if needed, but for now fetch on filter blur/submit
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', hobby: '', search: '' });
    // setTimeout to ensure state is clear before fetch
    setTimeout(fetchUsers, 0); 
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateForm = () => {
    setFormData({ name: '', email: '', age: '', hobbies: '', bio: '', userId: `user_${Date.now()}` });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age,
      hobbies: user.hobbies.join(', '),
      bio: user.bio || '',
      userId: user.userId
    });
    setEditingId(user._id);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h)
      };

      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Mongoose & Vite React Premium Stack</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + New User
        </button>
      </header>

      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}

      <div className="grid grid-cols-2">
        {/* Left Sidebar: Filters */}
        <aside>
          <div className="card filter-panel">
            <h2>Filters & Search</h2>
            <form onSubmit={applyFilters}>
              <div className="form-group">
                <label>Text Search (Bio via Text Index)</label>
                <input type="text" name="search" className="input-field" placeholder="Search bio keywords..." value={filters.search} onChange={handleFilterChange} />
              </div>
              <div className="form-group">
                <label>Name (Regex Search)</label>
                <input type="text" name="name" className="input-field" placeholder="John Doe" value={filters.name} onChange={handleFilterChange} />
              </div>
              <div className="form-group">
                <label>Email (Exact Match)</label>
                <input type="email" name="email" className="input-field" placeholder="john@example.com" value={filters.email} onChange={handleFilterChange} />
              </div>
              <div className="form-group">
                <label>Hobby (Array Multi-key Index)</label>
                <input type="text" name="hobby" className="input-field" placeholder="e.g. Coding" value={filters.hobby} onChange={handleFilterChange} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary w-full">Apply Filters</button>
                <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear</button>
              </div>
            </form>
          </div>
        </aside>

        {/* Right Area: Main Content */}
        <main>
          {/* Create/Edit Form inside main content area to avoid complex modals for simplicity */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }} 
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="card" style={{ border: '1px solid var(--primary-color)' }}>
                <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>
                <form onSubmit={handleFormSubmit} style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" name="name" required minLength={3} className="input-field" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" required className="input-field" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" name="age" min={0} max={120} className="input-field" value={formData.age} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>User ID (Unique Hashed)</label>
                      <input type="text" name="userId" required className="input-field" value={formData.userId} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Hobbies (Comma separated)</label>
                    <input type="text" name="hobbies" className="input-field" placeholder="Reading, Gaming" value={formData.hobbies} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea name="bio" rows="3" className="input-field" value={formData.bio} onChange={handleInputChange}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">Save User</button>
                    <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="user-list">
            {loading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found matching criteria.</p>
            ) : (
              users.map(user => (
                <div key={user._id} className="card user-card">
                  <h3>{user.name}</h3>
                  <p>{user.email} • Age: {user.age}</p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    {user.hobbies?.map((hobby, i) => (
                      <span key={i} className="tag">{hobby}</span>
                    ))}
                  </div>

                  {user.bio && (
                    <p style={{ fontStyle: 'italic', fontSize: '0.8rem', opacity: 0.8 }}>"{user.bio}"</p>
                  )}

                  <div className="actions">
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => openEditForm(user)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleDelete(user._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
