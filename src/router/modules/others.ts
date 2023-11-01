import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/user',
    name: 'user',
    component: Layout,
    redirect: '/user/index',
    meta: {title: '个人页', icon: 'user-circle', hidden: true},
    children: [
      {
        path: 'index',
        name: 'UserIndex',
        component: () => import('@/pages/user/index.vue'),
        meta: {title: '个人中心'},
      },
    ],
  },
  {
    path: '/loginRedirect',
    name: 'loginRedirect',
    meta: {title: '登录页', icon: 'logout', hidden: true},
    component: () => import('@/pages/login/index.vue'),
    children: [
      {
        path: 'index',
        redirect: '/login',
        component: () => import('@/layouts/blank.vue'),
        meta: {title: '登录中心'},
      },
    ],
  },
  {
    path: '/result',
    name: 'result',
    component: Layout,
    redirect: '/result/success',
    meta: {title: '结果页', icon: 'check-circle', hidden: true},
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: () => import('@/pages/result/success/index.vue'),
        meta: {title: '成功页'},
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: () => import('@/pages/result/fail/index.vue'),
        meta: {title: '失败页'},
      },
      {
        path: 'network-error',
        name: 'ResultNetworkError',
        component: () => import('@/pages/result/network-error/index.vue'),
        meta: {title: '网络异常'},
      },
      {
        path: '403',
        name: 'Result403',
        component: () => import('@/pages/result/403/index.vue'),
        meta: {title: '无权限'},
      },
      {
        path: '404',
        name: 'Result404',
        component: () => import('@/pages/result/404/index.vue'),
        meta: {title: '访问页面不存在页'},
      },
      {
        path: '500',
        name: 'Result500',
        component: () => import('@/pages/result/500/index.vue'),
        meta: {title: '服务器出错页'},
      },
      {
        path: 'browser-incompatible',
        name: 'ResultBrowserIncompatible',
        component: () => import('@/pages/result/browser-incompatible/index.vue'),
        meta: {title: '浏览器不兼容页'},
      },
      {
        path: 'maintenance',
        name: 'ResultMaintenance',
        component: () => import('@/pages/result/maintenance/index.vue'),
        meta: {title: '系统维护页'},
      },
    ],
  },
  // 三级菜单配置
  // {
  //   path: '/menu',
  //   name: 'menu',
  //   component: Layout,
  //   meta: { title: '一级菜单', icon: 'menu-fold' },
  //   children: [
  //     {
  //       path: 'second',
  //       meta: { title: '二级菜单' },
  //       component: () => import('@/layouts/blank.vue'),
  //       children: [
  //         {
  //           path: 'third',
  //           name: 'NestMenu',
  //           component: () => import('@/pages/nest-menu/index.vue'),
  //           meta: { title: '三级菜单' },
  //         },
  //       ],
  //     },
  //   ],
  // },
];
