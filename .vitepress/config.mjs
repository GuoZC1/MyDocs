import { defineConfig } from 'vitepress'
import { set_siderbar } from './utils/auto_sidebar.mjs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/MyDocs/',
  head: [["link", {rel: "icon", type: "image/png", href: "/img/index/logo.jpg"}]],
  title: "Document Management",
  description: "A VitePress Site",
  themeConfig: {
    outlineTitle: '目录',
    outline: [2,6], // 'deep'指[2,6]
    logo: '/img/index/logo.jpg',
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档"
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonText: "清除查询条件"
              }
            }
          }
        }
      }
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { 
        text: 'Others',
        items: [
          { text: 'React Examples', link: '/front-end/react' },
          { text: 'RabbitMQ Examples', link: '/backend/rabbitmq' }
        ]
      }
    ],
    // sidebar: { 
    //   "/front-end/react": set_siderbar("front-end/react"),
    //   "/backend/rabbitmq": set_siderbar("backend/rabbitmq"),
    // },
    // 三边栏改为两边栏
    sidebar: false,
    aside: 'left',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      copyright: "Copyright © 2025-present AI"
    }
  }
})
