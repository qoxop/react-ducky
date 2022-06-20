// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/okaidia');
const darkCodeTheme = require('prism-react-renderer/themes/oceanicNext');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React-Ducky',
  tagline: 'React-Ducky 用更简单的方式编基于 React 的业务代码',
  url: 'https://react-ducky.qoxop.run',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'qoxop', // Usually your GitHub org/user name.
  projectName: 'react-ducky', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/qoxop/react-ducky/tree/main/websites',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: [
            require.resolve('./src/css/icons/iconfont.css'),
            require.resolve('./src/css/custom.css')
          ],

        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'React-Ducky',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '使用指南',
          },
          {to: '/docs/api/react-ducky', label: 'API', position: 'left'},
          // {to: '/blog', label: '博客', position: 'left'},
          {
            href: 'https://react-ducky.qoxop.run/demo',
            label: 'DEMO', 
            position: 'right'
          },
          {
            href: 'https://github.com/qoxop/react-ducky',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档链接',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: '相关框架',
            items: [
              {
                label: 'React',
                href: 'https://reactjs.org/',
              },
              {
                label: 'Redux',
                href: 'https://redux.js.org/',
              },
              {
                label: 'immer',
                href: 'https://github.com/immerjs/immer',
              },
            ],
          },
          {
            title: '更多',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/qoxop/react-ducky',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} qoxop, Inc. Built with Docusaurus.`,
      },
      docs: {
        sidebar: {
          hideable: true
        }
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
