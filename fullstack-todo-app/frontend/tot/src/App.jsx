import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Fetch token from local storage or any other secure place
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchTodos(storedToken);
    }
  }, []);

  const fetchTodos = async (authToken) => {
    const response = await axios.get(`${API_BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    setTodos(response.data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });
      const newToken = response.data.accessToken;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      fetchTodos(newToken);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/register`, {
        username,
        password
      });
      alert('Registration successful! Please login.');
      setIsRegistering(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    try {
      if (!newTodo.trim() || !token) return;
      await axios.post(`${API_BASE_URL}/todos`, { text: newTodo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTodo('');
      fetchTodos(token);
    } catch (error) {
      console.error('Error adding todo:', error);
      if (error.response?.status === 403) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    }
  };

  const toggleTodo = async (id, completed) => {
    await axios.put(`${API_BASE_URL}/todos/${id}`, { completed: !completed }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTodos(token);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE_URL}/todos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTodos(token);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            {!isLoggedIn ? (
              <div className="divide-y divide-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                  {isRegistering ? 'Register' : 'Login'}
                </h2>
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isRegistering ? 'Register' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setUsername('');
                      setPassword('');
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h2 className="text-3xl font-extrabold text-gray-900">Todo List</h2>
                  <form onSubmit={addTodo} className="mt-8 space-y-6">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new todo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Todo
                    </button>
                  </form>
                </div>
                <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                  <ul className="space-y-4">
                    {todos.map((todo) => (
                      <li key={todo.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id, todo.completed)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className={`ml-3 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

