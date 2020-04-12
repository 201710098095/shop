<template>
    <div>
        <!-- 导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/' }">添加商品</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- 主体 -->
        <el-card>
            <el-steps :space="200"  :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                 <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 标签栏 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
             <el-tabs v-model="activeIndex" :tab-position="'left'" style="margin-top:50px;" :before-leave='beforeTabLeave' @tab-click='tabClicked'>
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name" clearable></el-input>
                    </el-form-item>
                     <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" clearable type="number"></el-input>
                    </el-form-item>
                     <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" clearable type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品名称" prop="goods_number">
                        <el-input v-model="addForm.goods_number" clearable type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals" clearable></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" 
                        :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" @click="add">添加商品</el-button>


                </el-tab-pane>
            </el-tabs>
            </el-form>

        </el-card>
        <!-- 图片预览框 -->
         <el-dialog title="图片预览" :visible.sync="previewVisible" width="30%">
            <img :src="previewPath" alt="">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    data(){
        return {
            activeIndex:0,
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[],
                pics:[],
                goods_introduce:'',
                attrs:[]
            },
            addFormRules:{
                goods_name:[{ required: true, message:"请输入商品名称", trigger:"blur"}],
                goods_price:[{ required: true, message:"请输入商品价格", trigger:"blur"}],
                goods_weight:[{ required: true, message:"请输入商品重量", trigger:"blur"}],
                goods_number:[{ required: true, message:"请输入商品数量", trigger:"blur"}],
                goods_cat:[{ required: true, message:"请选择商品分类", trigger:"blur"}],
            },
            //商品分类列表
            catelist:{},
            //级联列表属性
            cateProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            //动态列表数据
            manyTableData:[],
            //静态列表数据
            onlyTableData:[],
            //图片上传组件的请求头对象
            headerObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            //预览图片的url
            previewPath:'',
            previewVisible:false
        }
    },
    created(){
         //获取商品分类列表
        this.getCateList();

    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            this.catelist = res.data
            console.log(this.catelist)
        },
        handleChange(){
            if(this.addForm.goods_cat.length !== 3){
                //没有选中三级分类
                this.addForm.goods_cat = []
            }
        },
        beforeTabLeave(activeName,oldActiveName){
            //如果没有选择分类不能进入下个tab
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                this.$message.error('请选择分类！')
                return false
            }
        },
        //点击下一个tab时提交信息
       async tabClicked(){
           console.log(this.activeIndex)//对应tab的name

           if(this.activeIndex === '1'){
               //说明是动态面板
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            //给属性的每一项分割成数组
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            })
            this.manyTableData = res.data
           }else if((this.activeIndex === '2')){
               //说明是静态属性面板
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
            if(res.meta.status !== 200)return this.$message.error('获取失败');
            this.onlyTableData = res.data
           }
        },
        //图片预览效果
        handlePreview(file){
            console.log(file)
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        //图片移除操作
        handleRemove(file){
            const filePath = file.response.data.tmp_path
            const i = this.addForm.pics.findIndex(x => x.pic === filePath)
            this.addForm.pics.splice(i,1)
            console.log(this.addForm)
        },
        //上传成功
        handleSuccess(response){
            //拼接对象
            const picInfo = {pic:response.data.tmp_path}//临时图片路径
            //添加到数组中
            this.addForm.pics.push(picInfo)
            console.log(this.addForm)
        },
        //添加商品
        add(){
            this.$refs.addFormRef.validate(async valid => {
                    if(!valid){return this.$message.error('请填写完整！')}
                   const form =  _.cloneDeep(this.addForm)
                    form.goods_cat = form.goods_cat.join(',')
                    //处理动态数据
                    this.manyTableData.forEach(item => {
                        const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
                        this.addForm.attrs.push(newInfo)
                    })
                    //处理静态数据
                     this.onlyTableData.forEach(item => {
                        const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs = this.addForm.attrs

                    //提交商品数据                    
                    const {data:res} = await this.$http.post('goods',form)
                    if(res.meta.status !== 201){ this.$message.error('添加失败！')}
                    this.$message.success('添加成功！')
                    this.$router.push('/goods')
                    })
        }



    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
    
}
</script>

<style lang="less" scoped>
.el-checkbox{
    margin: 0 10px 0 0 ;
}
img{
    width: 100%;
}
.el-button{
    margin-top:15px ;
}



</style>