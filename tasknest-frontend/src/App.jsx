import { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import MenuTransition from './MenuTransition';

const CustomSelect = ({ value, onChange, options, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border text-left ${isDarkMode ? 'border-gray-700 bg-gray-700 text-gray-200' : 'border-gray-200'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
      >
        {value ? (
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: options.find(opt => opt.id === Number(value))?.color }}
            />
            <span>{options.find(opt => opt.id === Number(value))?.name || 'Feladat típus kiválasztása'}</span>
          </div>
        ) : (
          'Feladat típus kiválasztása'
        )}
      </button>
      
      {isOpen && (
        <div className={`absolute z-[100] w-full mt-1 border rounded-lg shadow-lg ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="py-1">
            {options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  // If clicking the already selected option, deselect it
                  if (value === option.id) {
                    onChange(null);
                  } else {
                    onChange(option.id);
                  }
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} flex items-center space-x-2 ${
                  value === option.id ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-50') : ''
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: option.color }}
                />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  {option.name}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onChange('add-new');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} flex items-center space-x-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <div className="w-4 h-4 flex items-center justify-center">+</div>
              <span>Új típus hozzáadása</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState('main'); // 'main' or 'settings'
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#3B82F6');

  // Add this new function to handle menu closing
  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setMenuView('main'); // Reset menu view to main when closing
  };

  // Taskok lekérése a backendről
  const fetchTasks = async () => {
    const response = await fetch('http://localhost:8000/tasks');
    const data = await response.json();
    setTasks(data);
  };

  // Fetch task types
  const fetchTaskTypes = async () => {
    const response = await fetch('http://localhost:8000/task-types');
    const data = await response.json();
    setTaskTypes(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchTaskTypes();
  }, []);

  // Új task hozzáadása
  const addTask = async (e) => {
    e.preventDefault();

    const newTask = {
      title,
      description,
      due_date: dueDate,
      task_type_id: selectedTaskType,
    };

    const response = await fetch('http://localhost:8000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    const savedTask = await response.json();
    setTasks((prev) => [...prev, savedTask]);

    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedTaskType(null);
  };

  // Add task type
  const addTaskType = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/task-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newTypeName,
        color: newTypeColor,
      }),
    });
    const savedType = await response.json();
    setTaskTypes(prev => [...prev, savedType]);
    setNewTypeName('');
    setNewTypeColor('#3B82F6');
  };

  // Delete task type
  const deleteTaskType = async (typeId) => {
    await fetch(`http://localhost:8000/task-types/${typeId}`, {
      method: 'DELETE',
    });
    setTaskTypes(prev => prev.filter(type => type.id !== typeId));
  };

  // Task törlése
  const deleteTask = async (taskId) => {
    await fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: 'DELETE',
    });
    setTasks((prev) => prev.filter(task => task.id !== taskId));
  };

  // Task status toggle
  const toggleStatus = async (taskId) => {
    const response = await fetch(`http://localhost:8000/tasks/${taskId}/status`, {
      method: 'PATCH',
    });
    const data = await response.json();
    setTasks(prev => prev.map(task => 
      task.id === taskId ? {...task, status: data.status} : task
    ));
  };

  return (
    <div className={`min-h-screen transition-colors duration-600 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} p-8`}>
      {/* Sliding Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-all duration-600 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Fixed header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="relative h-8">
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                  menuView === 'main' 
                    ? 'translate-y-0 opacity-100' 
                    : '-translate-y-full opacity-0'
                }`}>
                  Menü
                </div>
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                  menuView === 'settings' 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full opacity-0'
                }`}>
                  Beállítások
                </div>
              </div>
            </h2>
            <button onClick={handleCloseMenu} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Menu Content */}
            <MenuTransition view={menuView}>
              {menuView === 'main' ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => setMenuView('settings')}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Beállítások</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => setMenuView('main')}
                    className="mb-6 flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Vissza</span>
                  </button>

                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sötét mód</span>
                        <button
                          onClick={toggleDarkMode}
                          className={`p-2 rounded-lg transform transition-all duration-300 active:scale-75 hover:rotate-[360deg] ${isDarkMode ? 'bg-gray-600 text-yellow-300' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {isDarkMode ? '🌙' : '☀️'}
                        </button>
                      </div>
                    </div>
                    {/* Task Types Management */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Feladat típusok</h3>
                      
                      <form onSubmit={addTaskType} className="space-y-3 mb-4">
                        <input
                          type="text"
                          placeholder="Típus neve"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-200'} p-2 rounded-lg`}
                        />
                        <input
                          type="color"
                          value={newTypeColor}
                          onChange={(e) => setNewTypeColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                        <button
                          type="submit"
                          className={`w-full bg-gradient-to-r ${isDarkMode ? 'from-gray-700 to-gray-900' : 'from-gray-500 to-gray-700'} text-white px-4 py-2 rounded-lg font-medium hover:from-gray-600 hover:to-gray-800 transform transition-all duration-200 hover:shadow-lg active:scale-95`}
                        >
                          Típus hozzáadása
                        </button>
                      </form>

                      <div className="space-y-2">
                        {taskTypes.map(type => (
                          <div
                            key={type.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{type.name}</span>
                            </div>
                            <button
                              onClick={() => deleteTaskType(type.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </MenuTransition>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className={`text-3xl font-bold text-center flex-grow bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-gray-400 to-gray-600' : 'from-gray-600 to-gray-800'}`}>Feladat Rendező</h1>
          <button 
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 transform active:scale-75 hover:rotate-180`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transform transition-transform duration-300 ${isFormVisible ? 'rotate-45' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="relative">
          {/* Form container */}
          <div 
            className={`relative z-10 transform transition-all duration-300 ease-in-out origin-top ${
              isFormVisible 
                ? 'opacity-100 scale-y-100 mb-8' 
                : 'opacity-0 scale-y-0 h-0 mb-0'
            }`}
          >
            <form onSubmit={addTask} className="space-y-4">
              <input
                type="text"
                placeholder="Feladat címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-gray-200 placeholder-gray-400' : 'border-gray-200'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
              />
              <textarea
                placeholder="Leírás"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-gray-200 placeholder-gray-400' : 'border-gray-200'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]`}
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className={`w-full border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-gray-200' : 'border-gray-200'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
              />
              <CustomSelect
                value={selectedTaskType}
                onChange={(value) => {
                  if (value === 'add-new') {
                    setIsMenuOpen(true);
                    setMenuView('settings');
                  } else {
                    setSelectedTaskType(value);
                  }
                }}
                options={taskTypes}
                isDarkMode={isDarkMode}
              />
              <button
                type="submit"
                className={`w-full bg-gradient-to-r ${isDarkMode ? 'from-gray-700 to-gray-900' : 'from-gray-500 to-gray-700'} text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-gray-800 transform transition-all duration-200 hover:shadow-lg active:scale-95`}
              >
                Hozzáadás
              </button>
            </form>
          </div>

          {/* Tasks container with slide effect */}
          <div 
            className={`space-y-4 transform transition-all duration-300 ease-in-out ${
              isFormVisible 
                ? 'translate-y-0'
                : '-translate-y-6'
            }`}
          >
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`group border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
              >
                {task.type_name && (
                  <div 
                    className="inline-block px-2 py-1 rounded-full text-sm mb-2 text-gray-200"
                    style={{ 
                      backgroundColor: task.type_color,
                      opacity: 0.8
                    }}
                  >
                    {task.type_name}
                  </div>
                )}
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300 group-hover:text-yellow-300' : 'text-gray-800 group-hover:text-blue-600'} transition-colors mb-2`}>
                  {task.title}
                </h2>
                <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{task.description}</p>
                <div className="flex justify-between items-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Határidő:</span> {task.due_date}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={`px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer
                        ${task.status === 'nincs kész' 
                          ? `${isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}` 
                          : `${isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200'}`
                        }`}
                    >
                      {task.status}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

