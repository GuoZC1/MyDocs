# React 入门教程

## 什么是 React

React 是一个由 Facebook 开发的开源 JavaScript 库，用于构建用户界面。它允许开发者创建可重用的 UI 组件，并通过组件化的方式构建复杂的用户界面。React 采用声明式编程范式，使代码更易于理解和维护。

## 为什么学习 React

- **组件化开发**：将 UI 拆分为独立、可重用的组件
- **虚拟 DOM**：提高渲染性能
- **单向数据流**：使应用状态更可预测
- **丰富的生态系统**：大量的第三方库和工具
- **高需求**：在前端开发岗位中需求量大

## 环境搭建

### 使用 Create React App

Create React App 是官方提供的脚手架工具，可以快速搭建 React 开发环境：

```bash
# 创建新的 React 应用
npx create-react-app my-react-app

# 进入项目目录
cd my-react-app

# 启动开发服务器
npm start
```

### 项目结构

创建完成后，项目结构如下：

```
my-react-app/
  ├── node_modules/
  ├── public/
  │   ├── index.html
  │   └── favicon.ico
  ├── src/
  │   ├── App.css
  │   ├── App.js
  │   ├── App.test.js
  │   ├── index.css
  │   ├── index.js
  │   ├── logo.svg
  │   └── setupTests.js
  ├── .gitignore
  ├── package.json
  ├── README.md
  └── yarn.lock
```

## 核心概念

### 1. 组件

组件是 React 应用的基本构建块。有两种类型的组件：函数组件和类组件。

#### 函数组件

```jsx
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

export default Welcome;
```

#### 类组件

```jsx
import React, { Component } from 'react';

class Welcome extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

export default Welcome;
```

### 2. JSX

JSX 是一种 JavaScript 语法扩展，允许你在 JavaScript 中编写类似 HTML 的代码：

```jsx
const element = <h1>Hello, world!</h1>;
```

### 3. 属性 (Props)

属性是从父组件传递给子组件的数据：

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 使用组件
<Welcome name="John" />
```

### 4. 状态 (State)

状态是组件内部管理的数据，可以通过 `useState` 钩子进行管理：

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### 5. 生命周期

React 组件有自己的生命周期，你可以通过 `useEffect` 钩子来管理：

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 组件挂载和更新时执行
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## 第一个 React 应用

让我们创建一个简单的待办事项应用：

### 1. 创建组件

```jsx
// TodoApp.js
import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
    setInputValue('');
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div>
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onClick={() => toggleTodo(todo.id)}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

### 2. 使用组件

```jsx
// App.js
import React from 'react';
import TodoApp from './TodoApp';
import './App.css';

function App() {
  return (
    <div className="App">
      <TodoApp />
    </div>
  );
}

export default App;
```

## 样式处理

### 内联样式

```jsx
const styles = {
  color: 'red',
  fontSize: '16px'
};

function StyledComponent() {
  return <div style={styles}>Styled text</div>;
}
```

### CSS 模块

```jsx
// styles.module.css
.container {
  color: blue;
  padding: 20px;
}

// Component.js
import React from 'react';
import styles from './styles.module.css';

function StyledComponent() {
  return <div className={styles.container}>Styled with CSS modules</div>;
}
```

## 常见问题

### 1. 什么是虚拟 DOM？

虚拟 DOM 是 React 用来提高性能的一种技术。它是一个内存中的 DOM 树表示，React 通过比较虚拟 DOM 的变化来最小化实际 DOM 的操作。

### 2. 如何在 React 中处理表单？

React 中有两种表单处理方式：受控组件和非受控组件。受控组件将表单数据保存在组件状态中，而非受控组件使用 ref 来访问表单数据。

### 3. 如何进行组件通信？

- 父组件向子组件：通过属性传递
- 子组件向父组件：通过回调函数
- 跨组件通信：使用 Context API 或状态管理库（如 Redux）

## 进一步学习资源

- [React 官方文档](https://reactjs.org/)
- [React 教程 - W3Schools](https://www.w3schools.com/react/)
- [React 实战教程 - MDN](https://developer.mozilla.org/zh-CN/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started)

希望这个入门教程能帮助你开始 React 开发之旅！