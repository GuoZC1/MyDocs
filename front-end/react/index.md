# React 入门指南

## 什么是 React

React 是一个由 Facebook 开发的开源 JavaScript 库，用于构建用户界面，特别是单页应用程序。它允许开发者创建可重用的 UI 组件，并通过组件化的方式构建复杂的用户界面。

### React 的主要特点

- **组件化**：将 UI 拆分为独立、可重用的组件
- **虚拟 DOM**：通过内存中的虚拟 DOM 树提高性能
- **单向数据流**：数据从父组件流向子组件，使应用状态更加可预测
- **JSX**：一种类似 HTML 的语法扩展，使编写组件更加直观

## 环境搭建

要开始使用 React，你可以使用 Create React App 快速搭建开发环境：

```bash
# 使用 npm
npx create-react-app my-react-app

# 使用 Yarn
yarn create react-app my-react-app

# 进入项目目录
cd my-react-app

# 启动开发服务器
npm start
```

## 核心概念

### 1. 组件

组件是 React 应用的基本构建块。以下是一个简单的函数组件示例：

```jsx
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

export default Welcome;
```

### 2. JSX

JSX 是一种 JavaScript 语法扩展，允许你在 JavaScript 中编写类似 HTML 的代码：

```jsx
const element = <h1>Hello, world!</h1>;
```

### 3. 状态与属性

- **属性 (Props)**：从父组件传递给子组件的数据
- **状态 (State)**：组件内部管理的数据，可以通过 `useState` 钩子进行管理

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

export default Counter;
```

## 生命周期

React 组件有自己的生命周期，你可以通过 useEffect 钩子来管理：

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 类似于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    // 更新文档标题
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

export default Example;
```

## 路由

使用 React Router 可以在 React 应用中实现路由功能：

```bash
# 安装 React Router
npm install react-router-dom
```

```jsx
import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about/">About</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={Home} />
        <Route path="/about/" component={About} />
      </div>
    </Router>
  );
}

export default App;
```

## 进一步学习资源

- [React 官方文档](https://reactjs.org/)
- [React 教程 - W3Schools](https://www.w3schools.com/react/)
- [React 实战教程 - MDN](https://developer.mozilla.org/zh-CN/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started)

希望这个入门指南能帮助你开始 React 开发之旅！