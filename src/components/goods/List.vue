<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">商品列表</el-breadcrumb-item>
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
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>                          
            </el-row>
             <!-- 信息列表 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="95px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="75px"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="170px">
                    <template slot-scope="scope"> 
                       {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template slot-scope="scope"> 
                        <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
             <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" 
             :page-size="queryInfo.pagesize" layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改对话框 -->
         <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close='editDialogClosed'>
            <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品价格（元）" prop="goods_price">
                    <el-input v-model="editForm.goods_price" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editForm.goods_weight" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            addDialogVisible:false,
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            goodslist:[],
            total:0,
            editDialogVisible:false,
            editForm:{},
            editFormRules:{},



        }
    },
    created(){
        this.getList()

    },
    methods:{
       async getList(){
           const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
           if(res.meta.status !== 200)return this.$message.error('错误');
            this.goodslist = res.data.goods
            this.total = res.data.total
        },
        //分页
       handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getList()
        },
        //编辑
        async showEditDialog(id){
                const {data:res} = await this.$http.get('goods/'+id)
               if(res.meta.status !== 200){ return this.$message.error('查询失败！')}
               this.editForm = res.data
               this.editDialogVisible = true
            },
            editDialogClosed(){
                this.$refs.resetFields()
            },
            //删除
         async removeGoods(id){
                const {data:res} = await this.$http.delete('goods//'+id)
                    if(res.meta.status !== 200){ return this.$message.error('删除失败！')}
                    this.$message.success('删除成功！') 
                    this.getList()  
            },
        editGoods(){
            this.$refs.editFormRef.validate(async valid => {
                    if(!valid)return//校验不通过
                    //通过 发起请求
                    const {data:res} = await this.$http.put('goods/'+this.editForm.id,{
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
        goAddpage(){
            this.$router.push('/goods/add')
        }
        
    }
    
}
</script>

<style lang="less" scoped>


</style>