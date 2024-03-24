const express = require('express')
const app = express();
// 몽고db 연결
const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
// css폴더를 server.js에 등록해두면 폴더안의 파일들 html에서 사용가능
app.use(express.static(__dirname + '/public'))
// view engine이 ejs라고 설정해줌
// html파일에 데이터를 넣고 싶으면 .ejs파일로 만들면 가능
// ejs파일은 전부 views폴더에 넣는게 룰임
app.set('view engine', 'ejs')

// req.body쓰려면 이코드 필요(꺼내쓰기 쉽게 해줌)
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false
}))

app.use(passport.session()) 

let db
//const url = 'mongodb+srv://geumji:geumji1234@geumji.njmuxzp.mongodb.net/?retryWrites=true&w=majority&appName=geumji'
// 스타벅스용 url
const url='mongodb://geumji:geumji1234@ac-k3j56hy-shard-00-00.njmuxzp.mongodb.net:27017,ac-k3j56hy-shard-00-01.njmuxzp.mongodb.net:27017,ac-k3j56hy-shard-00-02.njmuxzp.mongodb.net:27017/?ssl=true&replicaSet=atlas-r7hu42-shard-0&authSource=admin&retryWrites=true&w=majority&appName=geumji'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('NodeProject')
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
    })
}).catch((err)=>{
  console.log(err)
})



// __dirname : 절대경로
//sendFile : 파일보내주는 함수
app.get('/',(req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/news',(req, res) => {
    db.collection('post').insertOne({title : '어쩌구'})
    // res.send('오늘 비옴')
})

app.get('/shop',(req, res) => {
    res.send('쇼핑페이지입니다.')
})

app.get('/list', async (req, res) => {
  let result =  await db.collection('post').find().toArray()
  // await = 바로 다음줄 실행하지 말고 잠깐 기달려라 await은 async를 적어줘야 사용가능
    res.render('list.ejs',{ 글목록 : result})
}) 

app.get('/write',(req, res) => {
  res.render('write.ejs')
})

app.post('/add', async (req, res) => {
  console.log(req.body);

  try {
    if(req.body.title == '') {
      res.send('제목을 입력하세요');
    } else if(req.body.content =='') { 
      res.send('내용을 입력하세요');
    }else {
      await db.collection('post').insertOne({title: req.body.title, content:req.body.content});
      res.redirect('/list')
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('서버에러');
  }
})

app.get('/detail/:id', async (req, res)=>{
try {
  // findOne = document 1개 가져옴
 let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
 console.log(req.params);
 if(result == null) {
  res.status(404).send('잘못된 url접근')
 }
  res.render('detail.ejs',{result : result})
} catch (error) {
  console.log(error)
  res.status(404).send('잘못된 url접근')
}
})

app.get('/edit/:id', async (req, res) => {
  // 파라미터로 요청한 id에 해당하는 id를 db에서 찾아옴
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
  res.render('edit.ejs',{ result : result})
  console.log(result)
})

// 수정기능
app.put('/edit', async (req, res) => {
 // await db.collection('post').updateMany({like : {$gt : 10}}, 
                                                  //$gt는 Greater than약자임 >랑 같음
                                                  //$gte는 greater than or equal to 약자임 >=랑 같음
                                                  //$lt는 little than약자임 <랑 같음
                                                  //$lte는 little than or equal약자임 <=랑 같음
                                                  //$eq는 equal약자임 ==랑 같음
                                                  //$ne는 not equal약자임 !=랑 같음
                                                  // 바꾸고 싶은 대상의 조건을 줄 수 있음
   // {$inc :{like : -2 }} )
  //inc : 기존에 가지고 있는 값에 +/-하라는 뜻
  //mul : 기존에 가지고 있는 값에 곱하라는 뜻
  //unset : 기존에 가지고 있는 값을 삭제하라는 뜻(필드값삭제)
 
 
  try {
    // 파라미터로 요청한 id에 해당하는 id를 db에서 찾아옴
    await db.collection('post').updateOne({_id: new ObjectId(req.body.id)}, 
    {$set :{title : req.body.title, content:req.body.content}})
    console.log(req.body)
    res.redirect('/list')

  } catch (error) {
    console.log(error)
    res.status(404).send('잘못된 url접근')
  }
})

app.delete('/delete', async (req, res) => {
await db.collection('post').deleteOne({_id : new ObjectId(req.query.docid)})
res.send('삭제완료')
})

app.get('/list/:id', async (req, res) => {
  // .skip(5).limit(5). : 위에서부터 5개는 스킵하고 5개 가져오는 명령
  let result =  await db.collection('post').find().skip(5 * (req.params.id -1)).limit(5).toArray()
    res.render('list.ejs',{ 글목록 : result})
})

app.get('/list/next/:id', async (req, res) => {
  // .skip(5).limit(5). : 위에서부터 5개는 스킵하고 5개 가져오는 명령
  let result =  await db.collection('post')
  // _id가 이거보다 큰것만 다 찾아오라는 명령
  .find({_id : {$gt : new ObjectId(req.params.id)}})
  .limit(5).toArray()
    res.render('list.ejs',{ 글목록 : result})
})

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}))


app.get('/login', async (req, res) => {

    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
  passport.authenticate('local', (error, user, info)=>{
    if (error) return res.status(500).json(error)
    if (!user) return res.status(401).json(info.message)
    req.logIn(user, (error)=> {
      if(error) return next(error)
      res.redirect('/')
    })
  })(req, res, next)
  res.render('login.ejs')
})