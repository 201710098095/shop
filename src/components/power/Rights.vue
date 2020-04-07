<template>
    <div>
         <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
         <!-- 主体 -->
        <el-card>
            <!-- 信息列表 stripe隔行变色 border加上表格边框-->
            <el-table :data="list" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
                <el-table-column prop="path" label="路径" width="180"></el-table-column>
                <el-table-column prop="level" label="权限等级" width="180">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag v-if="scope.row.level === '1'"  type="success">二级</el-tag>
                        <el-tag v-if="scope.row.level === '2'"  type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

    </div>
</template>

<script>
export default {
    data(){
        return{
            list:[]
        }
    },
    created(){
        //获取所有
        this.getList()
    },
    methods:{
      async getList(){
            const {data:res} = await  this.$http.get('rights/list')
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            this.list = res.data
            console.log(res.data)
        }
    }
    
}
</script>

<style lang="less" scoped>


</style>