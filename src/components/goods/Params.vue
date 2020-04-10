<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
         <!-- 主体 -->
        <el-card>
            请选择三级商品分类
            <el-row class="cat_opt">
                <el-col>
                    <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="list" 
                    :props="cascadeProps" @change="handleChanged"> 
                    </el-cascader>
                </el-col>
            </el-row>

            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                     <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <!-- 添加块 -->
                           <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" >
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger"  icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                     </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                       <!-- 静态属性表格 -->
                     <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <!-- 添加块 -->
                           <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger"  icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                     </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 对话框 -->
         <el-dialog title="添加" :visible.sync="addDialogVisible" width="30%" @close='addDialogClosed'>
            <el-form ref="addFormRef" :model="addForm" label-width="100px" :rules="addFormRules">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="修改" :visible.sync="editDialogVisible" width="30%" @close='editDialogClosed'> 
            <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data(){
        return{
            list:[],
            //选择框的配置对象
            cascadeProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //选择框双向绑定的数组
            selectedKeys:[],
            activeName:'many',
            addDialogVisible:false,
            editDialogVisible:false,
            //参数数据
            manyTableData:{},
            onlyTableData:{},
            addForm:{
                attr_name:''
            },
            editForm:{
                attr_name:''
            },
            addFormRules:{
                attr_name:[{ required: true, message:"请输入分类名称", trigger:"blur"}]
            },
            editFormRules:{
                attr_name:[{ required: true, message:"请输入分类名称", trigger:"blur"}]
            },
        }

    },
    created(){
        //获取商品分类
        this.getList()

    },
    methods:{
        async getList(){
            const {data:res} = await  this.$http.get('categories/')
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            console.log(res.data)
            //获取列表
            this.list = res.data
        },
        //选中级联选项卡时触发
        handleChanged(){
           this.getParamsData()

        },
        //获取参数数据
       async getParamsData(){
            if(this.selectedKeys.length !== 3){
                this.selectedKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                params: {sel:this.activeName}
            })
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[]
                item.inputVisible = false
                item.inputValue = ''
            })
            console.log(res.data)
            if(this.activeName === 'many'){
                this.manyTableData = res.data
            }else{
                this.onlyTableData = res.data
            }
        },
        //点击tab选项卡后
        handleTabClick(){
            this.getParamsData()
        },
        //关闭对话框后清空原本输入的内容
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        addParams(){
            this.$refs.addFormRef.validate(async valid => {
            if(!valid)return
            const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                attr_name:this.addForm.attr_name,
                attr_sel:this.activeName
            })
            if(res.meta.status !== 201){return this.$message.error('失败');}
            this.$message.success('成功');
            console.log(res.data)
            this.getParamsData()
            this.addDialogVisible = false
            }) 
        },
        //修改对话框
       async showEditDialog(attr_id){
            //查询参数信息
            this.editDialogVisible = true
           const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{
                params: {attr_sel:this.activeName}
            })
             if(res.meta.status !== 200){return this.$message.error('失败');}
             this.editForm = res.data
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        editParams(){
            this.$refs.editFormRef.validate(async valid => {
            if(!valid)return
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                attr_name:this.editForm.attr_name,
                attr_sel:this.activeName
            })
             if(res.meta.status !== 200){return this.$message.error('失败');}
              this.getParamsData()
              this.editDialogVisible = false
             })
        },
       async removeParams(attr_id){
            const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
             if(res.meta.status !== 200){return this.$message.error('失败');}
             this.$message.success('成功')
             this.getParamsData()
        },
       async handleInputConfirm(row){
            if(row.inputValue.trim().length === 0){
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(' ')
            })
            if(res.meta.status !== 200){return this.$message.error('失败');}
        },
        //展示输入框
        showInput(row){
             row.inputVisible = true
             //自动获得焦点
             this.$nextTick(_ => {
             this.$refs.saveTagInput.$refs.input.focus();
        });
        },
       async handleClose(i,row){
            row.attr_vals.splice(i,1)
             const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(' ')
            })
            if(res.meta.status !== 200){return this.$message.error('失败');}


        }

    },
    computed:{
        //按钮是否被禁用
        isBtnDisabled(){
            if(this.selectedKeys.length !==3){
                return true
            }else{
                return false
            }
        },
        //选中的三级分类选项的id
        cateId(){
            if(this.selectedKeys.length == 3 ){
                return this.selectedKeys[2]
            }
            return null 
        },
        titleText(){
            if(this.activeName === 'many'){
                return '动态参数'
            }else{
                 return '静态属性'
            }
        }

    }
    
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 20px;
}
.el-tag{
    margin-right: 20px;
}
.input-new-tag{
    width: 120px;
}
</style>