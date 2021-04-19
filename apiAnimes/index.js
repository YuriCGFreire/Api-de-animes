const express = require('express')
const databaseAnimes = require('./database/database')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require("jsonwebtoken")

//Configurando o cors
app.use(cors())

//A chave do token. Essa informação não deve ser passada pois com ela podem ser criados tokens falsos
const JWTsecret = 'dkopdhudufihuifpkdmiuh'

//Middleware de autorização
function auth(req, res, next){
    const authToken = req.headers['authorization']
    if(authToken != undefined){
        var token = authToken.split(' ')[1]
        jwt.verify(token, JWTsecret, (err, data) => {
            if(err){
                res.status(401)
                res.json({ err: "Token Inválido" })
            }else{
                req.token = token
                req.loggedUser = {id: data.id, email: data.email, nome: data.nome}
                next()
            }
        })
    }else{
        res.status(401)
        res.json({ err: "Token inválido" })
    }
}

//Configurando o bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
//Primeira rota da APi
app.get("/animes", auth,(req, res) => { //Lista os animes cadastrados
    databaseAnimes.select().table("animes")
        .then(data => {
            res.statusCode = 200
            res.json({ animes: data })
        }).catch(err => {
            res.json(err)
        })
})

//rota de autenticação
app.post("/auth", async (req, res) => {
    var {email, senha} = req.body
    if(email != undefined){
        var user = await databaseAnimes.select().table("users").where("email", email).first()
        if(user != undefined){
            if(user.senha == senha){
                jwt.sign({id: user.id, email: user.email, nome: user.nome}, JWTsecret, {expiresIn: '48h'}, (err, token) => {
                    if(err){
                        res.status(400)
                    }else{
                        res.status(200)
                        res.json({ token: token })
                    }
                })
            }else{
                res.status(401)
                res.json({ err: "Falha interna" })  
            }
        }else{
            res.status(401)
            res.json({ err: "Email ou senha inválido" })
        }    
    }else{
        res.status(400)
        res.json({ err: "Email ou senha inválido" })
    }
})

app.get("/anime/:id", auth,(req, res) => { //Busca anime pelo id
    if(isNaN(req.params.id)){
        res.sendStatus(400)
    } else {
        var id = parseInt(req.params.id)
        databaseAnimes.select().table("animes").where("id", id)
            .then(data => {
                data.length == 0 ? res.sendStatus(404) : res.json(data)
            }).catch(err => res.json(err))
        }
})

app.post("/anime", auth,(req, res) => { //Salva um anime
    var {nome, autor, estudio} = req.body
    databaseAnimes.insert({nome, autor, estudio}).table("animes")
        .then(() => res.sendStatus(200))
        .catch(err => res.json(err))
})

app.put("/anime/:id", auth,async (req, res) => { //Atualiza as informações de um anime
    if(isNaN(req.params.id)){
        res.sendStatus(400)
    }else{
        var id = parseInt(req.params.id)
        var anime = await databaseAnimes.select().table("animes").where("id", id)
        if(anime.length == 0){
            res.sendStatus(204)
        }else{
            var {nome, autor, estudio} = req.body

            nome == '' || nome == undefined || nome == null ? nome = anime.nome : nome = nome
            autor == '' || autor == undefined || autor == null ? autor = anime.autor : autor = autor
            estudio == '' || estudio == undefined || estudio == null ? estudio = anime.estudio : estudio = estudio 

            databaseAnimes.update({nome, autor, estudio}).table("animes").where("id", id)
                .then(() => res.sendStatus(200))
                .catch(err => res.json(err))
        }
    }
})

app.delete("/anime/:id", auth,async (req, res) => { //Deleta um anime
    if(isNaN(req.params.id)){
        res.sendStatus(400)
    }else {
        var id = req.params.id
        var anime = await databaseAnimes.select().table("animes").where("id", id)
        if(anime.length == 0){
            res.sendStatus(204)
        }else{
            databaseAnimes.where("id", id).table("animes").del()    
                .then(() => res.sendStatus(200))
                .catch(err => res.json(err))
        }
    }
})

app.listen(45678, () => {
    console.log("Api rodando!")
})