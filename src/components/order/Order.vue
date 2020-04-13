<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">订单管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">订单列表</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- 主体 -->
        <el-card>
            
            <!-- 信息列表 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="order_number" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column prop="pay_status" label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
                        <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货">
                    <template slot-scope="scope">
                        {{scope.row.is_send}}
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                    
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope"> 
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
             <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" 
             :page-size="queryInfo.pagesize" layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 地址对话框 -->
        <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="30%" @close='editDialogClosed'>
            <el-form ref="editFormRef" :model="editForm" label-width="90px" :rules="editFormRules">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="editForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editForm.address2" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="edit">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="30%" @close='editDialogClosed'>
             <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
            <span slot="footer" class="dialog-footer">
                <el-button @click="progressVisible = false">取 消</el-button>
                <el-button type="primary" @click="progressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import cityData from './citydata.js'

export default {
    data(){
        return{
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10,
            },
            total:0,
            orderlist:[],
            editDialogVisible:false,
            editForm:{
                address1:[],
                address2:''
            },
            editFormRules:{
                address1:[{ required: true, message:"请选择省市区/县", trigger:"blur"}],
                address2:[{ required: true, message:"请输入详细地址", trigger:"blur"}]
            },
            cityData,
            progressVisible:false,
            progressInfo:[],

        }
    },
    created(){
        this.getList()

    },
    methods:{
        async getList(){
           const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
           if(res.meta.status !== 200)return this.$message.error('错误');
            this.orderlist = res.data.goods
            this.total = res.data.total
             console.log(this.orderlist)
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
        showEditDialog(){
            this.editDialogVisible = true

        },
        editDialogClosed(){
                 this.$refs.editFormRef.resetFields()
        },
       async showProgressBox(){
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            if(res.meta.status !== 200)return this.$message.error('错误');
            this.progressInfo = res.data
            this.progressVisible = true
            console.log(this.progressInfo)

        }

            
        
    }
    
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';


</style>