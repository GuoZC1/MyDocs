# RabbitMQ 入门指南

## 什么是 RabbitMQ

RabbitMQ 是一个开源的消息代理软件，它实现了高级消息队列协议 (AMQP)，用于在分布式系统中进行消息传递。RabbitMQ 可以帮助不同的应用程序、服务或组件之间进行异步通信，提高系统的可扩展性和容错性。

## 为什么使用 RabbitMQ

- **解耦系统组件**：允许不同组件独立开发和部署
- **异步通信**：提高系统响应速度
- **流量削峰**：处理突发流量
- **可靠消息传递**：保证消息不丢失
- **灵活的路由**：支持多种消息路由模式
- **分布式部署**：支持集群和高可用

## 安装与配置

### Windows 安装

1. 下载并安装 Erlang：https://www.erlang.org/downloads
2. 下载并安装 RabbitMQ：https://www.rabbitmq.com/download.html
3. 启动 RabbitMQ 服务：
   ```bash
   rabbitmq-service start
   ```
4. 启用管理插件：
   ```bash
   rabbitmq-plugins enable rabbitmq_management
   ```
5. 访问管理界面 (默认用户名/密码: guest/guest)

### Linux 安装 (Ubuntu)

```bash
# 安装 Erlang
sudo apt-get install erlang

# 添加 RabbitMQ 仓库
sudo apt-get install curl gnupg apt-transport-https -y
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.key > /dev/null
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.9F4587F226208342.key > /dev/null

# 更新软件包列表
sudo apt-get update

# 安装 RabbitMQ
sudo apt-get install rabbitmq-server -y --fix-missing

# 启动服务
sudo systemctl start rabbitmq-server
# 设置开机自启动
sudo systemctl enable rabbitmq-server

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management
```

## 核心概念

### 1. 生产者和消费者

- **生产者**：发送消息的应用程序
- **消费者**：接收和处理消息的应用程序

### 2. 队列

队列是存储消息的缓冲区，消息在此等待被消费者接收。

### 3. 交换机

交换机接收来自生产者的消息，并根据路由规则将它们路由到一个或多个队列。

### 4. 绑定

绑定是交换机和队列之间的关联。

### 5. 路由键

路由键是一个属性，附加到消息上，用于确定消息应该被路由到哪些队列。

### 6. 交换机类型

- **直连交换机 (Direct)**：根据路由键精确匹配
- **扇形交换机 (Fanout)**：将消息广播到所有绑定的队列
- **主题交换机 (Topic)**：根据路由键的模式匹配
- **首部交换机 (Headers)**：根据消息的首部属性进行匹配

## 快速入门示例

### Python 示例

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
    print(f" [x] Received {body.decode()}")

# 设置消费者
channel.basic_consume(queue='hello', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
# 开始消费
channel.start_consuming()
```

### JavaScript 示例 (使用 amqplib)

#### 安装依赖

```bash
npm install amqplib
```

#### 生产者代码

```javascript
const amqp = require('amqplib');

async function producer() {
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

producer();
```

#### 消费者代码

```javascript
const amqp = require('amqplib');

async function consumer() {
  try {
    // 建立连接
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 声明队列
    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

    // 设置消费者
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

consumer();
```

## 工作队列模式

工作队列模式用于将耗时任务分发给多个工作进程。

```python
# 生产者代码
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明一个持久化的队列
channel.queue_declare(queue='task_queue', durable=True)

message = ' '.join(sys.argv[1:]) or 'Hello World!'
channel.basic_publish(
    exchange='',
    routing_key='task_queue',
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,  # 使消息持久化
    )
)
print(f" [x] Sent {message}")
connection.close()
```

```python
# 消费者代码
import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='task_queue', durable=True)
print(' [*] Waiting for messages. To exit press CTRL+C')

# 定义回调函数
def callback(ch, method, properties, body):
    print(f" [x] Received {body.decode()}")
    time.sleep(body.count(b'.'))
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag)

# 设置预取计数为1，确保工作进程一次只处理一个消息
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='task_queue', on_message_callback=callback)

channel.start_consuming()
```

## 发布/订阅模式

发布/订阅模式允许将消息广播给多个消费者。

```python
# 生产者代码
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明一个扇形交换机
channel.exchange_declare(exchange='logs', exchange_type='fanout')

message = 'Info: Hello World!'
channel.basic_publish(exchange='logs', routing_key='', body=message)
print(f" [x] Sent {message}")

connection.close()
```

```python
# 消费者代码
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明交换机
channel.exchange_declare(exchange='logs', exchange_type='fanout')

# 创建一个临时队列
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

# 绑定队列到交换机
channel.queue_bind(exchange='logs', queue=queue_name)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(f" [x] {body.decode()}")

channel.basic_consume(
    queue=queue_name,
    on_message_callback=callback,
    auto_ack=True
)

channel.start_consuming()
```

## 主题模式

主题模式允许基于路由键的模式匹配来路由消息。

```python
# 生产者代码
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明主题交换机
channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

routing_key = sys.argv[1] if len(sys.argv) > 2 else 'anonymous.info'
message = ' '.join(sys.argv[2:]) or 'Hello World!'

channel.basic_publish(
    exchange='topic_logs',
    routing_key=routing_key,
    body=message
)
print(f" [x] Sent {routing_key}:{message}")
connection.close()
```

```python
# 消费者代码
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明交换机
channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

# 创建临时队列
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

# 获取绑定键
binding_keys = sys.argv[1:]
if not binding_keys:
    sys.stderr.write("Usage: %s [binding_key]...\n" % sys.argv[0])
    sys.exit(1)

# 绑定队列到交换机
for binding_key in binding_keys:
    channel.queue_bind(
        exchange='topic_logs',
        queue=queue_name,
        routing_key=binding_key
    )

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(f" [x] {method.routing_key}:{body.decode()}")

channel.basic_consume(
    queue=queue_name,
    on_message_callback=callback,
    auto_ack=True
)

channel.start_consuming()
```

## 常见问题与故障排除

1. **无法连接到 RabbitMQ 服务器**
   - 检查 RabbitMQ 服务是否正在运行
   - 确认防火墙设置允许访问 5672 和 15672 端口

2. **消息丢失**
   - 使用持久化队列和持久化消息
   - 确保消费者正确确认消息

3. **性能问题**
   - 考虑使用连接池
   - 调整预取计数
   - 考虑集群部署

## 最佳实践

- 使用连接池管理连接
- 为队列和消息设置适当的持久化策略
- 合理设置预取计数
- 监控 RabbitMQ 服务器性能
- 使用死信队列处理无法处理的消息
- 定期备份 RabbitMQ 数据

## 学习资源

- 官方文档：https://www.rabbitmq.com/documentation.html
- RabbitMQ 教程：https://www.rabbitmq.com/getstarted.html
- GitHub 仓库：https://github.com/rabbitmq
- 社区论坛：https://groups.google.com/forum/#!forum/rabbitmq-users
- 书籍：《RabbitMQ 实战指南》