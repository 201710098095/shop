import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '.././components/Login.vue'
import Home from '.././components/Home.vue'
import Welcome from '.././components/Welcome.vue'
import Users from '.././components/user/Users.vue'
import Rights from '.././components/power/Rights.vue'
import Roles from '.././components/power/Roles.vue'
import Cate from '.././components/goods/Cate.vue'




import { Message } from 'element-ui'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect:'/welcome',children:[
    {path: '/welcome', component:Welcome },
    {path: '/users',component:Users},
    {path: '/rights',component:Rights},
    {path: '/roles',component:Roles},
    {path: '/categories',component:Cate}

  ] 
  }
]

const router = new VueRouter({
  routes
})

//导航守卫 
router.beforeEach((to, from, next)=>{
  if(to.path === '/login')return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) {Message.error('当前未登录，请重新登录！');return next('/login');}
  else next()
})

export default router