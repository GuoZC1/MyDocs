# React 精通指南

## React 高级概念

### 1. 虚拟 DOM 与 Diff 算法

React 的虚拟 DOM 是一个轻量级的 JavaScript 对象，用于描述真实 DOM 树的结构。当组件状态发生变化时，React 会生成新的虚拟 DOM 树，并与旧树进行比较（Diff 算法），然后只更新必要的部分到真实 DOM。

#### Diff 算法的优化策略

- **同级比较**：只比较同一层级的节点，不跨层级比较
- **key 属性**：用于标识节点的唯一性，帮助 React 识别哪些节点可以复用
- **类型检查**：如果节点类型改变，直接替换整个节点及其子节点

```jsx
// 示例：key 属性的正确使用
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 2. 函数组件与类组件的差异

| 特性 | 函数组件 | 类组件 |
|------|----------|--------|
| 状态管理 | 使用 Hooks | 使用 this.state 和 this.setState |
| 生命周期 | 使用 useEffect Hook | 有专门的生命周期方法 |
| 性能 | 通常更好，没有实例化开销 | 有额外的实例化开销 |
| 代码简洁性 | 更简洁，可读性更好 | 更冗长 |

### 3. Context API 深入

Context API 用于跨组件传递数据，避免 props  drilling。

```jsx
// 创建 Context
const ThemeContext = React.createContext('light');

// 提供 Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Navbar />
    </ThemeContext.Provider>
  );
}

// 消费 Context
function Navbar() {
  const theme = useContext(ThemeContext);
  return (
    <nav style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      {/* 导航内容 */}
    </nav>
  );
}
```

## React 性能优化

### 1. 组件优化

#### React.memo

用于优化函数组件，避免不必要的重渲染。

```jsx
const MemoizedComponent = React.memo(function MyComponent(props) {
  // 组件实现
});
```

#### useCallback 与 useMemo

- `useCallback`：缓存函数引用
- `useMemo`：缓存计算结果

```jsx
function ExpensiveComponent({ compute, data }) {
  // 缓存计算结果
  const result = useMemo(() => compute(data), [compute, data]);
  
  // 缓存事件处理函数
  const handleClick = useCallback(() => {
    console.log('Clicked with data:', data);
  }, [data]);
  
  return (
    <div onClick={handleClick}>{result}</div>
  );
}
```

### 2. 列表渲染优化

- 使用唯一的 `key` 属性
- 虚拟列表（对于超长列表）

```jsx
// react-window 库实现虚拟列表
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={40}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].text}</div>
      )}
    </List>
  );
}
```

### 3. 懒加载与代码分割

使用 `React.lazy` 和 `Suspense` 实现组件的懒加载。

```jsx
// 懒加载组件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

## 高级 Hooks 用法

### 1. 自定义 Hooks

封装可重用的逻辑。

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

### 2. useReducer 的高级应用

对于复杂状态管理，useReducer 比 useState 更适合。

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.payload, completed: false }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(reducer, { todos: [] });
  // 组件实现
}
```

### 3. useEffect 的细粒度控制

```jsx
// 只在组件挂载时执行一次
useEffect(() => {
  // 初始化代码
}, []);

// 监听特定值的变化
useEffect(() => {
  // 处理逻辑
}, [dependency1, dependency2]);

// 清理副作用
useEffect(() => {
  const subscription = someAPI.subscribe(data => setData(data));
  return () => subscription.unsubscribe();
}, []);
```

## React 状态管理深入

### 1. Redux 高级技巧

#### 选择器（Selectors）

```jsx
// 使用 reselect 库创建记忆化选择器
import { createSelector } from 'reselect';

const getTodos = state => state.todos;
const getFilter = state => state.filter;

const getVisibleTodos = createSelector(
  [getTodos, getFilter],
  (todos, filter) => {
    switch (filter) {
      case 'COMPLETED':
        return todos.filter(t => t.completed);
      case 'ACTIVE':
        return todos.filter(t => !t.completed);
      default:
        return todos;
    }
  }
);
```

#### 中间件（Middleware）

```jsx
// 记录 actions 的中间件
const loggerMiddleware = store => next => action => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

### 2. MobX 与状态管理 alternatives

MobX 是另一种流行的状态管理库，基于观察者模式。

```jsx
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';

class TodoStore {
  todos = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo = (text) => {
    this.todos.push({ id: Date.now(), text, completed: false });
  };

  toggleTodo = (id) => {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  };
}

const todoStore = new TodoStore();

// 观察者组件
const TodoList = observer(() => {
  return (
    <ul>
      {todoStore.todos.map(todo => (
        <li
          key={todo.id}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          onClick={() => todoStore.toggleTodo(todo.id)}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
});
```

## React 服务端渲染

### 1. Next.js 入门

Next.js 是一个流行的 React 服务端渲染框架。

```jsx
// 页面组件 - 服务端渲染
function HomePage({ data }) {
  return (
    <div>
      <h1>Server Rendered Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// 获取数据 - 在服务端执行
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return { props: { data } };
}

export default HomePage;
```

### 2. React 服务端渲染原理

- 服务端生成 HTML 字符串
- 客户端进行 hydration（激活）
- 优点：更好的 SEO、更快的首屏加载

## React 测试策略

### 1. 单元测试与集成测试

```jsx
// 使用 Jest 和 React Testing Library 测试组件
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('counter increments when button is clicked', () => {
  render(<Counter />);
  const button = screen.getByText('Click me');
  const countDisplay = screen.getByText('You clicked 0 times');

  fireEvent.click(button);
  expect(countDisplay).toHaveTextContent('You clicked 1 times');
});
```

### 2. 端到端测试

使用 Cypress 进行端到端测试：

```javascript
// cypress/e2e/todo.cy.js
describe('Todo App', () => {
  it('adds a new todo', () => {
    cy.visit('/');
    cy.get('input[placeholder="Add a new todo"]').type('Learn React');
    cy.get('button[type="submit"]').click();
    cy.get('ul').should('contain', 'Learn React');
  });
});
```

## React 生态系统

### 1. React 路由高级用法

```jsx
// 使用 React Router v6
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="*" element={<NotFound />} />
        {/* 重定向 */}
        <Route path="/old-path" element={<Navigate to="/new-path" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// 路由参数
function UserProfile() {
  const { id } = useParams();
  return <div>User Profile for {id}</div>;
}
```

### 2. React 表单处理

使用 Formik 和 Yup 进行高级表单处理：

```jsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
});

function SignupForm() {
  return (
    <Formik
      initialValues={{ name: '', email: '', password: '' }}
      validationSchema={SignupSchema}
      onSubmit={(values) => {
        console.log('Submitted:', values);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="name">Name</label>
            <Field type="text" name="name" />
            <ErrorMessage name="name" component="div" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />
          </div>
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

## React 最佳实践

1. **组件设计**
   - 单一职责原则
   - 容器组件与展示组件分离
   - 避免过度抽象

2. **性能优化**
   - 避免不必要的重渲染
   - 合理使用 React.memo、useCallback 和 useMemo
   - 大型列表使用虚拟滚动

3. **代码组织**
   - 按功能模块组织代码
   - 使用 hooks 封装可重用逻辑
   - 合理使用 TypeScript 增强类型安全性

4. **状态管理**
   - 避免过度使用全局状态
   - 复杂状态使用 useReducer 或状态管理库
   - 表单状态考虑使用专门的表单库

## 下一步学习建议

- **深入源码**：学习 React 源码，理解其内部实现
- **性能优化**：掌握更高级的性能优化技巧和工具
- **服务端渲染**：深入学习 Next.js 或其他 SSR 框架
- **跨平台开发**：学习 React Native 进行移动应用开发
- **微前端**：探索基于 React 的微前端架构

希望这份 React 精通指南能帮助你更深入地理解和应用 React 技术！