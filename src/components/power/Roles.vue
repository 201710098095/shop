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
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
        <!-- 信息列表 stripe隔行变色 border加上表格边框-->
            <el-table :data="list" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope"> 
                        <el-row v-for="item1 in scope.row.children" :key="item1.id" class="center">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close='rm(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级权限 -->
                            <el-col :span="19">   
                                <el-row v-for="item2 in item1.children" :key="item2.id" class="center">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close='rm(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning"  v-for="item3 in item2.children" :key="item3.id" closable @close='rm(scope.row,item3.id)'>{{item3.authName}}</el-tag>
                                    </el-col>   
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>

                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300">
                        <template slot-scope="scope"> 
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)">删除</el-button>
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetDialog(scope.row)" @close='setRightClosed'>分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    
<!-- 提示框 -->
<el-dialog title="分配权限" :visible.sync="setDialogVisible" width="30%">
    <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
<el-dialog title="提示" :visible.sync="addDialogVisible" width="30%">
            <el-form ref="addFormRef" :model="addForm" label-width="70px" :rules="addFormRules">
                <el-form-item label="角色信息" prop="roleName">
                    <el-input v-model="addForm.roleName" clearable></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="30%" @close='editDialogClosed'>
            <el-form ref="editFormRef" :model="editForm
            " label-width="70px" :rules="editFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName" clearable></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            list:[],
            rightList:[],
             editForm:{
                roleName:'',
                roleDesc:''
            },
            defKeys:[],
            treeProps:{
                label:'authName',
                children:'children'
            },
             addForm:{
                roleName:'',
                roleDesc:''
            },
            //即将分配权限的角色id
            roleId:'',
            addDialogVisible:false,
            editDialogVisible:false,
            setDialogVisible:false,
            editFormRules:{
                roleName:[{ required: true, message:"请输入角色名称", trigger:"blur"}],
                roleDesc:[{ required: true, message:"请输入角色描述", trigger:"blur"}]
            },
            addFormRules:{
                roleName:[{ required: true, message:"请输入邮箱", trigger:"blur"}],
                roleDesc:[{ required: true, message:"请输入手机", trigger:"blur"}]
            }

        }
    },
    created(){
        //获取列表
        this.getList()
            
    },
    methods:{
        async getList(){
            const {data:res} = await  this.$http.get('roles')
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            this.list = res.data
            console.log(res.data)
        },
        //关闭对话框后重置值
        editDialogClosed(){
                this.$refs.resetFields()
            },
            //弹出对话框
        async showEditDialog(id){
                const {data:res} = await this.$http.get('/roles/'+id)
               if(res.meta.status !== 200){ return this.$message.error('查询失败！')}
               this.editForm = res.data
               this.editDialogVisible = true
               console.log(id)
                console.log(this.editForm)

            },
            //判断是不是三级节点 每层做递归
            getLeafKeys(node, arr){
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item => 
                    this.getLeafKeys(item,arr))
            },
            
            //分配权限对话框
            async showSetDialog(role){
                this.roleId = role.id
                const {data:res} = await this.$http.get('rights/tree')
               if(res.meta.status !== 200){ return this.$message.error('查询失败！')}
               //保存权限数据
               this.rightList = res.data
               console.log(res.data)
               //获取id
               this.getLeafKeys(role,this.defKeys)
                this.setDialogVisible = true
            },
             //添加用户
        addRole(){
                    this.$refs.addFormRef.validate(async valid => {
                    console.log(this.addForm)
                    if(!valid)return
                    const {data:res} = await this.$http.post('roles',this.addForm)
                    if(res.meta.status !== 201){ this.$message.error('添加失败！')}
                    this.$message.success('添加成功！')
                    //隐藏对话框
                    this.addDialogVisible = false
                    this.getList()
                })
            },
            //修改信息
            editRole(){
            //先表单预验证
            this.$refs.editFormRef.validate(async valid => {
                console.log(this.editForm)
                    if(!valid)return//校验不通过
                    //通过 发起请求
                    const {data:res} = await this.$http.put('roles/'+this.editForm.roleId,{
                        roleName:this.editForm.roleName,
                        roleDesc:this.editForm.roleDesc
                    })
                    
                    if(res.meta.status !== 200){ return this.$message.error('修改失败！')}

                    //隐藏对话框
                    this.editDialogVisible = false
                    this.getList()  
                    this.$message.success('修改成功！')
            })
            },
            async removeUser(id){
                const {data:res} = await this.$http.delete('roles/'+id)
                    if(res.meta.status !== 200){ return this.$message.error('删除失败！')}
                    this.$message.success('删除成功！') 
                    this.getList()  
            },
            //分配权限关闭时
            setRightClosed(){
                this.defKeys=[] 
            },
            //删除权限
           async rm(role,rightId){
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                    if(res.meta.status !== 200){ return this.$message.error('删除失败！')}
                    role.children = res.data
                    this.$message.success('删除成功！') 
            },
           async allotRights(){
                const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()
                ] 
                               console.log(keys)    

                const idStr = keys.join(',')
               const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})  
               console.log(res)    
                   if(res.meta.status !== 200){ return this.$message.error('分配权限失败！')}
                    this.$message.success('分配权限成功！')

                    this.getList()
                    this.setDialogVisible = false
                }
    }
    
}
</script>

<style lang="less" scoped>
.el-tag{
    margin-top: 15px;
    margin-left: 10px;
}
.center{
    display: flex;
    align-items: center;
}


</style>