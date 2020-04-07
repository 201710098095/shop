<template>
        <el-container class="home-container">
            <el-header>
                <div class="left">
                    后台管理系统
                </div>
                <div class="right">
                     <el-button @click="logout">退出</el-button>
                </div>
               </el-header>
      <el-container>
        <el-aside width='200px'>
            <el-menu background-color="#373d41" text-color="#fff" active-text-color="rgb(37, 110, 219)" :unique-opened='false' router :default-active="activePath">
                <el-submenu :index='item.id +""' v-for="item in menuList" :key='item.id'>
                    <template slot="title">
                    <span>{{item.authName}}</span>
                    </template>
                    <el-menu-item :index='"/"+subItem.path ' v-for="subItem in item.children" :key="subItem.id" @click="saveNav('/'+subItem.path)">
                        <template slot="title">
                        <span>{{subItem.authName}}</span>
                        </template>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-aside>
        <el-main>
            <router-view></router-view>
        </el-main>
         </el-container>
        </el-container>
</template>
<script>
export default {
    data(){
        return{
            menuList:[],
            activePath:''
        }
    },
    created(){
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
        this.activePath = activePath

    },
    methods:{
    logout(){
        window.sessionStorage.clear();
        this.$router.push('/login');
    },
    async getMenuList(){
        const {data:res} = await this.$http.get('menus')
        if(res.meta.status !== 200)return this.$message.error('错误');
        this.menuList = res.data
    },
    saveNav(activePath){
        window.sessionStorage.setItem('activePath',activePath)
    }
    }
}
</script>
<style lang='less' scoped>
.home-container{
    height: 100%;
}
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    padding-left: 100px;

}
.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-button{
    margin: -8px;
}

.el-main{
    background-color: #eaedf1;
}
.left{
    color: white;
    font-size: 18px;
}




</style>