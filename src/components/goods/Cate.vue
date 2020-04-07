<template>
    <div>
          <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
         <!-- 主体 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table class="treetable" :data="list" border show-index='true' :columns="columns" :selection-type='false' :expand-type='false'>
                <!-- 是否有效模板 -->
                <template slot="isok" slot-scope='scope'>
                    <i class="el-icon-success"  v-if='scope.row.cat_deleted === false' style="color:green"></i>
                    <i class="el-icon-error"  v-if='scope.row.cat_deleted === true' style="color:red"></i> 
                </template>
                <!-- 排序模板 -->
                 <template slot="order" slot-scope='scope'>
                    <el-tag  type="primary" v-if='scope.row.cat_level === 0'>一级</el-tag>
                    <el-tag  type="success" v-if='scope.row.cat_level === 1'>二级</el-tag>
                    <el-tag  type="warning" v-if='scope.row.cat_level === 2'>三级</el-tag>
                </template>
                 <!-- 操作模板 -->
                 <template slot="opt" slot-scope='scope'>
                    <el-button type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="removeUser(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
        
            <!-- 分页 -->
            <el-pagination @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" 
             :page-size="queryInfo.pagesize" layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
            
        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="40%">
                 <el-form ref="addFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules" ch>
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <!-- props指定配置对象 -->
                <el-form-item label="父级分类">
                    <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="parentList" 
                    :props="cascadeProps" @change="parentCateChanged" clearable> 
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改对话框 -->
         <el-dialog title="修改" :visible.sync="editDialogVisible" width="30%">
            <el-form ref="editFormRef" :model="editCateForm" label-width="70px" :rules="editCateFormRules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data(){
        return{
            //查询条件
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:2,
            },
            addCateForm:{
                cat_name:'',
                cat_pid:0,
                cat_level:0//默认是一级分类
            },  
            addCateFormRules:{
                 cat_name:[{ required: true, message:"请输入分类名称", trigger:"blur"}],
            },
            editCateForm:{                
                cat_name:'',
            },
            editCateFormRules:{
                 cat_name:[{ required: true, message:"请输入分类名称", trigger:"blur"}],
            },

            addDialogVisible:false,
            editDialogVisible:false,
            list:[],
            parentList:[],
            cascadeProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //选中的父级分类id数组
            selectedKeys:[],
            
            total:6,
            columns:[{
                label:'分类名称',
                prop:'cat_name'
            },{
                label:'是否有效',
                //将当前列定义为模板列
                type:'template',
                //当前列模板名称
                template:'isok'
            },
            {
                label:'排序',
                //将当前列定义为模板列
                type:'template',
                //当前列模板名称
                template:'order'
            },
            {
                label:'操作',
                //将当前列定义为模板列
                type:'template',
                //当前列模板名称
                template:'opt'
            }      ]

        }
    },
    created(){
        this.getList()
    },
    methods:{
       async getList(){
            const {data:res} = await  this.$http.get('categories',{params:this.queryInfo})
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            console.log(res.data)
            //获取列表
            this.list = res.data.result
            //获取总数
            this.total = res.data.total
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getList()
        },
        //展示添加分类对话框
        showAddDialog(){
            //先获取父级分类列表
            this.getParentCateList()
            this.addDialogVisible = true
        },
       async getParentCateList(){
           //获取父级type为2的分类的列表元素
             const {data:res} = await this.$http.get('categories',{params:{type:2}})
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            //填入
            this.parentList = res.data
            console.log(this.parentList)
        },
        //选项发生变化时
        parentCateChanged(){
            console.log(this.selectedKeys)
            //判断是否选中父级分类
            if(this.selectedKeys.length > 0){
                //父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                //等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            }else{
                 //父级分类的id
                this.addCateForm.cat_pid = 0
                //等级赋值
                this.addCateForm.cat_level = 0

            }
        },
        //添加新的分类
         addCate(){
            this.$refs.addFormRef.validate(async valid => {
            if(!valid)return
             const {data:res} = await this.$http.post('categories',this.addCateForm)
            if(res.meta.status !== 201){return this.$message.error('失败');}
            this.$message.success('成功');
            console.log(res.data)
            this.getList()
            this.addDialogVisible = false
            }) 
        },
        async showEditCateDialog(id){
            const {data:res} = await this.$http.get('/categories/'+id)
               if(res.meta.status !== 200){ return this.$message.error('查询失败！')}
               this.editCateForm = res.data
                this.editDialogVisible = true
        },
       editCate(){
            this.$refs.editFormRef.validate(async valid => {
            if(!valid)return//校验不通过
            //通过 发起请求
            console.log(this.editCateForm.cat_id)
            console.log(this.editCateForm.cat_name)
            const {data:res} = await this.$http.put('categories/'+this.editCateForm.cat_id,{cat_name:this.editCateForm.cat_name})
            if(res.meta.status !== 200){return this.$message.error('失败');}
            this.$message.success('成功');
             this.getList()
            console.log(res)

            this.editDialogVisible = false
        })},
       async removeUser(id){
           console.log(id)
           const {data:res} = await this.$http.delete('categories/'+id)
           if(res.meta.status !== 200){return this.$message.error('失败');}
            this.$message.success('成功');
            this.getList()
        }


    }
    
}
</script>

<style lang="less" scoped>
.treetable{
    margin-top: 20px;
}
.el-cascader{
    width: 100%;
}


</style>