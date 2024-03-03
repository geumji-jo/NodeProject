const express = require('express')
const app = express();
// 몽고db 연결
const { MongoClient, ObjectId } = require('mongodb');

// css폴더를 server.js에 등록해두면 폴더안의 파일들 html에서 사용가능
app.use(express.static(__dirname + '/public'))
// view engine이 ejs라고 설정해줌
// html파일에 데이터를 넣고 싶으면 .ejs파일로 만들면 가능
// ejs파일은 전부 views폴더에 넣는게 룰임
app.set('view engine', 'ejs')

// req.body쓰려면 이코드 필요(꺼내쓰기 쉽게 해줌)
app.use(express.json())
app.use(express.urlencoded({extended:true}))


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