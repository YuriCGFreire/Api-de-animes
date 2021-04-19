create table if not exists users(
    id int unsigned not null auto_increment,
    nome varchar(200) not null,
    email varchar(200) not null, 
    senha varchar(100) not null,
    unique key(email),
    primary key(id)
);