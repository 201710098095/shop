<template>
      <div class="container">
          <div class="box">
            <el-form ref='loginFormRef' :model='loginForm' :rules="loginRules" label-width="65px" class="login_form">
            <div class="title">登录</div>
                <el-form-item label="用户名" prop="username">
                  <el-input  type="text" prefix-icon="iconfont icon-user" v-model='loginForm.username'></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input  type="password" prefix-icon="iconfont icon-3702mima" v-model='loginForm.password'></el-input>
                </el-form-item>
                <el-form-item class="btn">
                  <el-button type="primary" @click="login">登录</el-button>
                  <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
          </div>
      </div>
</template>
<script>
export default {
  data() {
    return {
        loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
          username: [
              { required: true, message:"请输入用户名", trigger:"blur"},
              { min:3, max:10, message:"请输入长度在3-10位之间"}
          ],
          password: [
              { required: true, message:"请输入密码", trigger:"blur"},
              { min:6, max:15, message:"请输入长度在6-15位之间"}
          ]
      }
    }
  },
  methods:{
      reset(){
          this.$refs.loginFormRef.resetFields();
      },
      login(){
          this.$refs.loginFormRef.validate(async valid=>{
              if(!valid)return;
              const {data:res} =await this.$http.post('login',this.loginForm);
              if(res.meta.status !== 200)return this.$message.error('登陆失败');
              this.$message.success('登陆成功');
              window.sessionStorage.setItem('token',res.data.token);
              this.$router.push('/home');
          });
      }
  }
}
</script>

<style lang="less" scoped>
.container{
  background-color: #2b4b6b;
  height: 100%;
}

.box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 8px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -150px 0 0 -225px;
}

.title{
  font-size: 35px;
  color: gray;
  font-weight:bold;
  margin: 20px;
  margin-left: 160px;
}

.btn{
  float: right;
}

.login_form{
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;//向内收缩否则向外拉伸
  position: absolute;
  bottom: 20px;
}
</style>
