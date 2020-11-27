const express = require('express')
const app = express()
const PORT = 7000
const bodyParser = require('body-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const fs = require('fs')
const handlebars = require('handlebars')
const mysql = require('mysql')

require('dotenv').config()
app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(express.static('public'))

const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
    port: 3306
})

db.connect((err)=>{
    if(err){
        console.log(err)
    }
    console.log("berhasil")
})

app.get('/',(req,res)=>{
    res.send('<h1>ini homepage</h1>')
})


// =================================================== NOMOR 1 ==================================================

app.get('/movielist', (req,res)=>{
    let sql = 'SELECT * from movies'
    db.query(sql, (err, movielist)=>{
        if(err) res.status(500).send(err)
        return res.send(movielist)
    })
})

app.post('/editmovie/:id', (req,res)=>{
    let data = req.body
    const {id}= req.params
    let sql = `select * from movies where id = ${db.escape(id)}`
    db.query(sql, (err, results)=>{
        if(err) res.status(500).send(err)

        if (results.length){
            sql = `update movies set ? where id = ${db.escape(id)}`
            db.query(sql, data, (err)=>{
                if(err) res.status(500).send(err)
                sql = 'SELECT * from movies'
                db.query(sql, (err, movielist)=>{
                    if(err) res.status(500).send(err)
                    return res.send(movielist)
                })
            })
        }else{
            return res.status(500).send('film tidak ada')
        }
    })
})

app.delete('/deletemovie/:id',(req, res)=>{
    let {id}= req.params
    let sql = `delete from movies where id = ${id}`
    db.query(sql, (err, data)=>{
        if(err) {
            console.log(err) 
            return res.status(500).send(err)  
        } 
        sql = `delete from movcat where idmovie = ${id}`
        db.query(sql, (err)=>{
            sql = 'SELECT * from movies'
            db.query(sql, (err, movielist)=>{
                if(err) {
                    console.log(err) 
                    return res.status(500).send(err)  
                }
                let sql = 'select m.nama as nama_film, c.nama as nama_category from movies m join movcat mc on mc.idmovie=m.id join categories c on mc.idcategory=c.id;'
                db.query(sql, (err, dataconection)=>{
                    if(err) {
                        console.log(err) 
                        return res.status(500).send(err)  
                    }
                    return res.status(200).send({dataconection, movielist})
                })
            })
        })
    })
})

app.post('/addmovie', (req,res)=>{
    let data = req.body
    let sql = `insert into movies set ?`
        db.query(sql,data,(err)=>{
                if(err) return res.status(500).send(err)
                sql = `select * from movies`
                db.query(sql,(err,results)=>{
                    if(err)return res.status(500).send(err)
                    return res.status(200).send(results)
                })
        })
})

app.delete('/deletecategory/:id',(req, res)=>{
    let {id}= req.params
    let sql = `delete from categories where id = ${id}`
    db.query(sql, (err, data)=>{
        if(err) {
            console.log(err) 
            return res.status(500).send(err)  
        } 
        sql = `delete from movcat where idcategory = ${id}`
        db.query(sql, (err)=>{
            sql = 'SELECT * from categories'
            db.query(sql, (err, category)=>{
                if(err) {
                    console.log(err) 
                    return res.status(500).send(err)  
                }
                let sql = 'select m.nama as nama_film, c.nama as nama_category from movies m join movcat mc on mc.idmovie=m.id join categories c on mc.idcategory=c.id;'
                db.query(sql, (err, dataconection)=>{
                    if(err) {
                        console.log(err) 
                        return res.status(500).send(err)  
                    }
                    return res.status(200).send({dataconection, category})
                })
            })
        })
    })
})



// =================================================== NOMOR 2 ==================================================


app.get('/catelist', (req,res)=>{
    let sql = 'SELECT * from categories'
    db.query(sql, (err, catelist)=>{
        if(err) res.status(500).send(err)
        return res.send(catelist)
    })
})

app.post('/editcategory/:id', (req,res)=>{
    let data = req.body
    const {id}= req.params
    let sql = `select * from categories where id = ${db.escape(id)}`
    db.query(sql, (err, results)=>{
        if(err) res.status(500).send(err)

        if (results.length){
            sql = `update categories set ? where id = ${db.escape(id)}`
            db.query(sql, data, (err)=>{
                if(err) res.status(500).send(err)
                sql = 'SELECT * from categories'
                db.query(sql, (err, movielist)=>{
                    if(err) res.status(500).send(err)
                    return res.send(movielist)
                })
            })
        }else{
            return res.status(500).send('category tidak ada')
        }
    })
})

app.post('/addcategory', (req,res)=>{
    let data = req.body
    let sql = `insert into categories set ?`
        db.query(sql,data,(err)=>{
                if(err) return res.status(500).send(err)
                sql = `select * from categories`
                db.query(sql,(err,results)=>{
                    if(err)return res.status(500).send(err)
                    return res.status(200).send(results)
                })
        })
})

app.delete('/deleteconnection/:id',(req, res)=>{
    let {id}= req.params
    let sql = `delete from movcat where id = ${id}`
    db.query(sql, (err, data)=>{
        if(err) {
            console.log(err) 
            return res.status(500).send(err)  
        } 

        sql = 'select m.nama as nama_film, c.nama as nama_category from movies m join movcat mc on mc.idmovie=m.id join categories c on mc.idcategory=c.id;'
        db.query(sql, (err, dataconection)=>{
            if(err) {
                console.log(err) 
                return res.status(500).send(err)  
            }
            return res.status(200).send(dataconection)
        })
        
    })
})






// =================================================== NOMOR 3 ==================================================

app.get('/connection', (req,res)=>{
    let sql = 'select m.nama as nama_film, c.nama as nama_category from movies m join movcat mc on mc.idmovie=m.id join categories c on mc.idcategory=c.id;'
    db.query(sql, (err, data)=>{
        if(err) res.status(500).send(err)
        return res.send(data)
    })
})

app.post('/addconnection', (req, res)=>{
    let data = req.body
    const {idmovie, idcategory} = data
    console.log(idmovie, idcategory)
    let sql = `insert into movcat set ?`
        db.query(sql,data,(err)=>{
                if(err) return res.status(500).send(err)
                sql = 'select m.nama as nama_film, c.nama as nama_category from movies m join movcat mc on mc.idmovie=m.id join categories c on mc.idcategory=c.id;'
                db.query(sql,(err,results)=>{
                    if(err)return res.status(500).send(err)
                    return res.status(200).send(results)
                })
        })
})















app.listen(PORT, ()=>{
    console.log('aktif di port: ', PORT)
})