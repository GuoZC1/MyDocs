# RabbitMQ 精通指南

## 高级架构与设计

### 1. RabbitMQ 内部架构

RabbitMQ 由以下核心组件构成：

- **Erlang VM**：作为底层运行环境，提供高并发和容错能力
- **Broker**：消息代理，负责接收和分发消息
- **Exchange**：交换机，负责消息路由
- **Queue**：队列，存储等待消费的消息
- **Binding**：绑定，连接交换机和队列
- **Virtual Host**：虚拟主机，实现多租户隔离

### 2. 高性能设计原则

- **Erlang 并发模型**：利用轻量级进程和消息传递实现高并发
- **内存管理**：消息优先存储在内存中，达到阈值后才写入磁盘
- **持久化策略**：灵活的持久化配置，平衡性能与可靠性
- **网络优化**：使用异步 I/O 和高效的网络协议栈

## 高级功能与特性

### 1. 集群与高可用

#### 集群架构

```bash
# 节点1上执行
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app

# 节点2上执行
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# 查看集群状态
rabbitmqctl cluster_status
```

#### 镜像队列

```bash
# 创建策略，将队列镜像到所有节点
rabbitmqctl set_policy ha-all "^ha\." '{"ha-mode":"all"}'

# 创建策略，将队列镜像到2个节点
rabbitmqctl set_policy ha-two "^ha\." '{"ha-mode":"exactly","ha-params":2}'
```

### 2. 可靠消息传递

#### 发布者确认

```python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 启用发布者确认
channel.confirm_delivery()

# 声明队列
channel.queue_declare(queue='hello', durable=True)

# 发送消息并等待确认
try:
    channel.basic_publish(
        exchange='',
        routing_key='hello',
        body='Hello World!',
        properties=pika.BasicProperties(
            delivery_mode=2,  # 持久化消息
        )
    )
    print(" [x] Sent 'Hello World!'")
except pika.exceptions.UnroutableError:
    print(" [x] Message could not be delivered")

connection.close()
```

#### 事务支持

```python
# 开启事务
channel.tx_select()

try:
    # 发送消息
    channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')
    # 提交事务
    channel.tx_commit()
except:
    # 回滚事务
    channel.tx_rollback()
```

### 3. 死信队列 (DLQ)

```python
# 声明死信交换机
channel.exchange_declare(exchange='dlx', exchange_type='direct')

# 声明死信队列
channel.queue_declare(queue='dlq')

# 绑定死信队列到死信交换机
channel.queue_bind(exchange='dlx', queue='dlq', routing_key='dlr')

# 声明主队列，并设置死信交换机
channel.queue_declare(
    queue='main_queue',
    arguments={
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'dlr',
        'x-message-ttl': 10000,  # 消息10秒后过期
    }
)
```

### 4. 延迟队列

```python
# 声明延迟交换机
channel.exchange_declare(exchange='delay_exchange', exchange_type='direct')

# 声明延迟队列
channel.queue_declare(
    queue='delay_queue',
    arguments={
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'dlr',
        'x-message-ttl': 5000,  # 延迟5秒
    }
)

# 绑定延迟队列到延迟交换机
channel.queue_bind(exchange='delay_exchange', queue='delay_queue', routing_key='delay')
```

## 性能优化

### 1. 连接与通道管理

```python
# 使用连接池管理连接
from pika.adapters.blocking_connection import BlockingConnection
from pika.connection import ConnectionParameters

class RabbitMQConnectionPool:
    def __init__(self, host='localhost', port=5672, pool_size=10):
        self.host = host
        self.port = port
        self.pool_size = pool_size
        self.connections = []
        self.init_pool()

    def init_pool(self):
        for _ in range(self.pool_size):
            conn = BlockingConnection(ConnectionParameters(self.host, self.port))
            self.connections.append(conn)

    def get_connection(self):
        if not self.connections:
            self.init_pool()
        return self.connections.pop()

    def return_connection(self, connection):
        self.connections.append(connection)
```

### 2. 预取计数优化

```python
# 设置预取计数
def set_prefetch_count(channel, count=100):
    channel.basic_qos(prefetch_count=count)
```

### 3. 消息批量处理

```python
# 批量发布消息
def publish_batch(channel, queue_name, messages, batch_size=100):
    for i in range(0, len(messages), batch_size):
        batch = messages[i:i+batch_size]
        for msg in batch:
            channel.basic_publish(exchange='', routing_key=queue_name, body=msg)
```

## 监控与管理

### 1. 指标监控

```bash
# 查看队列统计信息
rabbitmqctl list_queues name messages_ready messages_unacknowledged

# 查看交换机统计信息
rabbitmqctl list_exchanges name type durable

# 查看连接统计信息
rabbitmqctl list_connections name pid host port
```

### 2. 管理API

```python
import requests
import json

# 获取队列信息
def get_queues_info(host='localhost', port=15672, username='guest', password='guest'):
    url = f'http://{host}:{port}/api/queues'
    response = requests.get(url, auth=(username, password))
    return json.loads(response.text)

# 获取交换机信息
def get_exchanges_info(host='localhost', port=15672, username='guest', password='guest'):
    url = f'http://{host}:{port}/api/exchanges'
    response = requests.get(url, auth=(username, password))
    return json.loads(response.text)
```

## 高级应用模式

### 1.  rpc模式

```python
# RPC 服务器
import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='rpc_queue')

def fib(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib(n-1) + fib(n-2)

def on_request(ch, method, props, body):
    n = int(body)

    print(f" [.] fib({n})")
    response = fib(n)

    ch.basic_publish(exchange='',
                     routing_key=props.reply_to,
                     properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                     body=str(response))
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='rpc_queue', on_message_callback=on_request)

print(" [x] Awaiting RPC requests")
channel.start_consuming()
```

```python
# RPC 客户端
import pika
import uuid
import time

class FibonacciRpcClient:
    def __init__(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        self.channel = self.connection.channel()

        result = self.channel.queue_declare(queue='', exclusive=True)
        self.callback_queue = result.method.queue

        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True)

        self.response = None
        self.corr_id = None

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body

    def call(self, n):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(
            exchange='',
            routing_key='rpc_queue',
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id,
            ),
            body=str(n))
        while self.response is None:
            self.connection.process_data_events()
        return int(self.response)

fibonacci_rpc = FibonacciRpcClient()

print(" [x] Requesting fib(30)")
response = fibonacci_rpc.call(30)
print(f" [.] Got {response}")
```

### 2. 一致性哈希路由

```python
import hashlib

class ConsistentHashRouter:
    def __init__(self, nodes, replicas=100):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []
        for node in nodes:
            self.add_node(node)

    def add_node(self, node):
        for i in range(self.replicas):
            key = self._hash(f"{node}:{i}")
            self.ring[key] = node
            self.sorted_keys.append(key)
        self.sorted_keys.sort()

    def remove_node(self, node):
        for i in range(self.replicas):
            key = self._hash(f"{node}:{i}")
            del self.ring[key]
            self.sorted_keys.remove(key)

    def get_node(self, key):
        if not self.ring:
            return None

        hash_key = self._hash(key)
        index = self._find_index(hash_key)
        return self.ring[self.sorted_keys[index]]

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def _find_index(self, hash_key):
        for i, key in enumerate(self.sorted_keys):
            if hash_key < key:
                return i
        return 0
```

## 安全与最佳实践

### 1. 安全配置

```bash
# 创建用户
rabbitmqctl add_user admin password

# 设置用户权限
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 设置用户角色
rabbitmqctl set_user_tags admin administrator

# 删除默认guest用户
rabbitmqctl delete_user guest
```

### 2. 性能调优最佳实践

- 适当增加预取计数以提高吞吐量
- 使用非持久化消息以获得最佳性能
- 合理设置队列大小限制，避免内存溢出
- 使用连接池管理连接，避免频繁建立连接
- 对消息进行批量处理，减少网络往返
- 考虑使用惰性队列处理大量消息

### 3. 可靠性最佳实践

- 使用持久化队列和持久化消息
- 启用发布者确认机制
- 使用事务或发布者确认保证消息可靠投递
- 实现死信队列处理无法消费的消息
- 考虑使用镜像队列提高可用性
- 定期备份RabbitMQ数据

## 故障排查与调优

### 1. 常见性能瓶颈

- **CPU使用率过高**：可能是消息处理逻辑过于复杂或并发过高
- **内存使用率过高**：可能是队列积压过多消息或消息体过大
- **磁盘IO过高**：可能是持久化消息过多或磁盘性能不足
- **网络带宽瓶颈**：可能是消息流量过大或网络配置不当

### 2. 故障排查工具

```bash
# 查看RabbitMQ日志
rabbitmqctl tail

# 查看Erlang进程信息
rabbitmqctl eval 'erlang:system_info(process_count).'

# 查看内存使用情况
rabbitmqctl eval 'erlang:memory().'
```

## 学习资源与进阶

- **官方文档**：https://www.rabbitmq.com/documentation.html
- **高级教程**：https://www.rabbitmq.com/tutorials/tutorial-seven-python.html
- **GitHub仓库**：https://github.com/rabbitmq
- **社区论坛**：https://groups.google.com/forum/#!forum/rabbitmq-users
- **书籍**：《RabbitMQ实战》、《RabbitMQ in Action》
- **培训课程**：RabbitMQ官方培训和认证课程