const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const static = require('koa-static');
const session = require("koa-session2");
const passport = require('koa-passport');
const log4js = require('log4js');
const path = require('path');
const routerInit = require('./router');
const connectDB = require('./tools/connectDB');
const randomStr = require('./tools/randomStr');

const port = 9000;
const app = new Koa();
const logger = log4js.getLogger();
logger.level = 'debug';

connectDB('mongodb://localhost:27017/ncw', { useNewUrlParser: true });

app.use(cors({
  origin: '*',
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(koaBody({
  multipart: true, // 允许解析'multipart/form-data'类型的文件
  formidable: {
    uploadDir: path.join(__dirname, 'public') // 设置文件上传保存路径
  }
}));

// 提供静态服务，可以直接访问这个目录里的资源
app.use(static(path.join(__dirname, './public/')));

app.keys = [ randomStr(128) ];
app.use(session({
  key: 'ncw:sess', // cookie中存储会话ID的字符串
  maxAge: 1000 * 60 * 60 * 3, // cookie的过期时间
  httpOnly: true
}));

app.use(passport.initialize());
app.use(passport.session());

routerInit(app);

app.on('error', (err, ctx) => {
  logger.error(err);
});

app.listen(port, () => {
  logger.info(`serve is running at port: ${port}`);
});
