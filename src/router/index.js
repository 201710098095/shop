import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '.././components/Login.vue'
import Home from '.././components/Home.vue'
import Welcome from '.././components/Welcome.vue'
import Users from '.././components/user/Users.vue'
import Rights from '.././components/power/Rights.vue'
import Roles from '.././components/power/Roles.vue'
import Cate from '.././components/goods/Cate.vue'
import Params from '.././components/goods/Params.vue'
import GoodsList from '.././components/goods/List.vue'
import Add from '.././components/goods/Add.vue'
import Order from '.././components/order/Order.vue'
import Report from '.././components/report/Report.vue'







import { Message } from 'element-ui'

Vue.use(VueRouter)

// 时间
Vue.filter('dateFormat',function(originVal){
 const dt = new Date(originVal)
 const y = dt.getFullYear()
 const m = (dt.getMonth()+1+'').padStart(2,'0')
 const d = (dt.getDate()+'').padStart(2,'0')
 const hh = (dt.getHours()+'').padStart(2,'0')
 const mm = (dt.getMinutes()+'').padStart(2,'0')
 const ss = (dt.getSeconds()+'').padStart(2,'0')
 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect:'/welcome',children:[
    {path: '/welcome', component:Welcome },
    {path: '/users',component:Users},
    {path: '/rights',component:Rights},
    {path: '/roles',component:Roles},
    {path: '/categories',component:Cate},
    {path: '/params',component:Params},
    {path: '/goods',component:GoodsList},
    {path: '/goods/add',component:Add},
    {path: '/orders',component:Order},
    {path: '/reports',component:Report},


  
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
