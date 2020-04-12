<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">用户管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 主体 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input  placeholder="请输入内容" v-model="queryInfo.query">
                    <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>                          
            </el-row>
        <!-- 信息列表 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名" width="180"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
                <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
                <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
                <el-table-column label="状态" width="180">
                    <template slot-scope="scope">
                        <el-switch v-model='scope.row.mg_state' @change="stateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope"> 
                        <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" 
             :page-size="queryInfo.pagesize" layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
            <!-- 对话框 -->
            <el-dialog title="分配角色" :visible.sync="setDialogVisible" width="50%" @close='setRoleDialogClosed'>
                <div>
                    <p>当前用户：{{userinfo.username}}</p>
                     <p>当前角色：{{userinfo.role_name}}</p>
                     <p>分配新角色：
                         <el-select v-model="selectedRoleId" placeholder="请选择">
                             <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                         </el-select>
                     </p>
                </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%">
            <el-form ref="addFormRef" :model="addForm" label-width="70px" :rules="addFormRules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" clearable></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email" clearable></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="30%" @close='editDialogClosed'>
            <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" clearable></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
    </div> 
</template>

<script>
export default {
    data(){
        return {
            queryInfo:{
                query:'',
                pagenum: 1,//页数
                pagesize: 4//每页数量
            },
            userList:[],
            rolesList:[],
            total:0,
            addDialogVisible:false,
            editDialogVisible:false,
            setDialogVisible:false,
            //分配的用户信息
            userinfo:{},
            //已选中的角色id值
            selectedRoleId:'',
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            editForm:{
                username:'',
                email:'',
                mobile:''
            },
            addFormRules:{
                username:[{ required: true, message:"请输入用户名", trigger:"blur"},
              { min:3, max:10, message:"请输入长度在3-10位之间"}],
                password:[{ required: true, message:"请输入密码", trigger:"blur"},
              { min:6, max:15, message:"请输入长度在6-15位之间"}],
              email:[{ required: true, message:"请输入邮箱", trigger:"blur"}],
              mobile:[{ required: true, message:"请输入手机号", trigger:"blur"}]

            },
            editFormRules:{
                email:[{ required: true, message:"请输入邮箱", trigger:"blur"}],
                mobile:[{ required: true, message:"请输入手机", trigger:"blur"}]
            }
        }
    },
    created(){
        this.getList()
    },
    methods:{
        async getList(){
           const {data:res} = await this.$http.get('users',{params:this.queryInfo})
           if(res.meta.status !== 200)return this.$message.error('错误');
            this.userList = res.data.users
            this.total = res.data.total
        },
        //每页数量改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getList()
        },
        //页码改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getList()
        },
        //状态改变 put传给后端
        async stateChange(userinfo){
            const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status !== 200){
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('错误');
                }
                return this.$message.success('更新成功');
        },
        //添加用户
        addUser(){
                    this.$refs.addFormRef.validate(async valid => {
                    if(!valid)return
                    const {data:res} = await this.$http.post('users',this.addForm)
                    if(res.meta.status !== 201){ this.$message.error('添加失败！')}
                    this.$message.success('添加成功！')
                    //隐藏对话框
                    this.addDialogVisible = false
                    this.getList()
                })
            },
            //弹出修改信息的对话框
        async showEditDialog(id){
                const {data:res} = await this.$http.get('/users/'+id)
               if(res.meta.status !== 200){ return this.$message.error('查询失败！')}
               this.editForm = res.data
               this.editDialogVisible = true
            },
            //关闭对话框后重置值
        editDialogClosed(){
                this.$refs.resetFields()
            },
            //修改用户
        editUser(){
            //先表单预验证
            this.$refs.editFormRef.validate(async valid => {
                    if(!valid)return//校验不通过
                    //通过 发起请求
                    const {data:res} = await this.$http.put('users/'+this.editForm.id,{
                        email:this.editForm.email,
                        mobile:this.editForm.mobile
                    })
                    console.log(this.editForm.id)
                    if(res.meta.status !== 200){ return this.$message.error('修改失败！')}
                    //隐藏对话框
                    this.editDialogVisible = false
                    this.getList()  
                    this.$message.success('修改成功！')
            })
            },
            //删除用户
           async removeUser(id){
                const {data:res} = await this.$http.delete('users/'+id)
                    if(res.meta.status !== 200){ return this.$message.error('删除失败！')}
                    this.$message.success('删除成功！') 
                    this.getList()  
            },
            //查找分配角色值
           async setRole(userinfo){
                this.userinfo = userinfo
                const {data:res} = await this.$http.get('roles')
                if(res.meta.status !== 200){ return this.$message.error('失败！')}
                this.rolesList = res.data
                this.setDialogVisible = true
            },
           async saveRoleInfo(){
               if(!this.selectedRoleId){
                   return this.$message.error('请选择分配的角色！')
               }
                const {data:res} = await this.$http.put(`users/${this.userinfo.id}/role`,{rid:this.selectedRoleId})
                                console.log(res)

                if(res.meta.status !== 200){ return this.$message.error('失败！')}
                console.log(res)
                this.getList()
                this.setDialogVisible = false


            },
            setRoleDialogClosed(){
                this.selectedRoleId = ''
                this.userinfo = ''
            }
        }
}
</script>

<style lang="stylus" scoped>


</style>