# RabbitMQ 入门指南

## 什么是 RabbitMQ

RabbitMQ 是一个开源的消息代理软件，它实现了高级消息队列协议 (AMQP)。RabbitMQ 可以在分布式系统中充当中间件，帮助不同组件之间进行异步通信，提高系统的可扩展性和可靠性。

### RabbitMQ 的主要特点

- **可靠性**：支持消息持久化、确认机制和高可用性
- **灵活的路由**：支持多种交换机类型，如直连、主题、扇形和头部交换机
- **扩展性**：可以轻松地添加更多的服务器节点
- **多语言客户端**：支持多种编程语言，如 Python、Java、JavaScript 等
- **管理界面**：提供直观的 Web 管理界面

## 环境搭建

### 安装 RabbitMQ

#### Windows 安装

1. 首先安装 Erlang：[下载 Erlang](https://www.erlang.org/downloads)
2. 然后安装 RabbitMQ：[下载 RabbitMQ](https://www.rabbitmq.com/download.html)
3. 安装完成后，启动 RabbitMQ 服务

#### Ubuntu 安装

```bash
# 更新软件包列表
sudo apt-get update

# 安装 Erlang
sudo apt-get install erlang

# 安装 RabbitMQ
sudo apt-get install rabbitmq-server

# 启动服务
sudo systemctl start rabbitmq-server

# 设置开机自启动
sudo systemctl enable rabbitmq-server
```

#### macOS 安装

```bash
# 使用 Homebrew 安装
brew install rabbitmq

# 启动服务
brew services start rabbitmq
```

### 启用管理界面

```bash
# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management
```

然后在浏览器中访问管理界面，使用默认用户名和密码 `guest/guest` 登录。

## 核心概念

### 1. 生产者和消费者

- **生产者**：发送消息的应用程序
- **消费者**：接收和处理消息的应用程序

### 2. 队列

队列是存储消息的缓冲区，消息在被消费前会一直保存在队列中。

### 3. 交换机

交换机负责将消息路由到一个或多个队列。常见的交换机类型有：

- **直连交换机 (Direct)**：根据消息的路由键精确匹配
- **主题交换机 (Topic)**：根据消息的路由键进行模式匹配
- **扇形交换机 (Fanout)**：将消息广播到所有绑定的队列
- **头部交换机 (Headers)**：根据消息的头部属性进行匹配

### 4. 绑定

绑定是交换机和队列之间的关联关系。

### 5. 路由键

路由键是一个字符串，用于确定消息应该被路由到哪些队列。

## 基本操作示例

### Python 示例

首先安装 pika 库：

```bash
pip install pika
```

#### 生产者代码

```python
import pika

# 建立连接
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明队列
channel.queue_declare(queue='hello')

# 发送消息
channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')
print(" [x] Sent 'Hello World!'")

# 关闭连接
connection.close()
```

#### 消费者代码

```python
import pika

# 建立连接
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明队列
channel.queue_declare(queue='hello')

# 定义回调函数
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)

# 注册回调函数
channel.basic_consume(queue='hello', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
# 开始消费
channel.start_consuming()
```

### JavaScript 示例

首先安装 amqplib 库：

```bash
npm install amqplib
```

#### 生产者代码

```javascript
const amqp = require('amqplib');

async function sendMessage() {
  try {
    // 建立连接
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 声明队列
    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });

    // 发送消息
    const message = 'Hello World!';
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(` [x] Sent '${message}'`);

    // 关闭连接
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

sendMessage();
```

#### 消费者代码

```javascript
const amqp = require('amqplib');

async function receiveMessage() {
  try {
    // 建立连接
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 声明队列
    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

    // 注册回调函数
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(` [x] Received ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

receiveMessage();
```

## 高级特性

### 1. 消息持久化

确保消息在 RabbitMQ 服务器重启后不会丢失：

```python
# 声明持久化队列
channel.queue_declare(queue='task_queue', durable=True)

# 发送持久化消息
channel.basic_publish(
    exchange='',
    routing_key='task_queue',
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,  # 使消息持久化
    )
)
```

### 2. 公平调度

确保每个消费者都能处理相同数量的消息：

```python
# 每次只发送一个消息给消费者
channel.basic_qos(prefetch_count=1)
```

### 3. 发布/订阅模式

使用扇形交换机实现广播：

```python
# 声明扇形交换机
channel.exchange_declare(exchange='logs', exchange_type='fanout')

# 发布消息到交换机
channel.basic_publish(exchange='logs', routing_key='', body=message)

# 消费者绑定到交换机
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue
channel.queue_bind(exchange='logs', queue=queue_name)
```

## 最佳实践

1. **使用连接池**：避免频繁创建和关闭连接
2. **设置合理的超时时间**：防止长时间阻塞
3. **使用死信队列**：处理无法消费的消息
4. **监控队列长度**：及时发现潜在问题
5. **使用适当的交换机类型**：根据业务场景选择合适的路由方式

## 常见问题

### 1. RabbitMQ 服务无法启动？

- 检查 Erlang 是否正确安装
- 检查端口是否被占用
- 查看日志文件获取详细错误信息

### 2. 消息发送后丢失？

- 确保消息和队列都设置了持久化
- 启用消息确认机制

### 3. 如何实现高可用性？

- 配置 RabbitMQ 集群
- 使用镜像队列

## 进一步学习资源

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [RabbitMQ 教程](https://www.rabbitmq.com/getstarted.html)
- [AMQP 协议规范](https://www.amqp.org/)

希望这个入门指南能帮助你开始使用 RabbitMQ！